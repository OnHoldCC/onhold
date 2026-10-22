"""Private PostgreSQL snapshots: 24 hourly slots and 7 daily slots, in UTC."""
import base64
import datetime as dt
import hashlib
import json
import os
import pathlib
import re
import signal
import subprocess
import tempfile
import threading
import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer

STATUS = pathlib.Path('/tmp/postgres-backup-status.json')
STOP = threading.Event()


class BackupError(Exception):
    pass


def slots(now, scope=None, prefix='postgres'):
    now = now.astimezone(dt.timezone.utc)
    if scope not in (None, 'mainnet', 'testnet'):
        raise BackupError('invalid database backup scope')
    if not re.fullmatch(r'[a-z0-9-]+(?:/[a-z0-9-]+)*', prefix):
        raise BackupError('invalid backup object prefix')
    prefix += '/' + scope if scope else ''
    return f'{prefix}/hourly/{now.hour:02d}.dump.age', f'{prefix}/daily/{now.weekday()}.dump.age'


def database_targets(values):
    raw = values.get('BACKUP_DATABASE_NAMES')
    if not raw:
        return [values]
    names = json.loads(raw)
    if (not isinstance(names, dict) or set(names) != {'mainnet', 'testnet'}
            or any(not isinstance(name, str) or not re.fullmatch(r'[a-z][a-z0-9_]{0,62}', name) for name in names.values())
            or names['mainnet'] == names['testnet']):
        raise BackupError('invalid mainnet/testnet backup database names')
    url = urllib.parse.urlsplit(values['BACKUP_DATABASE_URL'])
    return [{**values, 'BACKUP_SCOPE': scope, 'BACKUP_DATABASE_URL': url._replace(path='/' + name).geturl()}
            for scope, name in sorted(names.items())]


def record_status(status):
    temporary = STATUS.with_suffix('.tmp')
    temporary.write_text(json.dumps(status))
    temporary.replace(STATUS)


def file_hash(path, algorithm):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, algorithm).digest()


def database_environment(values):
    url = urllib.parse.urlsplit(values['BACKUP_DATABASE_URL'])
    if url.scheme not in ('postgres', 'postgresql') or url.hostname != values['BACKUP_DATABASE_INTERNAL_HOST']:
        raise BackupError('database host must match its explicit private service pin')
    if not url.username or not url.password or not url.path.strip('/'):
        raise BackupError('incomplete database configuration')
    return {**values, 'PGHOST': url.hostname, 'PGPORT': str(url.port or 5432),
            'PGUSER': urllib.parse.unquote(url.username), 'PGPASSWORD': urllib.parse.unquote(url.password),
            'PGDATABASE': url.path[1:], 'PGSSLMODE': 'disable',
            'PGOPTIONS': '-c default_transaction_read_only=on -c statement_timeout=300000',
            'PGCONNECT_TIMEOUT': '10'}


def run(args, environment, label):
    result = subprocess.run(args, env=environment, capture_output=True, timeout=600)
    if result.returncode:
        raise BackupError(label)
    return result.stdout


class Storage:
    def __init__(self, values):
        endpoint = urllib.parse.urlsplit(values['BACKUP_R2_ENDPOINT'])
        if endpoint.scheme != 'https' or not endpoint.hostname or not endpoint.hostname.endswith('.r2.cloudflarestorage.com'):
            raise BackupError('invalid R2 HTTPS endpoint')
        if endpoint.path not in ('', '/') or endpoint.query or endpoint.username:
            raise BackupError('R2 endpoint must be an origin')
        self.bucket = values['BACKUP_R2_BUCKET']
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]{1,61}[a-z0-9]', self.bucket):
            raise BackupError('invalid private backup bucket')
        self.environment = {**values, 'AWS_ACCESS_KEY_ID': values['BACKUP_R2_ACCESS_KEY_ID'],
                            'AWS_SECRET_ACCESS_KEY': values['BACKUP_R2_SECRET_ACCESS_KEY'],
                            'AWS_DEFAULT_REGION': 'auto', 'AWS_MAX_ATTEMPTS': '3',
                            'AWS_RETRY_MODE': 'standard', 'AWS_PAGER': ''}
        self.base = ['aws', '--endpoint-url', values['BACKUP_R2_ENDPOINT'], '--cli-connect-timeout', '10',
                     '--cli-read-timeout', '60', 's3api']

    def head(self, key):
        result = subprocess.run(self.base + ['head-object', '--bucket', self.bucket, '--key', key],
                                env=self.environment, capture_output=True, timeout=180)
        if result.returncode == 0:
            return json.loads(result.stdout)
        if b'(404)' in result.stderr or b'Not Found' in result.stderr or b'NoSuchKey' in result.stderr:
            return None
        raise BackupError('R2 object metadata unavailable')

    def upload(self, key, archive, metadata, md5):
        run(self.base + ['put-object', '--bucket', self.bucket, '--key', key, '--body', str(archive),
                        '--content-type', 'application/octet-stream', '--content-md5', md5,
                        '--metadata', json.dumps(metadata)], self.environment, 'R2 upload failed')
        # Validate the actual remote bytes, not just the existence of a key or an upload response.
        downloaded = archive.with_name('downloaded.dump')
        run(self.base + ['get-object', '--bucket', self.bucket, '--key', key, str(downloaded)],
            self.environment, 'R2 verification download failed')
        if file_hash(downloaded, 'sha256').hex() != metadata['sha256']:
            raise BackupError('R2 downloaded checksum mismatch')
        downloaded.unlink()


def snapshot(environment, record=True):
    storage = Storage(environment)
    database = database_environment(environment)
    # The session lock spans pg_dump and R2 upload, including overlapping component deployments.
    lock = subprocess.Popen(['psql', '-X', '-q', '-At', '-v', 'ON_ERROR_STOP=1'], env=database,
                            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    try:
        lock.stdin.write("SELECT pg_try_advisory_lock(hashtextextended(current_database()||':r2-backup',0));\n")
        lock.stdin.flush()
        if lock.stdout.readline().strip() != 't':
            raise BackupError('another backup owns the database snapshot lock')
        now = dt.datetime.now(dt.timezone.utc)
        with tempfile.TemporaryDirectory(prefix='postgres-backup-') as directory:
            archive = pathlib.Path(directory) / 'database.dump'
            run(['pg_dump', '--format=custom', '--file', str(archive)], database, 'PostgreSQL snapshot failed')
            if archive.stat().st_size == 0:
                raise BackupError('PostgreSQL snapshot is empty')
            run(['pg_restore', '--no-owner', '--file', os.devnull, str(archive)], database, 'snapshot archive validation failed')
            recipient = environment['BACKUP_AGE_RECIPIENT']
            if not re.fullmatch(r'age1[0-9a-z]{58}', recipient):
                raise BackupError('invalid age encryption recipient')
            encrypted = archive.with_suffix('.dump.age')
            run(['age', '--recipient', recipient, '--output', str(encrypted), str(archive)],
                environment, 'snapshot encryption failed')
            metadata = {'sha256': file_hash(encrypted, 'sha256').hex(), 'created-at': now.isoformat(),
                        'backup-date': now.date().isoformat(), 'database': database['PGDATABASE']}
            hourly, daily = slots(now, environment.get('BACKUP_SCOPE'), environment.get('BACKUP_PREFIX', 'postgres'))
            if lock.poll() is not None:
                raise BackupError('database snapshot lock was lost')
            md5 = base64.b64encode(file_hash(encrypted, 'md5')).decode()
            storage.upload(hourly, encrypted, metadata, md5)
            previous = storage.head(daily)
            if not previous or previous.get('Metadata', {}).get('backup-date') != metadata['backup-date']:
                storage.upload(daily, encrypted, metadata, md5)
            status = {'last_success': dt.datetime.now(dt.timezone.utc).isoformat(), 'sha256': metadata['sha256'],
                      'bytes': encrypted.stat().st_size, 'hourly': hourly, 'daily': daily, 'maximum_snapshots': 31}
            if record:
                record_status(status)
            print(json.dumps(status), flush=True)
            return status
    finally:
        lock.terminate()
        try:
            lock.wait(timeout=5)
        except subprocess.TimeoutExpired:
            lock.kill()
            lock.wait()


def snapshot_all(environment):
    targets = database_targets(environment)
    if len(targets) == 1:
        return snapshot(targets[0])
    statuses = {target['BACKUP_SCOPE']: snapshot(target, record=False) for target in targets}
    status = {'last_success': min(item['last_success'] for item in statuses.values()),
              'databases': statuses, 'maximum_snapshots': 62}
    record_status(status)
    return status


class Health(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            status = json.loads(STATUS.read_text())
            age = dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(status['last_success'])
            code = 200 if age.total_seconds() < 5400 else 503
        except (OSError, ValueError, KeyError):
            code, status = 503, {'status': 'no verified snapshot yet'}
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(status).encode())

    def log_message(self, *_):
        pass


def main():
    os.umask(0o077)
    for signum in (signal.SIGTERM, signal.SIGINT):
        signal.signal(signum, lambda *_: STOP.set())
    if '--once' in __import__('sys').argv:
        snapshot_all(dict(os.environ))
        return
    server = HTTPServer(('0.0.0.0', 8080), Health)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    while not STOP.is_set():
        try:
            snapshot_all(dict(os.environ))
        except Exception:
            # Provider errors can carry credentials or signed URLs; keep logs fixed.
            print('PostgreSQL backup verification failed; no successful run recorded. Health is stale until a verified upload.', flush=True)
        STOP.wait(max(1, 3600 - time.time() % 3600))
    server.shutdown()


if __name__ == '__main__':
    main()
