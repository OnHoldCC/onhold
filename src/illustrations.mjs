const ink = '#25283b', muted = '#647084', orange = '#c64b20';
const text = (x, y, label, size = 16, color = ink, weight = 400) => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${label}</text>`;
const rect = (x, y, w, h, fill, stroke = 'none', radius = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const callout = (x, y, n) => `<circle cx="${x}" cy="${y}" r="16" fill="${orange}"/>${text(x - 5, y + 6, n, 17, 'white', 700)}`;
const outline = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="${orange}" stroke-width="2.5"/>`;
const frame = content => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560" role="img"><rect width="1000" height="560" rx="16" fill="#edf0f6"/><g font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif">${rect(24, 24, 952, 512, 'white', '#d7dce7', 10)}${rect(24, 24, 952, 46, '#e8ebf2', 'none', 10)}<circle cx="47" cy="47" r="5" fill="#bdc3d0"/><circle cx="65" cy="47" r="5" fill="#bdc3d0"/><circle cx="83" cy="47" r="5" fill="#bdc3d0"/>${rect(122, 33, 749, 28, '#f8f9fc')}${text(140, 53, 'claude.ai/restricted', 13, '#505d73')}${text(741, 520, '界面示意 · 全部为虚构示例', 13, muted)}${content}</g></svg>`;
const tabs = `${rect(25, 84, 950, 42, '#f5f6f9', 'none', 0)}${text(48, 111, 'Elements', 14)}${text(145, 111, 'Console', 14)}${text(231, 111, 'Network', 14)}${text(322, 111, 'Sources', 14)}${text(415, 111, 'Application', 14, '#2258b8', 600)}<path d="M405 125H510" stroke="#2258b8" stroke-width="3"/>`;
const sidebar = `${rect(25, 127, 215, 368, '#fafbfc', '#e4e7ef', 0)}${text(43, 157, 'Storage', 14, muted, 600)}${text(43, 194, '▸ Local storage', 14)}${text(43, 229, '▸ Session storage', 14)}${text(43, 264, '▾ Cookies', 14)}${rect(36, 276, 193, 34, '#e5ecfc', 'none', 3)}${text(58, 298, 'https://claude.ai', 14, '#2258b8')}`;
const table = `${rect(255, 145, 688, 35, '#f8f9fc', '#d9dfeb', 4)}${text(272, 169, 'Filter: sessionKey', 14, muted)}${rect(255, 197, 688, 38, '#f0f2f7', 'none', 0)}${text(273, 222, 'Name', 14, muted, 600)}${text(473, 222, 'Value', 14, muted, 600)}${text(811, 222, 'Domain', 14, muted, 600)}<path d="M457 197V369M795 197V369" stroke="#dce1eb"/>${rect(255, 235, 688, 55, '#e9eefb', 'none', 0)}${text(273, 268, 'sessionKey', 15, ink, 600)}${text(473, 267, 'sk-ant-sid02-EXAMPLE-ONLY…', 14, '#404b64')}${text(810, 268, '.claude.ai', 13)}${text(273, 321, 'sessionKeyLC', 15, muted)}${text(473, 321, '1790000000000', 14, muted)}${text(810, 321, '.claude.ai', 13)}`;

export const illustrations = {
  'open-claude': frame(`${outline(122, 33, 749, 28)}${callout(894, 48, 1)}${text(62, 113, 'Claude', 24, ink, 600)}<rect x="474" y="183" width="45" height="36" rx="7" fill="none" stroke="#555969" stroke-width="2.5"/><path d="M484 183V170a13 13 0 0 1 26 0v13" fill="none" stroke="#555969" stroke-width="2.5"/>${text(325, 272, '你的账号目前受到限制', 27, ink, 600)}${text(292, 310, '请确认已登录需要验证的 Claude 账号。', 19, muted)}${rect(393, 348, 208, 45, '#f3f4f7', '#dddfe8')}${text(428, 377, '账号受限页面示意', 16, muted)}${text(303, 451, '登录后看到受限提示，再回到引导继续。', 18, muted)}`),
  'find-session': frame(`${tabs}${sidebar}${table}${outline(403, 88, 111, 34)}${callout(529, 104, 1)}${outline(37, 276, 192, 34)}${callout(218, 256, 2)}${outline(255, 145, 688, 35)}${callout(927, 158, 3)}${rect(265, 394, 663, 74, '#fff3eb')}${text(287, 424, '1  Application（应用）    →    2  Cookies / claude.ai', 17, orange, 600)}${text(287, 451, '3  在筛选框输入 sessionKey', 17, orange, 600)}`),
  'copy-value': frame(`${tabs}${sidebar}${table}${outline(265, 244, 179, 37)}${outline(463, 244, 327, 37)}${rect(474, 248, 305, 26, '#d6e1fc', 'none', 2)}${text(479, 267, 'sk-ant-sid02-EXAMPLE-ONLY…', 14, '#233d7c')}${callout(769, 304, 1)}<path d="M761 291L744 277" stroke="${orange}" stroke-width="2"/>${text(686, 348, '双击值并复制完整内容', 15, orange, 600)}${text(270, 368, '不是 sessionKeyLC', 15, muted)}${rect(264, 397, 664, 72, '#fff3eb')}${text(287, 428, '仅复制 sessionKey 的 Value，不要复制整份 Cookie。', 17, orange, 600)}${text(287, 453, '不要把真实凭证发给他人，也不要截图分享。', 16, '#8b543b')}`),
  verify: frame(`${text(76, 120, 'ONHOLD', 25, ink, 800)}${text(76, 165, '验证 Claude 封禁状态', 27, ink, 600)}${rect(76, 192, 844, 48, '#f2f4fa')}${text(96, 222, '领取钱包  0x1234…abcd', 17, muted)}${text(78, 282, '会话凭证', 16, ink, 600)}${rect(76, 296, 844, 49, 'white', orange)}${text(95, 328, '••••••••••••••••••••••••••••••••', 19, muted)}${callout(930, 319, 1)}${text(77, 377, '正式上线前，需明确说明凭证用途及处理方式。', 16, muted)}${rect(76, 407, 844, 49, '#292d48')}${text(391, 438, '验证封禁状态（示意）', 17, 'white', 600)}${text(78, 486, '此图不是验证成功凭证；领取还需服务器确认和钱包交易。', 15, muted)}`),
};
const englishLabels = {
  '界面示意 · 全部为虚构示例':'Illustration · Fictional examples',
  '你的账号目前受到限制':'Your account is restricted',
  '请确认已登录需要验证的 Claude 账号。':'Sign in to the Claude account you want to verify.',
  '账号受限页面示意':'Restriction page example',
  '登录后看到受限提示，再回到引导继续。':'After confirming the restriction, return to this guide.',
  '1  Application（应用）    →    2  Cookies / claude.ai':'1  Application    →    2  Cookies / claude.ai',
  '3  在筛选框输入 sessionKey':'3  Filter for sessionKey',
  '双击值并复制完整内容':'Double-click and copy the full value',
  '不是 sessionKeyLC':'Not sessionKeyLC',
  '仅复制 sessionKey 的 Value，不要复制整份 Cookie。':'Copy only the sessionKey value, not all cookies.',
  '不要把真实凭证发给他人，也不要截图分享。':'Do not share real credentials or screenshots of them.',
  '验证 Claude 封禁状态':'Verify Claude account restriction',
  '领取钱包  0x1234…abcd':'Receiving wallet  0x1234…abcd',
  '会话凭证':'Session credential',
  '正式上线前，需明确说明凭证用途及处理方式。':'Review how your credential will be used before submitting.',
  '验证封禁状态（示意）':'Verify restriction (illustration)',
  '此图不是验证成功凭证；领取还需服务器确认和钱包交易。':'This is not claim proof. Server verification and a wallet transaction are required.',
};
export const englishIllustrations=Object.fromEntries(Object.entries(illustrations).map(([name,source])=>[name+'-en',Object.entries(englishLabels).reduce((svg,[zh,en])=>svg.replaceAll(zh,en),source)]));
