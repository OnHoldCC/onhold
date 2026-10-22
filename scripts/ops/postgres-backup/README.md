# PostgreSQL remote snapshots

Reuses SingleSpark's verified snapshot implementation and pinned image:
`registry.cn-hangzhou.aliyuncs.com/xmhxiansheng/singlespark@sha256:124a6e489efa583db7707ea402b03945586f9cf1038ca94b0553146e0c4049c1`.
The only behavior added to the imported script is a validated object prefix, keeping OnHold snapshots separate from retired SingleSpark data.

Run one replica in each application's own workspace. Mount `backup.py` as a config-file volume at `/app/postgres-backup.py`, replacing the image's script. The image already includes Python, PostgreSQL clients, age and AWS CLI. Each component depends only on its application's PostgreSQL, uses 256 MiB memory, and exposes no public service. HTTP port 8080 serves internal health; readiness `/` returns 503 if the last verified upload is more than 90 minutes old. The process immediately attempts a snapshot and then retries at the next UTC hour.

| Environment | Rainbond app | Component | Object prefix |
| --- | --- | --- | --- |
| Mainnet | `onhold-prod` (6) | `postgres-backup-copy` | `onhold/mainnet/postgres` |
| Testnet | `onhold` (5) | `postgres-backup-copy` | `onhold/testnet/postgres` |

Set `BACKUP_DATABASE_URL` from the corresponding application's existing database configuration and pin its private hostname with `BACKUP_DATABASE_INTERNAL_HOST`. Set `BACKUP_PREFIX` from the table. Use separate production and test credentials; do not reuse SingleSpark's database URL or `BACKUP_DATABASE_NAMES`.

`BACKUP_R2_ENDPOINT`, `BACKUP_R2_BUCKET`, `BACKUP_R2_ACCESS_KEY_ID` and `BACKUP_R2_SECRET_ACCESS_KEY` retain the existing private R2 destination and upload credentials. The components were copied using Rainbond's native copy operation to preserve the masked R2 secret without exporting it. `BACKUP_AGE_RECIPIENT` uses OnHold's new public recipient. Other runtime values are stored in ignored `.rainbond/secrets.prod.json` / `.rainbond/secrets.preview.json`; the R2 secret remains platform-managed and is excluded from local overrides. Component IDs are in the corresponding local binding files. The decryption identity stays only at `.rainbond/backup-keys/onhold-postgres.agekey`. Keep a separate secure copy of that file: losing it makes these encrypted snapshots unrecoverable. Never upload the identity to the component or commit it.

Each database retains at most 24 hourly slots and 7 daily slots, in UTC. A PostgreSQL advisory lock prevents overlapping runs. Every run creates a custom-format `pg_dump`, validates the archive using `pg_restore`, encrypts it, uploads it with an MD5 integrity check, downloads the object, and verifies its SHA-256. Daily slots are written once per UTC date. Snapshots are independent exports; no database is restored or modified during synchronization. Slot limits apply to current objects; any R2 bucket versioning or retention policy can preserve older object versions separately.

Decrypt an exported `.dump.age` locally using `age --decrypt -i .rainbond/backup-keys/onhold-postgres.agekey -o postgres.dump postgres.dump.age`, then restore into an isolated PostgreSQL 16 instance using `pg_restore --no-owner --no-privileges`. Verify the database identity and table counts before considering a production restore. PostgreSQL snapshots do not include the API's SQLite authorization/session data, runtime secrets or keeper journals; existing encrypted full-environment backups remain separate.

Run the small namespace/private-host regression check with:

```sh
python3 -m unittest discover -s scripts/ops/postgres-backup
```
