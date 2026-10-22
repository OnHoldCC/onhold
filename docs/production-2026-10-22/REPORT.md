# Production environment split and NFT activation — 2026-10-22

## Current delivered state — NFT-only mainnet launch

As of 2026-10-22T08:55:56.395Z, https://onhold.cc is active on BNB chain 56 with standalone NFT `0x930aebB5F91cdB219fE8C5178906e2e21a105E87`. Verification, NFT creation/authorization and wallet referral binding are enabled. No reward token or gameplay Vault was deployed; advertising bids, staking and reward withdrawals remain disabled. https://test.onhold.cc retains its chain-97 deployment and data. This section supersedes preparation-mode statements in the historical cutover record below.

Published image: `registry.cn-hangzhou.aliyuncs.com/xmhxiansheng/singlespark:onhold-20261022-mainnet-nft-v64`; digest `sha256:71d6225bc78d178598593cbcba01027852bdc07ab06bde4ee8a917609a546a8b`. The image reuses the validated production API binary and replaces only the built frontend. All three production components are running. Production profile/configuration now records active NFT-only mode.

Validation: 108 frontend tests passed. Five page routes, API readiness, confirmed chain indexing, NFT gallery, compressed JS/CSS MIME/cache headers, chain-56/site/NFT referral signature domain, cross-origin rejection and testnet isolation passed. The browser displays the live NFT page without the preparation banner; staking explicitly states mining opens after token launch and funding. Actual eligible-account verification, image pinning and a user-authorized NFT mint were not performed; no mainnet NFT has been minted.

The index filters logs for the NFT address in ranges of at most 1,000 blocks, starting at deployment block 129093703. It does not store complete blocks or unrelated transactions. After catching up, PostgreSQL contains 2 contract events (deployment ownership and verifier change), 0 NFTs, 0 wallet projections and 1 checkpoint. It then follows confirmed WebSocket events with reconnect backfill.

During activation, Rainbond's dependency probe was blocked by a missing Redis alias. The provider's internal service name is now `onhold-prod-redis`, matching its stable internal Service and the API connection configuration; only internal port 6379 is enabled. Both database and Redis durable mounts were verified. PublicNode HTTPS/WSS passed deployment-log/range/subscription checks. The official BNB public HTTP endpoint rejected eth_getLogs during an attempted RPC change; production uses the validated PublicNode log endpoint. Shared public RPC availability remains an operational dependency.

A platform diagnostic event payload returned an unredacted verifier key. The key was retired before the site opened; raw request bodies/event tails/environment values are excluded from the local diagnostic output. The new verifier and confirmed rotation transaction are recorded in CONTRACTS.md and the public deployment manifest. Existing NFT code/address/owner are unchanged. The active secret configuration and private rotation journal are encrypted in a separate activation-configuration backup.

Prelaunch database backup: `.rainbond/backups/prod/2026-10-22T08-23-06-793Z`; isolated restore verified SQLite integrity, 16 tables and 0 NFT mints, plus 11 PostgreSQL tables. Active configuration backup: `.rainbond/backups/prod/2026-10-22T08-58-activation-config`; AES-GCM round-trip checks passed. These backups remain on this workstation; automated remote backups and monitoring are still unconfigured.

Operational rollback must preserve the current verifier and production database identity. Restoring a historical preparation environment requires removing signing/contract variables and using prepare mode consistently. Do not restore an old verifier secret while the on-chain verifier is the rotated address.

## Original environment split (historical)

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
- No mainnet transaction was broadcast during the infrastructure cutover described above. The subsequent authorized mainnet NFT/renderer deployment, its actual fee, two-wallet permissions and exact Sourcify source verification are documented in `CONTRACTS.md` and `contracts/deployments/bnb-mainnet-nft-20261022.json`. Website activation and token/mining deployment have not taken place.

## Original remaining launch work (superseded by NFT activation above)

The fixed chain-56 NFT and renderer are now deployed and source-verified; the website is still in preparation mode. Deploy and verify the remaining token/gameplay/Flap components when launching mining, and record their exact addresses and deployment blocks. Configure the dedicated verifier and appropriate owner/keeper permissions outside source control. Fund and validate the intended token/liquidity/mining flows, including actual Flap tax/LP behavior. Supply production RPC/WSS, review contract security and run controlled end-to-end wallet tests before switching to `active`. Configure monitoring and scheduled off-machine backups. Production remains locked until those prerequisites are deliberately applied.

Rollback of the web split means restoring the old root-domain mapping to the retained test API and its old origin, then restarting only that API. It does not require restoring or clearing a database. Production data must never be pointed at the test profile during rollback.
