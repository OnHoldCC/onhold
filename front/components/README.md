# 前端组件（components）

所有 React 页面、业务组件和共享组件库统一放在这个目录。

| 目录／文件 | 用途 |
| --- | --- |
| `onhold/App.jsx` | 应用主组件，包含导航、首页、Claim、Analytics、Burn 和弹窗 |
| `onhold/Docs.jsx`、`onhold/OutlineCurve.jsx`、`onhold/docs.css` | Docs 页面和目录动画 |
| `onhold/BanPassCard.jsx` | NFT 卡片 |
| `onhold/NftMining.jsx`、`onhold/NftStaking.jsx` | 挖矿收益、质押 NFT 卡片和添加质押弹窗 |
| `onhold/TokenMediaUpload.tsx` | 图片上传组件 |
| `singlespark/` | 项目实际使用的 SingleSpark 共享组件库，通过 `@singlespark/component-atlas` 导入 |

`singlespark/dist/` 是共享组件包自带的发行文件，不是另一套网站；其资源、来源说明和许可证需要一起保留。网站业务改动优先写在 `onhold/`。

`../src/main.jsx` 只负责挂载应用，`../src/` 中的其他文件是 API、链交互、翻译、业务逻辑和静态资源。`../dist/` 是网站构建产物，不要直接修改；在项目根目录运行 `npm run build` 重新生成。

交易进度直接引用共享库 `/ui` 的 `TransactionProgressDialog`、`TimingSteps` 和 `TimingDetails`；计时采集和阶段合并也由共享库实现。OnHold 只绑定阶段名称、翻译、回执和恢复逻辑。手机端头部 × 与底部关闭均只收起弹框，顶部可重新查看原交易。

标签输入、媒体上传、链接复制、数值加载态、合约地址列表和 GitHub 图标链接均来自共享库。更新时先在 SingleSparkUiUx 运行 `npm run build:package`，再在本项目运行 `node front/scripts/sync-singlespark.mjs ../SingleSparkUiUx`；同步只替换发行文件，保留 `runtime/` 钱包适配器。

`nft-display.mjs` 只统一网站显示副本的 BANNED 印章颜色，不修改链上 NFT 元数据或已上传图片。
