-- PostgreSQL：链上数据投影、访问埋点、回购销毁记录。
-- Rust 启动时由 backend/src/pg.rs 在 DATABASE_URL 指定的数据库中执行。
-- 当前本地测试环境：数据库 onhold，schema public；连接方式见同目录 README.md。
-- 保留 IF NOT EXISTS 和增量补列语句，兼容已有数据库重复执行。

-- 1. NFT、质押挖矿与广告的链上投影

-- 全局链上状态与同步检查点
CREATE TABLE IF NOT EXISTS chain_state (
    market TEXT PRIMARY KEY,  -- 市场／NFT 挖矿合约地址
    data   JSONB NOT NULL     -- 全局挖矿快照、已确认区块及同步进度
);

COMMENT ON TABLE chain_state IS '市场合约的全局链上投影和同步检查点；保存区块进度、挖矿累计值等，供重启恢复与 API 查询。';
COMMENT ON COLUMN chain_state.market IS '市场／NFT 挖矿合约地址，小写十六进制字符串；同一合约一条全局状态。';
COMMENT ON COLUMN chain_state.data IS '索引器全局快照：next_block、block、hash、time、总质押权重、累计释放和领取等；钱包、NFT、广告详情另表保存。';

-- 钱包质押、邀请关系与收益状态
CREATE TABLE IF NOT EXISTS chain_wallets (
    market TEXT  NOT NULL,  -- 市场合约地址
    wallet TEXT  NOT NULL,  -- 用户钱包地址
    data   JSONB NOT NULL,  -- 质押权重、收益计算进度、待领收益和邀请关系
    PRIMARY KEY (market, wallet)
);

COMMENT ON TABLE chain_wallets IS '按市场和钱包保存的质押挖矿、邀请关系及收益计算状态；由链上事件同步，不作为链上领取权限的替代。';
COMMENT ON COLUMN chain_wallets.market IS '市场／NFT 挖矿合约地址。';
COMMENT ON COLUMN chain_wallets.wallet IS '用户钱包地址，小写十六进制字符串。';
COMMENT ON COLUMN chain_wallets.data IS '包含 weight、paid、pending、referrer、referral_pending、referral_earned；收益计算整数使用索引器的 64 位十六进制编码。';

-- 封禁账号纪念 NFT
CREATE TABLE IF NOT EXISTS chain_nfts (
    market        TEXT     NOT NULL,  -- NFT／挖矿合约地址
    token_id      BIGINT   NOT NULL,  -- NFT 编号，与 market 组成唯一标识
    tier          SMALLINT NOT NULL,  -- 0 = Free（权重 0）；1 = Pro（权重 1）；2 = Max（权重 3）
    owner         TEXT     NOT NULL,  -- NFT 当前所有者地址
    staker        TEXT,               -- 质押钱包地址；NULL 表示未质押
    metadata_hash TEXT,               -- 账号记录与图片的内容哈希，用于缓存校验
    record        JSONB,              -- 公开账号、UUID、封禁时间和套餐记录
    image         TEXT,               -- 链上 tokenURI 图片地址，通常为内嵌 SVG
    PRIMARY KEY (market, token_id)
);

-- 兼容早期没有 image 列的数据库。
ALTER TABLE chain_nfts
    ADD COLUMN IF NOT EXISTS image TEXT;

CREATE INDEX IF NOT EXISTS chain_nfts_owner
    ON chain_nfts (market, owner, token_id);

CREATE INDEX IF NOT EXISTS chain_nfts_staker
    ON chain_nfts (market, staker, token_id);

CREATE INDEX IF NOT EXISTS chain_nfts_metadata
    ON chain_nfts (market, metadata_hash);

CREATE INDEX IF NOT EXISTS chain_nfts_tier_page
    ON chain_nfts (market, tier, token_id DESC);

COMMENT ON TABLE chain_nfts IS '封禁账号纪念 NFT 的链上投影；用于 NFT 列表、Free／Pro／Max 筛选分页、钱包持有与质押查询。';
COMMENT ON COLUMN chain_nfts.market IS '发行 NFT 的市场／挖矿合约地址。';
COMMENT ON COLUMN chain_nfts.token_id IS '合约内的 NFT 编号；与 market 共同确定一张 NFT。';
COMMENT ON COLUMN chain_nfts.tier IS '套餐等级：0 = Free，挖矿权重 0；1 = Pro，挖矿权重 1；2 = Max，挖矿权重 3。';
COMMENT ON COLUMN chain_nfts.owner IS '最近已索引区块中的 NFT 所有者地址。';
COMMENT ON COLUMN chain_nfts.staker IS '当前质押钱包地址；NULL 表示未质押。';
COMMENT ON COLUMN chain_nfts.metadata_hash IS '账号记录与图片组合内容的 Keccak 哈希，用于 Redis 元数据缓存及内容校验。';
COMMENT ON COLUMN chain_nfts.record IS '公开的链上账号记录：account、uuid、banned_at、plan；不包含 Cookie 或 sessionKey。';
COMMENT ON COLUMN chain_nfts.image IS 'tokenURI 返回的图片 URI，通常为合约生成的内嵌 SVG data URI；旧记录可能为空。';

-- 当前与历史广告投放
CREATE TABLE IF NOT EXISTS chain_ads (
    market     TEXT          NOT NULL,   -- 广告竞价合约地址
    slot       SMALLINT      NOT NULL,   -- 广告位编号，从 0 开始
    version    BIGINT        NOT NULL,   -- 该广告位的投放版本号
    bid        NUMERIC(78, 0) NOT NULL,  -- 实付竞价，单位 wei；不是衰减后的价格
    started_at BIGINT        NOT NULL,   -- 开始展示的 Unix 时间戳，单位毫秒
    ended_at   BIGINT,                   -- 被替换的 Unix 毫秒时间戳；NULL 表示仍在展示
    data       JSONB         NOT NULL,   -- 官网、简介、头像、特点标签等完整投放信息
    PRIMARY KEY (market, slot, version)
);

CREATE INDEX IF NOT EXISTS chain_ads_history
    ON chain_ads (market, started_at DESC);

COMMENT ON TABLE chain_ads IS '当前与历史广告投放版本；保存实付竞价、展示起止时间及官网内容，被替换后仍保留历史。';
COMMENT ON COLUMN chain_ads.market IS '广告竞价所属市场合约地址。';
COMMENT ON COLUMN chain_ads.slot IS '合约中的广告位编号，从 0 开始。';
COMMENT ON COLUMN chain_ads.version IS '广告位的投放版本号，每次成功替换产生新版本；用于关联该次投放的点击和 UV。';
COMMENT ON COLUMN chain_ads.bid IS '该版本实际支付的原始竞价，单位 wei；1 BNB = 10^18 wei，不是随时间衰减后的价格。';
COMMENT ON COLUMN chain_ads.started_at IS '开始展示时间，Unix 时间戳，单位毫秒。';
COMMENT ON COLUMN chain_ads.ended_at IS '被新广告替换的时间，Unix 毫秒；NULL 表示该版本尚未被替换。';
COMMENT ON COLUMN chain_ads.data IS '广告完整投影，包含 advertiser、url、description、avatar、tags、bid、startedAt、endedAt 等。';

-- 市场合约原始链上日志
CREATE TABLE IF NOT EXISTS chain_events (
    market       TEXT   NOT NULL,  -- 被监听的市场合约地址
    tx_hash      TEXT   NOT NULL,  -- 链上交易哈希
    log_index    BIGINT NOT NULL,  -- 日志在区块中的序号，用于去重
    block_number BIGINT NOT NULL,  -- 事件所在的已确认区块高度
    data         JSONB  NOT NULL,  -- WS／补查 RPC 原始日志，包含 topics、data、blockHash 等
    PRIMARY KEY (market, tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS chain_events_block
    ON chain_events (market, block_number);

CREATE INDEX IF NOT EXISTS chain_wallets_referrer
    ON chain_wallets (market, (data->>'referrer'), wallet);
CREATE INDEX IF NOT EXISTS chain_events_referral_recipient
    ON chain_events (market, (data->'topics'->>2), (data->'topics'->>0), block_number DESC, log_index DESC);
CREATE INDEX IF NOT EXISTS chain_events_actor
    ON chain_events (market, (data->'topics'->>1), (data->'topics'->>0), block_number DESC, log_index DESC);

-- Sum raw ABI amounts in PostgreSQL without floating-point conversion or loading every log into memory.
CREATE OR REPLACE FUNCTION onhold_uint256(raw TEXT) RETURNS NUMERIC
LANGUAGE SQL IMMUTABLE STRICT PARALLEL SAFE AS $$
    SELECT CASE WHEN raw ~ '^[0-9a-fA-F]{64}$' THEN
        (SELECT sum((('x' || substr(raw, i * 8 + 1, 8))::bit(32)::bigint)::numeric
                    * power(4294967296::numeric, 7 - i))::numeric(78,0) FROM generate_series(0, 7) i)
    END
$$;

COMMENT ON TABLE chain_events IS '市场／NFT 挖矿合约已确认的原始链上日志；用于链上追溯和事件去重，重组时随投影一起重置，不是前端访问埋点。';
COMMENT ON COLUMN chain_events.market IS '被监听的市场／NFT 挖矿合约地址。';
COMMENT ON COLUMN chain_events.tx_hash IS '链上交易哈希，带 0x 前缀。';
COMMENT ON COLUMN chain_events.log_index IS '日志在区块中的序号；与市场和交易哈希组成幂等键。';
COMMENT ON COLUMN chain_events.block_number IS '日志所在的已确认区块高度。';
COMMENT ON COLUMN chain_events.data IS 'WS 推送或补查 RPC 返回的原始事件日志 JSON，包含 topics、data、blockHash、transactionHash 等。';

-- 已领取收益的钱包去重集合
CREATE TABLE IF NOT EXISTS chain_payees (
    market TEXT NOT NULL,  -- 发放收益的市场合约地址
    wallet TEXT NOT NULL,  -- 曾领取挖矿或邀请收益的钱包，用于统计人数
    PRIMARY KEY (market, wallet)
);

COMMENT ON TABLE chain_payees IS '已成功领取基础挖矿收益或邀请收益的钱包去重集合，用于统计领取人数；不等同于 NFT 持有人列表。';
COMMENT ON COLUMN chain_payees.market IS '发放挖矿或邀请收益的市场合约地址。';
COMMENT ON COLUMN chain_payees.wallet IS '曾成功领取收益的钱包地址；同一市场只计数一次。';

-- 2. 网站访问、广告点击和 UV 埋点

-- 网站访问、广告点击与 UV 埋点
CREATE TABLE IF NOT EXISTS analytics_events (
    event_id         TEXT     PRIMARY KEY,  -- 事件唯一标识，重复上报不重复计数
    kind             TEXT     NOT NULL      -- 事件类型：页面浏览／广告点击／钱包连接
        CHECK (kind IN ('page_view', 'ad_click', 'wallet_connect')),
    page             TEXT     NOT NULL      -- 页面：home／claim／analytics／burn／docs
        CHECK (page IN ('home', 'claim', 'analytics', 'burn', 'docs')),
    site_id          SMALLINT,              -- 广告位编号；非点击事件可为空
    market           TEXT,                  -- 广告投放所属合约；旧数据可为空
    campaign_version BIGINT,                -- 广告投放版本；与 market、site_id 关联广告
    created_at       BIGINT   NOT NULL,     -- 服务端记录的 Unix 时间戳，单位秒
    visitor_id       TEXT                   -- 访问／点击来源 IP 的加盐哈希，用于 UV 去重
);

-- 兼容早期没有访客标识的埋点表；不为历史记录虚构 UV。
ALTER TABLE analytics_events
    ADD COLUMN IF NOT EXISTS visitor_id TEXT;

-- Durable Redis outbox flag: Redis failures never discard accepted events.
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS redis_pending BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS analytics_events_redis_pending
    ON analytics_events (created_at,event_id) WHERE redis_pending;
COMMENT ON COLUMN analytics_events.redis_pending IS 'Redis 统计投影待同步标记；缓存故障后重试，确认同步成功才清除。';

CREATE INDEX IF NOT EXISTS analytics_events_kind_site
    ON analytics_events (kind, site_id);

CREATE INDEX IF NOT EXISTS analytics_events_created
    ON analytics_events (created_at);

CREATE INDEX IF NOT EXISTS analytics_events_campaign
    ON analytics_events (market, site_id, campaign_version)
    WHERE kind = 'ad_click';

COMMENT ON TABLE analytics_events IS '网站埋点明细：浏览、广告点击、钱包连接；用于点击趋势及每次广告投放的点击／UV 统计，不用于确认链上财务结果。';
COMMENT ON COLUMN analytics_events.event_id IS '客户端生成的事件唯一标识；重复上报不重复计数。';
COMMENT ON COLUMN analytics_events.kind IS '事件类型：page_view = 页面浏览，ad_click = 广告点击，wallet_connect = 钱包连接。';
COMMENT ON COLUMN analytics_events.page IS '事件发生页面：home、claim、analytics、burn 或 docs。';
COMMENT ON COLUMN analytics_events.site_id IS '被点击的广告位编号，与 chain_ads.slot 对应；非广告点击事件可为空。';
COMMENT ON COLUMN analytics_events.market IS '该次广告投放的市场合约地址；旧埋点或非投放事件可为空。';
COMMENT ON COLUMN analytics_events.campaign_version IS '广告投放版本号，与 market、site_id 一起关联 chain_ads；旧埋点可为空。';
COMMENT ON COLUMN analytics_events.created_at IS '服务端记录的事件时间，Unix 时间戳，单位秒；旧记录导入时保留原时间。';
COMMENT ON COLUMN analytics_events.visitor_id IS '广告点击来源 IP 的服务端加盐哈希，用于按投放版本去重 UV；不存原始 IP，非点击及旧记录可为空。';

-- 访问统计持久配置
CREATE TABLE IF NOT EXISTS analytics_settings (
    name  TEXT PRIMARY KEY,  -- 配置名称，当前使用 visitor_salt
    value TEXT NOT NULL      -- 服务端配置值；哈希盐不应返回前端
);

COMMENT ON TABLE analytics_settings IS '访问统计所需的持久配置；当前保存访客 IP 哈希盐，保证服务重启后 UV 去重口径稳定。';
COMMENT ON COLUMN analytics_settings.name IS '配置名称；当前使用 visitor_salt。';
COMMENT ON COLUMN analytics_settings.value IS '配置值；visitor_salt 为服务端哈希随机盐，不应通过 API 返回前端。';

-- 3. 创作者手续费检查、回购与销毁

-- 手续费余额检查与回购同步状态
CREATE TABLE IF NOT EXISTS buyback_state (
    vault      TEXT   PRIMARY KEY,  -- 回购销毁金库合约地址
    next_block BIGINT NOT NULL,     -- 下一次要扫描的区块高度
    block_hash TEXT,                -- 上一已索引区块哈希，用于检查链上重组
    data       JSONB  NOT NULL      -- 检查状态、Unix 秒时间、余额和累计回购销毁金额
);

COMMENT ON TABLE buyback_state IS '每个回购金库的同步进度与最近检查状态；正常每 180 秒检查余额，低于门槛也持久化状态，Burn API 直接读取此表。';
COMMENT ON COLUMN buyback_state.vault IS '接收创作者手续费并执行回购销毁的 Vault 合约地址。';
COMMENT ON COLUMN buyback_state.next_block IS '下一次需要扫描的区块高度；与事件记录在同一数据库事务中提交。';
COMMENT ON COLUMN buyback_state.block_hash IS 'next_block - 1 对应的区块哈希，用于发现链上重组；尚未成功同步时可为空。';
COMMENT ON COLUMN buyback_state.data IS 'WS 确认事件投影与余额核对快照：projection 保存精确 wei 计数，seen_at 为流更新时间，checked_at 为余额核对时间，last_error 为安全诊断码；status 为 accumulating／cooldown／eligible／unavailable，另含 checked_at、确认区块和 totals；totals 包含已收手续费、回购支出、销毁量、Vault 余额、待结算费用及 Gas 补偿。时间戳为 Unix 秒，金额为可读十进制字符串。';

-- 回购与销毁合并交易记录
CREATE TABLE IF NOT EXISTS buyback_events (
    vault        TEXT   NOT NULL,  -- 执行回购销毁的金库地址
    tx_hash      TEXT   NOT NULL,  -- 回购与销毁所在的同一笔交易哈希
    log_index    BIGINT NOT NULL,  -- BuybackBurned 日志序号，用于防重复入库
    block_number BIGINT NOT NULL,  -- 交易所在的已确认区块高度
    data         JSONB  NOT NULL,  -- 回购支出（BNB）、销毁量（$Claude）及 Gas 补偿（BNB）
    PRIMARY KEY (vault, tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS buyback_events_history
    ON buyback_events (vault, block_number DESC, log_index DESC);

COMMENT ON TABLE buyback_events IS '已确认的回购与销毁合并记录；每次 BuybackBurned 日志保存一条，并关联同笔交易的 Keeper Gas 补偿，供 Burn 列表展示。';
COMMENT ON COLUMN buyback_events.vault IS '执行该笔回购销毁的 Vault 合约地址。';
COMMENT ON COLUMN buyback_events.tx_hash IS '同时完成回购与销毁的链上交易哈希，用于区块浏览器链接。';
COMMENT ON COLUMN buyback_events.log_index IS 'BuybackBurned 事件在区块中的日志序号；与 Vault、交易哈希组成幂等键，防止重放重复入库。';
COMMENT ON COLUMN buyback_events.block_number IS '该笔回购销毁事件所在的已确认区块高度。';
COMMENT ON COLUMN buyback_events.data IS '合并后的交易详情：spent 为回购支出（BNB），burned 为销毁数量（$Claude），gas_refunded 为 Keeper 补偿（BNB），并含交易哈希、日志序号和区块；金额使用可读十进制字符串。';

-- 每 15 分钟采集的全网挖矿统计；Redis 缓存最新值与各时间窗口曲线。
CREATE TABLE IF NOT EXISTS mining_samples (
    market TEXT NOT NULL,
    sampled_at BIGINT NOT NULL,
    data JSONB NOT NULL,
    PRIMARY KEY (market, sampled_at)
);
COMMENT ON TABLE mining_samples IS '已确认区块的挖矿权重与单位权重日收益快照；不回填未采集的历史，不代表 PoW 算力。';
-- Shared indexer health; the session advisory lock is held on its write connection.
CREATE TABLE IF NOT EXISTS chain_indexer_status (
    chain_id BIGINT PRIMARY KEY,
    data JSONB NOT NULL
);
