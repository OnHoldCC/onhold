# Production environment split — 2026-10-22

## Delivered state

| Environment | Address | Network | Runtime |
| --- | --- | --- | --- |
| Production preparation | https://onhold.cc | BNB mainnet, chain 56 | `prepare`; no contracts, signing, verification, uploads or transactions |
| Existing test environment | https://test.onhold.cc | BNB testnet, chain 97 | Existing v60 application and chain data retained |

The table records the original web cutover. The test API was subsequently updated to `onhold-20261022-vault-fixes-v63`, and its existing gameplay proxy was upgraded with NFT recovery and mining-expiry safeguards. Public chain evidence is in `contracts/deployments/bnb-testnet-vault-fixes-20261022.json` and `contracts/deployments/testnet-expired-ad-reserve-20261022.json`; the latter uses a separate test-only vault with simulated expiry. Production remains in preparation mode.

Both HTTPS `/api/status` and `/api/ready` returned HTTP 200 after cutover. Production `/api/chain` is explicitly unconfigured. Test indexing remains connected and caught up. Production has a visible preparation notice and a link to the test site. It is **not an active mainnet launch**.

Cloudflare `test` is a proxied A record to the existing server. Its TLS host binding uses the existing wildcard certificate. A separate test route was established before removing the old multi-host mapping; the production route was created and checked before removing the superseded root mapping. The test API alone was restarted on the same v60 image to apply its new HTTPS origin; PostgreSQL, Redis, keeper and data were retained. Both APIs now use their respective origins.

## Isolation and safeguards

Production uses a separate Rainbond application, `onhold-prod` (app 6), with dedicated PostgreSQL, Redis and API components and separate persistent volumes. Test remains in `onhold` (app 5). Production database credentials are newly generated and stored only in ignored local secret files and runtime environment. Database/cache ports are internal only. Redis requires authentication; unauthenticated PING returns NOAUTH, authenticated local and service-name PING return PONG.

Rainbond removed its alias Redis Service during a component redeploy. Production therefore uses independent ClusterIP Services from `deploy/production/internal-services.yaml`, with stable names `onhold-prod-postgres` and `onhold-prod-redis`. These select only production pods. API readiness verifies PostgreSQL and Redis connectivity before traffic is switched.

Frontend chain selection, wallet switching, proof/signature domains, receipt recovery, referral caches, backend indexers and keeper network checks support 56 and 97. Mainnet rejects test overrides and requires dedicated configuration. SQLite and PostgreSQL bind their network identity and reject cross-chain database reuse. Prepare mode rejects API writes with `production_not_launched`, and forbids contract/signing configuration. No production keeper, signer, funded wallet, RPC subscription or contract was deployed.

Production image: `registry.cn-hangzhou.aliyuncs.com/xmhxiansheng/singlespark:onhold-20261022-production-v62`

Digest: `sha256:d3d73f0f6c564c3472b7e21e4b0866e83deea31d3e21ec20ed84c03752af2764`

Production source/profile: `deploy/production/rainbond.app.json`, `config/production-chain.json`, ignored `.rainbond/production/local.json`. Original `.rainbond/local.json` remains bound to the test application, with its gateway now set to test.onhold.cc. Never use the default test profile for production deployment.

## Backup and restore evidence

Encrypted AES-256-GCM backups are saved outside the cluster on this workstation. Keys are stored separately under ignored `.rainbond/backup-keys/`, with owner-only file permissions. No test data was cleared, copied into production or changed by restore verification.

| Backup | Actual isolated restore |
| --- | --- |
| Test, `2026-10-22T03-19-44-443Z` UTC | SQLite integrity OK, 15 tables, 4 NFT mints; PostgreSQL 11 tables, 708 analytics events; keeper archive readable |
| Production initial, `2026-10-22T03-55-12-344Z` UTC | SQLite integrity OK, 16 tables, 0 NFT mints; PostgreSQL 11 tables, 0 analytics events |

PostgreSQL dumps were restored into temporary network-isolated Docker instances; SQLite snapshots were opened independently and checked. Redis is rebuildable cache and intentionally excluded. The stopped test burn keeper was not started just to obtain a journal; its absence is recorded in the backup manifest. No production keeper exists.

Commands:

```sh
node scripts/ops/backup.mjs .rainbond/local.json
node scripts/ops/backup.mjs .rainbond/production/local.json
node scripts/ops/restore-check.mjs BACKUP_DIRECTORY
```

Backup tools require the existing Rainskills CLI and the ignored Linux SQLite backup helper at `.rainbond/production/sqlite-backup`. Keep keys in a second secure location separate from backup media. Automated scheduling and a second remote backup destination are **not configured**.

## Validation

- 117 Node tests passed, including frontend network validation and isolated backend/cache/indexing integration checks.
- 60 Rust tests passed, including chain binding, signature domain separation and preparation write guards.
- Final production and test API instances each have one RUNNING pod.
- Endpoint, runtime-origin, write-guard and browser verification artifacts are retained locally outside Git. Write-guard checks used invalid session inputs only; no real account credential was submitted.
- No mainnet transaction was broadcast. Later read-only deployment gas estimates and the two-wallet configuration are documented in `CONTRACTS.md`.

## Remaining launch work

Deploy and verify real chain-56 token/NFT/market/Flap components; record exact addresses and deployment blocks. Configure the dedicated verifier and appropriate owner/keeper permissions outside source control. Fund and validate the intended token/liquidity/mining flows, including actual Flap tax/LP behavior. Supply production RPC/WSS, review contract security and run controlled end-to-end wallet tests before switching to `active`. Configure monitoring and scheduled off-machine backups. Production remains locked until those prerequisites are deliberately applied.

Rollback of the web split means restoring the old root-domain mapping to the retained test API and its old origin, then restarting only that API. It does not require restoring or clearing a database. Production data must never be pointed at the test profile during rollback.
