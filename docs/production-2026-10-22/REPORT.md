# Production environment split and NFT activation — 2026-10-22

## Current state — gameplay connected and mining pool funded

At 2026-10-22T13:04:13.534Z, the user authorized and completed the initial 100,000,000 OnHold funding in [transaction `0x7a3f3d3946231ba5cabd7ce72c51a3a8fe048cbc568d72ba65a7cbe9fc4942da`](https://bscscan.com/tx/0x7a3f3d3946231ba5cabd7ce72c51a3a8fe048cbc568d72ba65a7cbe9fc4942da), block 129134776. The successful receipt and token balances confirm an exact 100,000,000-token pool increase and owner debit, with no transfer tax. Gas cost: 0.00000618075 BNB. Owner token balance immediately afterward: 2127577.357776463630987581. Mining remained unstarted (`miningStartedAt=0`); the first positive-weight NFT stake will start the 365-day clock. Public evidence: `contracts/deployments/bnb-mainnet-mining-funding-20261022.json`. Earlier unfunded statements below describe deployment before this funding. No NFT was minted or staked by this operation.

The user-created Flap OnHold token is `0x2dcde86543a9cc2c9a3dd914be3fd3afef6e7777`. The production site now binds the existing NFT to gameplay proxy `0x69aF74A7d86E0466fCC533a6eadAb3C25008FDdF` (implementation `0x52Ae9177B1e86914bb99E111790380D4098D36fe`). Deployment, role validation and exact Sourcify creation/runtime matches are recorded in `contracts/deployments/bnb-mainnet-gameplay-20261022.json`. Deployment transactions cost 0.0002217185 BNB. No reward tokens were transferred; the original wallet retains the allocation. A dedicated ad keeper at `0xb4d2C58C19B78803A7CFD05998f070b2ae569045` received 0.001 BNB for gas, separately from reward funding.

API image: `registry.cn-hangzhou.aliyuncs.com/xmhxiansheng/singlespark:onhold-20261022-gameplay-v67`, digest `sha256:6ae61fd52b6cc9964729f7f4d49b53112f351cf4dc5b774f45c9fad928da6c40`. Keeper image: `registry.cn-hangzhou.aliyuncs.com/xmhxiansheng/singlespark:onhold-20261022-mainnet-ad-keeper-v6`, digest `sha256:e3abe9544175c9cd7ddac044446431b80a5677ae7bde56bd39e1aebd9fd6779a`. The current production manifest includes the independent keeper, which uses a durable transaction journal and no public port. The deployer private key stays local. After attaching the existing private-registry credentials, the dedicated keeper is running as one 128-MiB pod; its startup log confirms ads mode, chain 56, Mock false, the correct Vault and independent wallet. No execution is due while mining is inactive.

NFT mint/proof identity is unchanged. Advertising, mining and referral interfaces now use the Vault. First positive-weight staking requires at least 100,000,000 OnHold held by the Vault and starts the 365-day period; direct funding does not start it. The current implementation has no owner ERC20 recovery/withdrawal. User NFT unstaking and accrued reward claims are independent operations. Gameplay is UUPS upgradeable by the owner, so compatible upgrades remain a trust assumption. No reward funding or mainnet user test transactions were performed.

The new Vault projection replays only NFT/Vault logs from NFT block 129093703. Existing PostgreSQL projections and SQLite were retained. The Flap burn index starts at token block 129115315 and counts only native protocol burn transfers. Historical logs now use `https://rpc-bsc.48.club`; ordinary reads use official BNB HTTP and live subscriptions remain PublicNode WSS. The burn configuration reads fixed Flap bindings at the fresh confirmed head, allowing historical log replay without old world state. Public RPC outages remain an operational dependency. The API retains `/api/health` routing during outages and honest `/api/ready` readiness.

Validation: 61 Rust tests, 30 contract integration tests, the mainnet gameplay deployment/resume test, the official-deflation historical replay test and production network config test passed. The local chain-56 fork of the deployed assets confirmed exact 100-million-token funding, first weighted stake/365-day clock, mining/referral claims and NFT return on unstake. Public transactions sent by the simulation: zero. Full mainnet ad reinvestment simulation was limited by public RPC state pruning and is not claimed; ad accounting is covered by contract tests. The fork report is `contracts/deployments/bnb-mainnet-gameplay-fork-20261022.json`.

Live checks after cutover: readiness 200, connected/caught up, no last error; `gameplay_configured=true`, chain 56, correct NFT/Vault, PostgreSQL projections available, six empty ad slots, mining start zero. Testnet configuration remains separate. Full pre-change backup: ignored `.rainbond/backups/prod/2026-10-22-pre-gameplay`. The active profile, env and secrets (including the new keeper key) are AES-GCM encrypted locally in `.rainbond/backups/prod/2026-10-22-gameplay-config`. The previous sections and records below describe earlier phases and are superseded by this section.

## Historical NFT-only mainnet launch

As of 2026-10-22T08:55:56.395Z, https://onhold.cc is active on BNB chain 56 with standalone NFT `0x930aebB5F91cdB219fE8C5178906e2e21a105E87`. Verification, NFT creation/authorization and wallet referral binding are enabled. No reward token or gameplay Vault was deployed; advertising bids, staking and reward withdrawals remain disabled. https://test.onhold.cc retains its chain-97 deployment and data. This section supersedes preparation-mode statements in the historical cutover record below.

Current image: `registry.cn-hangzhou.aliyuncs.com/xmhxiansheng/singlespark:onhold-20261022-receipt-rpc-v65`; digest `sha256:b6ba32cf5972be739cafed529dcd506f7bc3734dfa8d7373a4e7cc583eec4110`. This repair replaces the API binary and retains the v64 frontend. The production API, PostgreSQL, Redis and independent PostgreSQL backup component are running. Production profile/configuration records active NFT-only mode.

Validation: 108 frontend tests passed. Five page routes, API readiness, confirmed chain indexing, NFT gallery, compressed JS/CSS MIME/cache headers, chain-56/site/NFT referral signature domain, cross-origin rejection and testnet isolation passed. The browser displays the live NFT page without the preparation banner; staking explicitly states mining opens after token launch and funding. Actual eligible-account verification, image pinning and a user-authorized NFT mint were not performed; no mainnet NFT has been minted.

The index filters logs for the NFT address in ranges of at most 1,000 blocks, starting at deployment block 129093703. It does not store complete blocks or unrelated transactions. After catching up, PostgreSQL contains 2 contract events (deployment ownership and verifier change), 0 NFTs, 0 wallet projections and 1 checkpoint. It then follows confirmed WebSocket events with reconnect backfill.

During activation, Rainbond's dependency probe was blocked by a missing Redis alias. The provider's internal service name is now `onhold-prod-redis`, matching its stable internal Service and the API connection configuration; only internal port 6379 is enabled. Both database and Redis durable mounts were verified.

### RPC outage repair

PublicNode later returned HTTP 403 for historical constructor-log lookup, preventing reconnect despite a valid saved checkpoint. Rainbond's `/api/ready` probe then removed the whole website from routing. Production now routes on `/api/health`, preserving page access during index outages; `/api/ready` remains an honest chain-availability monitor.

The indexer validates its saved constructor event against a fresh canonical block header before making a historical log request. For an empty constructor cache, the configured deployment transaction `0x97661acf00103c2e89cd5d3f1a2f2a462814cad63877314cfdfe41ac43f9d44a` is validated through its successful receipt, including transaction, block, hash, NFT address and ownership-event checks. Ordinary HTTP calls use `https://bsc-dataseed.bnbchain.org`; `eth_getLogs` uses `https://bsc-rpc.publicnode.com`, and live subscriptions remain on PublicNode WSS. The official BNB HTTP endpoint disables log queries. This repair preserves production databases and checkpoints; a future full rebuild from old history still requires a provider serving historical logs.

Repair validation: 61 Rust tests and the indexer integration test passed, including simulated historical-log HTTP 403, initial receipt validation, cached-event restart, reconnect, reorg and Redis failure. At 2026-10-22T09:50Z, live readiness returned 200, indexing was connected and caught up at block 129108927 with no error, five page routes and static assets passed, and chain-97 test configuration remained intact. No mint transaction was sent.

A platform diagnostic event payload returned an unredacted verifier key. The key was retired before the site opened; raw request bodies/event tails/environment values are excluded from the local diagnostic output. The new verifier and confirmed rotation transaction are recorded in CONTRACTS.md and the public deployment manifest. Existing NFT code/address/owner are unchanged. The active secret configuration and private rotation journal are encrypted in a separate activation-configuration backup.

Prelaunch database backup: `.rainbond/backups/prod/2026-10-22T08-23-06-793Z`; isolated restore verified SQLite integrity, 16 tables and 0 NFT mints, plus 11 PostgreSQL tables. Active configuration backup: `.rainbond/backups/prod/2026-10-22T08-58-activation-config`; AES-GCM round-trip checks passed. These full-environment backups remain on this workstation. Scheduled PostgreSQL-only remote snapshots are now configured as described below; off-machine SQLite/configuration backups and external monitoring remain unconfigured.

### Automatic PostgreSQL snapshots

The former SingleSpark backup component was natively copied into each OnHold application so its masked R2 upload secret stays platform-managed. Each copy targets its own database and private hostname, has one replica with 256 MiB memory, and has no public service. The imported script only adds validated object prefixes: `onhold/mainnet/postgres` and `onhold/testnet/postgres`; old SingleSpark backup objects are untouched. The current script is mounted from a configuration volume at `/app/postgres-backup.py`, using the original pinned image documented in `scripts/ops/postgres-backup/README.md`.

Backups run immediately and at each UTC hour, retaining 24 hourly slots and 7 daily slots per database. They use a database advisory lock, custom-format dump validation, age encryption with a new OnHold recipient, upload integrity checks and downloaded SHA-256 verification. The decryption identity is kept only in ignored `.rainbond/backup-keys/onhold-postgres.agekey`; keep an independent secure copy. The first verified uploads completed at 10:02 UTC (mainnet) and 10:03 UTC (testnet). Both encrypted remote objects were downloaded, decrypted locally and actually restored into temporary network-isolated PostgreSQL 16 containers: mainnet had 11 tables, 2 chain events and 1 checkpoint; testnet had 11 tables, 152 chain events and 5 checkpoints. Market identities were checked against the independent environments. The namespace/private-host unit checks passed. These snapshots contain PostgreSQL data only; SQLite authorization state and runtime secrets remain covered by the separate manual full-environment backup process.

### SingleSpark retirement

The independently scoped `SingleSpark` application (app 2 in workspace `v38gjpco`) was stopped and its six components deleted: backup, web, query API, relayer, PostgreSQL and Redis. Its six volume definitions (two data volumes and four configuration files) were explicitly removed before component deletion; the final application health query returned zero components. Two unsuccessful initial OnHold backup components were also removed after the native copies passed remote restore checks. Application metadata and existing remote SingleSpark backup objects remain. The shared ACR repository is retained because it also stores OnHold images. Actual reclaimed host filesystem bytes were not measured.

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

## Mining-page recovery and network copy repair

The mainnet API was healthy when the reported empty mining screen was checked. Its wallet projection included two minted NFTs, one staked Max NFT (weight 3), an active 365-day mining clock and accrued rewards. A real reward claim, `0x611d00e761620d57aac2fadc5779ba92fa856dfbe30364de1ae5b1deb8bf5c90`, succeeded at block 129136093. No contract or token transfer was required for this repair.

The Claim page previously loaded `/api/status` only once. A transient failure during that initial read left its child mining and NFT panels without a market even after the API recovered. It now retries every 15 seconds and on visibility changes, keeps a previously valid service response during later failures, prevents overlapping reads and cleans up on unmount. This defect was reproduced with a failed initial response in the regression test; the exact browser request that failed in the screenshot was not captured.

Wallet connected/switch-network and contract/network errors now substitute the actual build network label in all eight locales. The production ad form omits the testnet-only disclaimer. On-chain and live-bundle checks confirmed that production was already chain 56; the old testnet wording did not mean transactions were sent on chain 97.

Validation: 111 frontend tests passed, including failed-first-request recovery, non-overlap/unmount behavior and both chain-56/97 localized messages. Production frontend image: `registry.cn-hangzhou.aliyuncs.com/xmhxiansheng/singlespark:onhold-20261022-mining-ui-v68`, digest `sha256:40f5b0f10d316519836f4520c3cfb3e30e6049af1fbd7c2919f4a4ec499754bc`. It retains the existing API binary, contract addresses, keeper and persistent data.

Release incident: the v68 API switch used an explicit stop before deploy to avoid overlapping indexers. While no API pod was serving, the gateway returned HTTP 503; this was a release-induced outage. The new pod caught up at 13:20:48 UTC. Subsequent HTTP checks returned 200 for home, docs, claim, health and readiness; the active browser Mining tab showed pool 100,000,000, daily emission 238,237.0459, total weight 3, two minted NFTs and staked Max #1. Do not repeat stop-before-deploy for a healthy production frontend release; prepare a serving replacement and verify it before routing traffic. Zero-downtime frontend delivery is not yet implemented.
