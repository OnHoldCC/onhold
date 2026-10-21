# 数据库与表的位置

`chain.sql` 是 PostgreSQL 建表文件。后端启动时，`backend/src/pg.rs` 会在 `DATABASE_URL` 指定的数据库中执行它。表和字段的中文备注使用 `COMMENT ON`，数据库客户端也能读取，并非仅写在 SQL 源码中。

建表语句中，每个字段旁的 `-- 中文说明` 方便直接阅读；后面的 `COMMENT ON COLUMN` 则把详细备注写入 PostgreSQL。MySQL 的字段内 `COMMENT` 语法不能直接用于本项目的 PostgreSQL。

## 当前本地测试环境

| 项目 | 位置或名称 |
| --- | --- |
| 数据库 | `onhold` |
| Schema | `public` |
| 本地数据库角色 | `nat` |
| PostgreSQL 数据目录 | `backend/data/testnet-v4-mock/postgres/` |
| PostgreSQL Unix socket 目录 | `backend/data/testnet-v4-mock/pgsocket/` |
| 建表与备注源码 | `backend/sql/chain.sql` |

当前测试目录由 `backend/data/testnet/active.json` 的 `directory` 指定（可用 `ONHOLD_TESTNET_DATA_DIR` 覆盖）；上表是当前 mock 测试部署。旧 `backend/data/testnet/` 和其他测试目录中的数据保留，不会自动迁移或删除。这些是 `npm run start:testnet` 的本地配置。其他环境由 `DATABASE_URL` 和连接的 `search_path` 决定。当前本地 PostgreSQL 只监听私有 Unix socket，不监听 TCP 端口；不要直接修改其数据目录中的文件。

本机查看数据库：

```sh
psql -h /Users/nat/Documents/ChatGPT/onholdcc/onhold/backend/data/testnet-v4-mock/pgsocket -U nat -d onhold
```

进入 `psql` 后查看所有表及用途备注，或展开某张表的字段备注：

```sql
\dt+ public.*
\d+ public.chain_nfts
\d+ public.buyback_events
```

## 当前使用的 10 张 PostgreSQL 表

| 表 | 保存什么 | 主要读写位置 |
| --- | --- | --- |
| `chain_state` | 市场全局挖矿状态、已确认区块和同步检查点 | `backend/src/mining.rs` |
| `chain_wallets` | 钱包质押权重、待领收益、邀请关系及邀请收益 | `backend/src/mining.rs` |
| `chain_nfts` | NFT 编号、Pro／Max、所有者、质押者、公开账号记录和图片 | `backend/src/mining.rs` |
| `chain_ads` | 每个广告投放版本的实付竞价、官网内容和展示起止时间 | `backend/src/mining.rs` |
| `chain_events` | 市场合约原始链上日志归档；用于追溯，重组时重置 | `backend/src/mining.rs` |
| `chain_payees` | 已领取挖矿或邀请收益的钱包去重集合 | `backend/src/mining.rs` |
| `analytics_events` | 浏览、广告点击、钱包连接埋点及 UV 去重标识 | `backend/src/main.rs`、`backend/src/pg.rs` |
| `analytics_settings` | 服务端访客 IP 哈希盐等持久统计配置 | `backend/src/pg.rs` |
| `buyback_state` | 每轮手续费检查的余额、状态、累计金额及同步进度 | `backend/src/burn.rs` |
| `buyback_events` | 已确认的回购与销毁合并记录，含同笔交易的 Gas 补偿 | `backend/src/burn.rs` |

空表不等于废弃表。例如没有 NFT 铸造时 `chain_nfts` 可以为空，没有成功回购时 `buyback_events` 可以为空。以上 10 张表目前均有业务读写。

`chain_ads.started_at`、`ended_at` 使用 Unix **毫秒**；`analytics_events.created_at` 与回购检查时间使用 Unix **秒**。广告 `bid` 使用 **wei 整数**；回购 JSON 中金额使用带小数的 BNB／$Claude 字符串。字段备注也标明了这些区别。

## 另一个 SQLite 文件

当前仍有业务使用 `backend/data/events.sqlite3`，由 `backend/src/main.rs` 初始化，不属于 `chain.sql`：

- 账号验证、短期验证会话、已验证 NFT 记录：`verified_accounts`、`verification_sessions`、`verified_nft_records`。
- NFT 铸造防重复与图片生成结果：`nft_mints`；前端 PNG 上传结果保存在 `verified_nft_records.image`，该记录同时关联短期验证凭证。
- 邀请短码、限流：`invites`、`request_limits`。
- 原有埋点与统计配置：`events`、`analytics_settings`，保留旧数据导入及未配置 PG 时的统计路径。

`claims`、`chain_snapshots`、`burn_cursor`、`burn_events`、`nft_artwork`（旧后端渲染图片缓存）是旧版兼容表，当前生产代码没有业务查询；阅读当前流程时可以忽略。保留已有数据，后续如要清理，应单独做迁移。

SQLite 不支持 PostgreSQL 的 `COMMENT ON TABLE/COLUMN` 语法，因此这里列明其用途和位置。

## UV／点击双写与查询

事件先按 `event_id` 去重写入 `analytics_events`，同一行的 `redis_pending` 默认为 true；服务同步 Redis 成功后才清除。Redis 在一个 Hash 内原子维护计数、匿名访客去重及待确认事件去重，数据库确认失败时可重放而不重复计数。后台每 2 秒补写未完成事件。

`/api/stats`、广告排行与广告投影的点击／UV 优先读取 Redis；Redis 故障时统计从 PostgreSQL 汇总，数据不丢弃。缓存缺失或损坏时按数据库分批重建，重建完成前不对外展示不完整计数。`/api/stats` 的 `X-Analytics-Source` 响应头显示实际来源。

页面 PV、匿名访客 UV 和广告点击是不同指标。历史页面没有保存访客标识的记录保留 PV，但不虚构历史 UV。现有合约、挖矿与财务数据仍从原有已确认链上投影读取。
