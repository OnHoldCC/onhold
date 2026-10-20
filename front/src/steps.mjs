export const steps = [
  {
    title: '打开 Claude，登录你的账号',
    intro: '使用平时登录 Claude 的桌面版 Chrome 浏览器，打开受限页面。',
    image: 'guide/open-claude.jpg',
    alt: 'Claude 真实受限页截图，使用 Chrome 翻译显示英文，标题为账号将保持关闭。',
    instructions: ['点击下方按钮，在新标签页打开 Claude。', '如果出现登录页面，先登录需要验证的账号。', '确认页面显示账号受限，再回到本页继续。'],
    tip: '仅打开这个地址不代表已经被封禁，最终以服务器验证结果为准。',
  },
  {
    title: '找到会话凭证所在的位置',
    intro: '在 Claude 标签页打开开发者工具，按下方步骤依次定位。',
    image: 'guide/cookies-redacted.png',
    alt: 'Chrome 开发者工具 Application 的真实 Cookie 表格，所有 Value 值均已遮挡，名称和域名保持可见。',
    instructions: ['点击 Chrome 右上角 ⋮ → 更多工具 → 开发者工具。', '点击 Application（应用）。看不到时，点击顶部的 » 找到它。', '展开左侧 Cookies，选择 https://claude.ai，然后在筛选框输入 sessionKey。'],
    tip: '不要选择 Clear all cookies（清除全部 Cookie），它可能让你退出登录。',
  },
  {
    title: '只复制 sessionKey 的值',
    intro: '找到 sessionKey，不要选择 sessionKeyLC。截图已遮挡值，请在自己的浏览器里复制对应的 Value 单元格。',
    image: 'guide/cookies-redacted.png',
    alt: '真实 Cookie 表格，sessionKey 位于 sessionKeyLC 上方；整列 Value 值已遮挡。',
    instructions: ['确认 Name（名称）一栏写的是 sessionKey。', '双击这一行的 Value（值）单元格，选中完整内容并复制。', '保留 Claude 标签页，回到本网站。不要把凭证发到聊天、群聊或截图中。'],
    tip: 'sessionKey 是登录凭证。只在确认可信、使用 HTTPS 的验证页面中填写；也可粘贴复制的 cURL，浏览器只提取 sessionKey，并丢弃其他请求头。',
  },
  {
    title: '先生成图片，再铸造 NFT',
    intro: '核对封禁账号信息，再铸造 NFT，质押后开始挖矿。',
    image: 'guide/verify.png',
    alt: '本站真实验证表单截图，展示空请求输入框和粘贴按钮。',
    instructions: ['回到本站，粘贴 cURL 或 sessionKey，点击“下一步”。', '在第二步核对右侧 PNG 卡片、套餐、封禁时间和 UUID：Pro 权重为 1，Max 为 3。', '连接钱包后点击提交，跟随步骤弹框签名并确认铸造；完成后到挖矿页质押。'],
    tip: '一个已核验的封禁账号只能铸造一次；仅持有 NFT 不产出，质押后才能挖矿。',
  },
];

export function instructionsFor(step) {
  return step.instructions;
}

export function nextStep(current, direction) {
  return Math.min(steps.length - 1, Math.max(0, current + direction));
}
