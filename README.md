# ONHOLD

React 中英文界面、Rust 埋点服务与 BNB Chain 测试网合约。导航只有「中转站」和「赔付领取」；数据详情由首页底部组件进入。

首页上方是官网广告卡片，下方是参考 SingleSpark 的 Claim 滚动领取记录、$Claude 销毁统计和 Analytics 领取统计。没有真实链上数据时，这些组件明确标为示例。

## 运行

需要 Node.js、Rust；合约测试还需要已安装的 Foundry `anvil`。首次运行：

```sh
npm ci
npm run dev
```

`npm run dev` 编译合约和 React，启动 Rust 服务：http://127.0.0.1:4190。修改前端后运行 `npm run build` 并刷新。单独看静态版可运行 `npm run preview:static`。`npm test` 运行 Node/本地链测试与 Rust 测试；首次 Rust 依赖未缓存时先运行 `cargo test --manifest-path backend/Cargo.toml` 下载依赖。

## BNB 测试网部署

使用 BNB Smart Chain Testnet（chain ID 97），竞价支付单位是 tBNB。官方 RPC 配置来源：https://docs.bnbchain.org/bnb-smart-chain/developers/json_rpc/json-rpc-endpoint/

打开 `http://127.0.0.1:4190/?setup=1`。在有测试 BNB 的浏览器钱包中确认部署：

- 一次部署交易创建 `ClaudeTestToken` 和 `OnholdMarket`。
- 测试代币名称是 Claude Test Token，符号 Claude，18 位精度。100 万枚测试代币全部转入领取池；这只是测试资金，不是正式代币经济模型。
- `TestDeployment` 和测试代币禁止在 BNB 主网部署，仅支持 chain ID 97 或本地 31337。
- 竞价合约 Owner 和初始核验签名者均为部署钱包。只有 Owner 能提现 BNB 广告收入、轮换核验签名者；不能直接提取领取池的 $Claude。
- 部署地址保存于本浏览器。要让所有访客使用同一合约，将 marketAddress 写入 `src/chain-config.json` 后重新构建发布。

本任务只在本地链完成部署测试，未持有用户部署账户或发送 BNB 公链交易。最后一次测试网部署必须由用户钱包签名。

## 合约规则

`contracts/OnholdMarket.sol` 在链上计算价格和校验付款：前 24 小时不衰减，每满 24 小时减半，精确到 wei，最低 1 wei；空广告位从大于 0 的出价开始。必须严格高于当前价才能替换广告，每次替换重新计时。广告位 version 用来拒绝旧页面报价，避免意外买入已变化的广告位。新的完整出价作为广告费用进入合约，不退回之前广告费；Owner 可提取 BNB 收入。

`claim` 要求核验签名者的 EIP-712 凭证，绑定领取钱包、组织去重标识、金额、有效期、chain ID 和合约地址。重复标识不能领取。合约分别统计领取次数和实际领取钱包数；钱包数不等于自然人数。测试代币支持标准 burn/burnFrom，并记录 totalBurned。

这不是去信任的封禁预言机：核验签名者具有发放领取池资金的权限。真实 Claude 服务端核验和签名服务尚未接入，因此赔付表单禁用，当前不会接收 Session 或自动发币。初始部署钱包也不能被当作自动核验服务已就绪。

## Rust 埋点

`backend/src/main.rs` 使用 Axum + SQLite（WAL），同一服务托管 React 静态文件。事件写入 `backend/data/events.sqlite3`，不进入 Git。

- `POST /api/events`：page_view、ad_click、wallet_connect。
- `GET /api/stats`：访问次数、广告点击、钱包连接次数、各广告位点击、最近 30 天按北京时间汇总的点击。
- `GET /api/health`：服务状态。

只记录随机事件 ID、类型、页面和广告位。没有用户画像、Claude Session、Cookie、完整钱包地址或客户端时间戳。event_id 幂等去重，拒绝未知字段、错误类型、非法广告位、跨 Origin 请求和过大的请求体；SQLite 操作使用后台阻塞任务和参数化 SQL。未传 Origin 的服务端请求可以调用接口，浏览器 Origin 必须与配置一致。

这些是公开客户端埋点，不具备反作弊或广告计费可信度；点击按广告位汇总，不代表独立访客。领取/销毁数量不能由前端事件增加，统计接口将未接入的金融数据返回 null。配置链上合约后，前端从合约读取领取钱包数、领取总量和销毁量。历史事件明细与趋势仍需链上索引，不伪造为真实趋势。

可配置：ONHOLD_ADDR、ONHOLD_ORIGIN、ONHOLD_DATA_DIR、ONHOLD_DIST_DIR。默认仅监听 127.0.0.1；部署到服务器时应在 HTTPS 反向代理后设置准确 Origin，并持久化数据目录。

## 验证边界

已在用户授权浏览器中观察到 `/api/account/standing` 返回 standing、banned_at、prev_plan_tier、banned_orgs[].uuid、has_active_org。它属于内部接口，尚未完成独立服务端复查。组织 UUID 不是个人用户 ID；此前套餐不是当前有效订阅；没有完整账单或封禁历史。

正式核验不执行用户提供的 cURL、不接受任意验证 URL、不将登录凭证写入日志/数据库/链上；请求失败、验证码和 403 不能当成封禁证据。所有教程图片均使用虚构数据，中英文图片都可放大查看。

## 发布与测试

Sites 私有托管版本是前端预览；Sites 不能运行本项目的 Rust 二进制。Rust 埋点已在本机运行并完成点击落库验证，正式上线需要额外部署 Rust 服务。当前不自动对外公开后端。

测试覆盖：合约实际执行的时间衰减、低价拒绝、广告版本保护、提现权限、钱包/合约绑定、防重复领取、期限/金额篡改，前端多语言一致性、图片完整性、报价精度和本地演示数据安全，以及 Rust 幂等、持久化、请求校验、Origin 边界和金融数据隔离。合约未完成独立安全审计，仅用于测试网。
