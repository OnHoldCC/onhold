const shapes = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  claim: '<path d="M12 3v10m-4-4 4 4 4-4M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
  chart: '<path d="M3 3v18h18M6 15l5-5 4 3 6-7"/>',
  wallet: '<path d="M20 8V5H5a2 2 0 0 0 0 4h16v11H5a2 2 0 0 1-2-2V7m18 6h-5v3h5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
};
export const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name]}</svg>`;
const page = document.body.dataset.page;
document.body.insertAdjacentHTML('afterbegin', `<aside class="site-sidebar"><a class="brand" href="./"><span class="brand-symbol" aria-hidden="true">Ⅱ</span>ONHOLD</a><nav aria-label="主菜单"><a href="./" ${page !== 'claim' ? 'aria-current="page"' : ''}>${icon('home')}首页</a><a href="claim.html" ${page === 'claim' ? 'aria-current="page"' : ''}>${icon('claim')}赔付领取</a></nav><div class="sidebar-bottom"><span class="testnet-dot"></span> Sepolia 测试网<p>独立社区项目<br>非 Anthropic 官方服务</p></div></aside><header class="site-header"><span class="header-location">${{home:'首页',analytics:'首页 / 数据详情',claim:'赔付领取'}[page]}</span><div class="header-actions"><span class="data-label">示例数据</span><button id="theme-toggle" class="icon-button" aria-label="切换深浅主题" type="button">${icon('sun')}</button><a class="pill pill-outline header-claim" href="claim.html">领取赔付</a><button id="connect-wallet" class="wallet-button" type="button">${icon('wallet')}<span>连接钱包</span></button></div></header><div id="wallet-message" role="status" class="wallet-message" hidden></div>`);
let dark = false;
try { dark = localStorage.getItem('onhold.theme') === 'dark'; } catch {}
document.documentElement.dataset.theme = dark ? 'dark' : 'light';
document.getElementById('theme-toggle').addEventListener('click', () => {
  dark = !dark; document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  try { localStorage.setItem('onhold.theme', dark ? 'dark' : 'light'); } catch {}
});
const button = document.getElementById('connect-wallet');
const message = document.getElementById('wallet-message');
function notice(text) { message.textContent = text; message.hidden = false; }
function showAccount(accounts) {
  const account = accounts?.[0];
  button.querySelector('span').textContent = account ? account.slice(0,6) + '…' + account.slice(-4) : '连接钱包';
  const target = document.getElementById('claim-wallet');
  if (target) target.textContent = account || '请先连接领取钱包';
}
button.addEventListener('click', async () => {
  if (!window.ethereum?.request) { notice('未检测到浏览器钱包。请在已启用钱包的浏览器中打开；图片指南可以直接查看。'); return; }
  button.disabled = true;
  try {
    showAccount(await window.ethereum.request({method:'eth_requestAccounts'}));
    const chain = await window.ethereum.request({method:'eth_chainId'});
    notice(chain === '0xaa36a7' ? '已连接 Sepolia 钱包。验证服务和领取合约尚未接入。' : '钱包已连接，当前网络不是 Sepolia。本次只读取地址，不发起交易。');
  } catch(error) { notice(error.code === 4001 ? '你取消了钱包连接，可以继续查看图片指南。' : '连接失败，请打开钱包后重试。'); }
  finally { button.disabled = false; }
});
window.ethereum?.on?.('accountsChanged', accounts => { showAccount(accounts); notice('钱包账户已变更，正式领取前需要重新验证。'); });
window.ethereum?.on?.('chainChanged', () => notice('钱包网络已变更。当前页面未接入交易功能。'));
