import datetime as dt
import unittest
from backup import BackupError, database_environment, slots


class BackupTests(unittest.TestCase):
    def test_onhold_namespaces_do_not_overwrite_singlespark_or_each_other(self):
        now = dt.datetime(2026, 10, 22, 9, tzinfo=dt.timezone.utc)
        original = set(slots(now, 'mainnet'))
        mainnet = set(slots(now, prefix='onhold/mainnet/postgres'))
        testnet = set(slots(now, prefix='onhold/testnet/postgres'))
        self.assertFalse(original & mainnet or original & testnet or mainnet & testnet)
        self.assertIn('onhold/mainnet/postgres/daily/3.dump.age', mainnet)
        self.assertIn('onhold/testnet/postgres/hourly/09.dump.age', testnet)
        for prefix in ('../postgres', '/postgres', 'onhold//mainnet', ''):
            with self.assertRaises(BackupError):
                slots(now, prefix=prefix)

    def test_database_target_must_match_the_private_service_pin(self):
        config = {'BACKUP_DATABASE_URL': 'postgresql://user:password@private-db/onhold',
                  'BACKUP_DATABASE_INTERNAL_HOST': 'other-db'}
        with self.assertRaises(BackupError):
            database_environment(config)
        config['BACKUP_DATABASE_INTERNAL_HOST'] = 'private-db'
        self.assertEqual(database_environment(config)['PGDATABASE'], 'onhold')


if __name__ == '__main__':
    unittest.main()
