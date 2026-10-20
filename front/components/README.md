# 前端组件（components）

所有 React 页面、业务组件和共享组件库统一放在这个目录。

| 目录／文件 | 用途 |
| --- | --- |
| `onhold/App.jsx` | 应用主组件，包含导航、首页、Claim、Analytics、Burn 和弹窗 |
| `onhold/Docs.jsx`、`onhold/OutlineCurve.jsx`、`onhold/docs.css` | Docs 页面和目录动画 |
| `onhold/BanPassCard.jsx` | NFT 卡片 |
| `onhold/NftMining.jsx`、`onhold/NftGallery.jsx` | NFT 质押和列表 |
| `onhold/TokenMediaUpload.tsx` | 图片上传组件 |
| `singlespark/` | 项目实际使用的 SingleSpark 共享组件库，通过 `@singlespark/component-atlas` 导入 |

`singlespark/dist/` 是共享组件包自带的发行文件，不是另一套网站；其资源、来源说明和许可证需要一起保留。网站业务改动优先写在 `onhold/`。

`../src/main.jsx` 只负责挂载应用，`../src/` 中的其他文件是 API、链交互、翻译、业务逻辑和静态资源。`../dist/` 是网站构建产物，不要直接修改；在项目根目录运行 `npm run build` 重新生成。
