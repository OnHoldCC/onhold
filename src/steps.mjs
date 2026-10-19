export const steps = [
  {
    title: '打开 Claude，登录你的账号',
    intro: '使用平时登录 Claude 的桌面版 Chrome 浏览器，打开受限页面。',
    image: 'open-claude',
    alt: 'Chrome 界面示意：地址栏为 claude.ai/restricted，页面显示账号受限。橙色标记指向地址栏。',
    instructions: ['点击下方按钮，在新标签页打开 Claude。', '如果出现登录页面，先登录需要验证的账号。', '确认页面显示账号受限，再回到本页继续。'],
    tip: '仅打开这个地址不代表已经被封禁，最终以服务器验证结果为准。',
  },
  {
    title: '找到会话凭证所在的位置',
    intro: '在 Claude 标签页打开开发者工具，按图依次选择这三个位置。',
    image: 'find-session',
    alt: '开发者工具示意：依次选择 Application（应用）、Cookies 下的 https://claude.ai，再在筛选框输入 sessionKey。',
    instructions: ['打开开发者工具：{shortcut}。', '点击 Application（应用）。看不到时，点击顶部的 » 找到它。', '展开左侧 Cookies，选择 https://claude.ai，然后在筛选框输入 sessionKey。'],
    tip: '不要选择 Clear all cookies（清除全部 Cookie），它可能让你退出登录。',
  },
  {
    title: '只复制 sessionKey 的值',
    intro: '找到名称完全等于 sessionKey 的那一行，不要选择 sessionKeyLC。',
    image: 'copy-value',
    alt: 'Cookie 表格示意：选中 sessionKey 行，双击 Value（值）单元格并复制；sessionKeyLC 行标记为不要复制。图中所有值均为虚构示例。',
    instructions: ['确认 Name（名称）一栏写的是 sessionKey。', '双击这一行的 Value（值）单元格，选中完整内容并复制。', '保留 Claude 标签页，回到本网站。不要把凭证发到聊天、群聊或截图中。'],
    tip: 'sessionKey 是登录凭证。只在确认可信、使用 HTTPS 的验证页面中填写；不要提交完整 Cookie 或 cURL。',
  },
  {
    title: '回到本站，验证后再领取',
    intro: '正式流程会将验证结果绑定到当前钱包，避免他人使用同一结果领取。',
    image: 'verify',
    alt: '验证页面示意：已连接的钱包、会话凭证输入框、使用说明与验证按钮。图中的验证结果不是实际赔付凭证。',
    instructions: ['确认领取钱包地址是你自己的地址。', '在正式验证框粘贴会话凭证，并阅读本次使用说明。', '等待服务器确认封禁状态和是否已领取，通过后再由钱包确认领取交易。'],
    tip: '当前仅为图解预览，尚未接入验证服务或合约，因此不接收真实凭证，也不会发放代币。',
  },
];

export function instructionsFor(step, os) {
  return step.instructions.map(line => line.replace('{shortcut}', os === 'mac' ? '⌘ Command + ⌥ Option + I' : 'Ctrl + Shift + I'));
}

export function nextStep(current, direction) {
  return Math.min(steps.length - 1, Math.max(0, current + direction));
}
