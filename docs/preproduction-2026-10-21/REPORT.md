# 投产前检查（2026-10-21）

结论：当前公开站点是可用的 BNB 测试网应用，不能直接按 BNB 主网生产服务上线。用户已确认主网合约尚未部署。清理演示入口与完成主网迁移是两件事；本次没有签名、广播、部署或注资任何主网交易。

## 本次已清理与验证

- 删除公开页面 `?setup=1` 的部署测试代币/合约弹框及浏览器部署函数；构建产物不再包含 TestDeployment、MockTestDeployment、ClaudeTestToken 部署字节码。
- 首页启动不再读取或写入 `onhold.market.v1` 的虚构广告；未配置或接口失败时保留加载/失败状态，不回退到演示站点。
- 删除模拟竞价的本地成功分支；缺少链上合约时拒绝操作，只有真实链上交易确认后才显示成功。
- 删除测试钱包覆盖合约地址、localStorage 覆盖合约地址以及重复 UUID 的测试提示入口。以站点配置与后端已校验响应为准。
- 保留真实的测试网网络提示、教程示例标注与永久公开上链说明，避免在仍运行测试链时伪装成主网。测试脚本、历史部署清单和数据库保留，不进入对外部署入口；未清库。
- Rainbond readiness 探针由 `/api/health` 修正为 `/api/ready`。前者即使链索引异常也返回 HTTP 200，只适合存活判断。
- 发布前检测到线上后端由 flap-connected-r2 更新为 r3，清理镜像必须基于最新后端，仅替换前端静态资源，不覆盖这些更新。
- 最终更名回归：Node 147/147、Rust 57/57，共 204 项通过；另对旧 setup 参数和地址覆盖钩子的专项回归 2/2。包含本地链、后端索引重连/重组、缓存并发刷新与前端构建测试，不等于主网验收或独立合约审计。

## 参数逐项对照

| 项目 | 当前测试环境实测/代码 | 主网投产要求 | 状态 |
| --- | --- | --- | --- |
| 正式代币名称/符号 | 用户确定：名称 OnHold，符号 OnHold，页面单位 $OnHold | 正式 Flap 代币创建、矿池与回购统一使用该代币地址；Claude 仅指账号核验产品 | 主网未部署 |
| 网络 | 前端、API、RPC、WS、签名域、回执校验、Keeper 均为 97 | 全链路 56，RPC/WS 启动核验一致 | 阻断：多处 97 硬编码未适配 |
| 页面域名/Origin | `https://onhold.cc`，线上 Origin 一致 | 正式域名、HTTPS、跨域拒绝保持一致 | 当前一致 |
| NFT 合约 | `0xe6FCaf7da63c581afc22B27D0aCf27eB26645A1f`（97） | 56 上新部署并登记 verifier、部署区块、权限 | 主网未部署 |
| 挖矿/广告合约 | `0x6dF5e9B6c29fdA32187f34653003617EC9e1A180`，区块 138068318（Mock） | 正式 GameplayVault 及代理/实现、初始化参数、NFT/奖励代币绑定 | 主网未部署 |
| 回购合约 | `0xD53efA601e87b0173AE336BbF6f563E6A7B7ADdd`，区块 138073121（97） | 正式 Flap Vault/Token/Processor/Portal 互相匹配 | 主网未部署 |
| 回购展示代币 | API 返回 `$OHLDTEST`；挖矿仍为旧测试代币 | 以正式代币合约/符号为准，核对回购、销毁与矿池的代币绑定 | 测试用途，未完成正式绑定 |
| RPC / WS | `bsc-testnet-rpc.publicnode.com`（HTTPS/WSS） | 可靠的 BNB 主网 RPC + WSS，同链、限额、断线补块和备用方案 | 未配置 |
| 广告 Keeper | 单实例 `--ads --mock` | 单独主网钱包、去 Mock、正式 Portal/代币、匹配 adKeeper 权限 | 阻断 |
| 回购 Keeper | 已独立运行，不带 Mock；RPC 仍为测试网，目标同上 | 主网签名与交易保护、独立钱包、Vault keeper 权限一致 | 仍为测试网 |
| 回购周期 | 180 秒 | 合约与任务统一 180 秒 | 策略一致，主网待验 |
| 回购门槛 | 测试网 0.001 BNB；Mock 广告模式可更低 | 主网 0.01 BNB（contracts/buyback-policy.json、FlapBuyback、GameplayVault） | 不能沿用测试值 |
| 广告最低出价 | 普通合约 0.001 BNB；Mock 实际值由索引返回 | 正式合约最低 0.001 BNB；替换至少当前价 +10%，每日衰减 | 与回购门槛不是同一参数 |
| Keeper Gas/滑点 | 1 gwei 上限、100 bps；Gas 补偿上限 0.0001 BNB | 根据主网实际报价确认，保留 gas/slippage/deadline/nonce/单实例保护 | 参数需主网演练 |
| 签名/执行密钥 | 测试 API verifier 与两类 Keeper 已配置，仅检查存在，不回显密钥 | 正式环境专用 verifier、广告 Keeper、回购 Keeper；与链上角色对应，所有者/升级权限单独保管 | 生产密钥与角色未验 |
| 配置隔离 | 当前 default_environment=preview；secrets.preview 存在，env.prod/secrets.prod 缺失 | 独立 prod 应用/组件或明确切换流程，专用配置与权限；代码当前不支持仅加 CHAIN_ID 环境变量完成迁移 | 未完成 |
| 数据隔离 | API/PG/Keeper 持久化，单实例；测试 NFT、邀请和统计数据存在 | 新生产 PG 数据库、SQLite、Redis 命名空间和 Keeper journal；旧数据归档 | 未隔离，不能直接复用或清库 |
| 数据库端口 | PG 5432、Redis 6379 仅内网 | 保持内网访问，限制凭据权限 | 已核对 |
| 存活探针 | 当前平台 liveness=false；readiness 已修正为 `/api/ready` | 配置/确认独立存活检测 `/api/health`，避免与索引就绪状态混淆 | 待完善 |
| 发布并发索引 | 滚动发布出现两个 API 索引器共用 PG 时反复报 chain_reorg；工作区含未发布回购改动的新后端在单实例下仍重连，不能仅归因于并发 | 索引写入者增加数据库级互斥/主从选举；当前按停止 API 后单实例启动切换 | 主网前需修复并做滚动发布回归 |
| 健康状态 | `/api/health`、`/api/ready` 返回 ok，公开 API 为 chain_id 97 | 主网切换后索引追平且 ready=200 | 当前测试站正常，不代表主网就绪 |
| 核验凭证说明 | 页面存在“不上传”措辞，但 /api/verify 实际将凭证提交到本站后端，再用于 Claude 官方 standing 核验 | 正式上线前准确说明传输路径，保持不落库、不记录、不上链；不要宣称完全不上传 | 文案需复核 |
| 可信代理 | 未配置 ONHOLD_TRUSTED_PROXIES | 核实 Rainbond 可信入口 IP 后配置，验证 UV/IP 识别和限流，不能信任任意 X-Forwarded-For | 待核对真实代理地址 |
| 限流 | 网关约 50/s/单 IP；业务代码另有全站小时配额（头像 20、核验 100、NFT 图片 100） | 宣传引流前落实按钱包/可信客户端的配额与滥用保护，避免耗尽全站额度 | 公开大流量前需处理 |
| 备份/恢复/告警 | 持久化已确认；未取得离机备份、恢复演练与告警接收的证据 | PG+SQLite+密钥+Keeper journal 定期备份，实际恢复测试，RPC/索引/余额/失败告警 | 未验证 |

## 主网适配代码位置

- `front/src/chain.mjs`、`chain-config.json`：网络、钱包切链、合约地址、RPC、explorer、交易/证明校验。
- `front/src/claims-api.mjs`、`mining-receipt.mjs`、`referral-history.mjs`、`referrals.mjs`：状态、回执、本地待确认缓存和邀请校验也锁定 97。
- `backend/src/crypto.rs:mint_digest`：EIP-712 链 ID 固定为 97；只改接口展示的 chain_id 会产生无效主网证明。
- `backend/src/main.rs`、`claims.rs`、`mining.rs`、`referrals.rs`、`chain_stream.rs`、`burn.rs`：RPC/WS 网络保护、签名/回执、索引响应和策略需要统一配置，不能删除保护条件来绕过。
- `backend/scripts/buyback-keeper.mjs`：provider、chainId、pending journal、Portal 与策略索引固定为测试网；必须显式适配 56 后再启用，不能仅删除 `--mock`。
- `rainbond.app.json` 与各实际组件：目前是测试部署；正式参数应以新的主网部署清单为准。任何临时占位地址不能启用签名或执行任务。

## 上线顺序与缺项

1. 完成 56/97 配置化及跨网络拒绝测试，准备正式网络/地址/区块/代币/角色清单；主网地址不齐时保持不可签名、不可交易，不复用测试地址。
2. 对最终 NFT、GameplayVault（含代理与升级权限）、FlapBuyback 与正式代币税费路径做部署前审查。现有测试不替代修改后合约的独立审计；核对 owner/verifier/keeper、初始化防抢跑与角色隔离。
3. 用户钱包完成主网部署、正式代币/Flap 参数绑定及公开源码验证；提供可核验的交易哈希与部署区块。配置正式签名者和执行者，矿池资金与 Gas 由用户确认后安排。
4. 建立独立生产配置与数据空间；备份原测试数据，配置 readiness、备份恢复、告警与按客户端/钱包限流。
5. 先只读验证所有地址存在代码、协议/链 ID/代币/角色一致，索引追平；再由用户完成主网小额铸造、质押、领取、解押、邀请、竞价、回购/销毁演练。
6. 全部演练通过后正式开放；将测试站保留在独立地址或关闭入口。不可把清除 Mock 文案当作完成投产。

## 检查边界

本次核对的是仓库、部署清单、当前 Rainbond 五个组件的运行配置和公开 API，密钥仅核对配置存在。未部署主网合约、未做主网签名/广播/注资、未删除数据库和链上记录、未完成独立安全审计或真实主网全流程，也未确认离机备份可恢复。主网参数没有可验证的实际值时一律标记未完成。

代币命名更新：页面、8 种语言、后端默认统计单位及未来新部署合约的描述统一为 OnHold / $OnHold。Claude 账号核验和 Claude Code 产品名保留。历史已部署测试合约的 ERC20 名称与不可变 NFT 图像不会因源码文案更新而改变；正式代币需按新名称部署。回购页的 OHLDTEST 仍按当前实际测试代币显示，不伪装为主网代币。

发布验收补充：直接从当前工作区构建的 v54 后端包含尚未上线的回购源改动，单实例也反复 chain_reorg，已停止使用并恢复已验证的 r3 后端。币名后端发布应仅从已上线 r3 对应源码应用 released-backend-currency.patch，不能混入未完成的回购改动；主网前仍需解决索引互斥与同步稳定性。

最终后端发布基线：仅在已上线 r3 的精确源码中修改 pg.rs、analytics.rs、analytics_cache.rs、burn.rs 的默认币名及缓存标签；chain_stream.rs、mining.rs、claims.rs、crypto.rs、referrals.rs 与 r3 逐字节一致。工作区未发布的 Flap 代币直接索引改动保留在本地，本次不打包。补丁见 released-backend-currency.patch。

最终交付：线上使用 token-onhold-verified-v56，API 与网页的币名为 $OnHold；JS/CSS 与冻结构建一致，/api/ready=200、索引已追平、仍为 chain_id 97。未启用主网，未清空数据库，未改全站小时配额，未把 OHLDTEST 测试回购伪装成主网币。验证见 rename-release-check.json。
