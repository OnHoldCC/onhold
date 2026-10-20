export const steps = [
  {
    "title": "打开 Claude，登录你的账号",
    "intro": "使用平时登录 Claude 的桌面版 Chrome 浏览器，打开受限页面。",
    "image": "guide/open-claude.jpg",
    "alt": "Claude 真实受限页截图，使用 Chrome 翻译显示英文，标题为账号将保持关闭。",
    "instructions": [
      "点击下方按钮，在新标签页打开 Claude。",
      "如果出现登录页面，先登录需要验证的账号。",
      "确认页面显示账号受限，保持 Claude 标签页打开，继续下一步。"
    ],
    "tip": "仅打开这个地址不代表已经被封禁，最终以服务器验证结果为准。"
  },
  {
    "title": "找到 standing 请求并复制 cURL",
    "intro": "在 Claude 受限页按以下顺序操作，截图编号对应步骤 2、4、5、6。",
    "image": "guide/network-curl.png",
    "alt": "真实 Chrome Network 截图：Network 标签、standing 筛选框、standing 请求、Copy 和 Copy as cURL 菜单带编号标记。",
    "instructions": [
      "按 F12 打开开发者工具；部分键盘需 Fn + F12。Mac 可按 ⌥⌘I。",
      "选择 Network（网络）面板，不是 Console（控制台）。",
      "保持开发者工具打开，按 F5 刷新 Claude 页面；Mac 按 ⌘R。",
      "在 Network 的筛选框输入 standing，找到 Name 为 standing 的请求。",
      "在这条 standing 请求上单击鼠标右键，打开菜单。",
      "依次选择 Copy（复制）→ Copy as cURL（复制为 cURL），不要选 Copy URL。"
    ],
    "tip": "没有出现 standing 时，先确认已选择 Network，再刷新页面；浏览器语言不同，菜单名称可能显示中文。"
  },
  {
    "title": "回到本站，粘贴 cURL",
    "intro": "复制完成后切回 onHold，粘贴刚才的完整 cURL 请求。",
    "image": "guide/verify.png",
    "alt": "本站真实验证表单，标有 cURL 输入框与粘贴按钮。",
    "instructions": [
      "切回本网站，在 cURL 输入框点击“粘贴”，或使用 Ctrl+V（Mac：⌘V）。",
      "点击“下一步”，等待服务器核验真实封禁状态。",
      "成功后核对生成的 NFT 图片和账号信息，再进入铸造。"
    ],
    "tip": "不要把 cURL 发到聊天或群里。浏览器只提取其中的 sessionKey 用于核验，不保留其他请求头。"
  },
  {
    "title": "先生成图片，再铸造 NFT",
    "intro": "核对封禁账号信息，再铸造 NFT，质押后开始挖矿。",
    "image": "guide/verify.png",
    "alt": "本站真实验证表单截图，展示空请求输入框和粘贴按钮。",
    "instructions": [
      "回到本站，粘贴 cURL 或 sessionKey，点击“下一步”。",
      "在第二步核对右侧 PNG 卡片、套餐、封禁时间和 UUID：Pro 权重为 1，Max 为 3。",
      "连接钱包后点击提交，跟随步骤弹框签名并确认铸造；完成后到挖矿页质押。"
    ],
    "tip": "一个已核验的封禁账号只能铸造一次；仅持有 NFT 不产出，质押后才能挖矿。"
  }
];

export function instructionsFor(step) {
  return step.instructions;
}

export function nextStep(current, direction) {
  return Math.min(steps.length - 1, Math.max(0, current + direction));
}
