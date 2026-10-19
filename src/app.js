import './shell.js';
import { steps, instructionsFor, nextStep } from './steps.mjs';

const $ = id => document.getElementById(id);
let current = 0;
let os = navigator.platform.includes('Mac') ? 'mac' : 'windows';
const shortTitles = ['打开 Claude', '找到会话凭证', '复制凭证的值', '回站验证领取'];
const nav = $('step-nav');

function render(moveFocus = false) {
  const step = steps[current];
  nav.replaceChildren(...shortTitles.map((title, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = index === current ? 'step-button active' : 'step-button';
    button.setAttribute('aria-current', index === current ? 'step' : 'false');
    button.innerHTML = `<span class="step-number">${index + 1}</span><span><strong>${title}</strong><small>${['登录需要验证的账号', '打开开发者工具', '只复制 sessionKey', '确认钱包与领取状态'][index]}</small></span>`;
    button.addEventListener('click', () => { current = index; render(true); });
    return button;
  }));
  $('step-count').textContent = `STEP 0${current + 1} / 04`;
  $('step-title').textContent = step.title;
  $('step-intro').textContent = step.intro;
  $('step-image').src = `assets/${step.image}.svg`;
  $('step-image').alt = step.alt;
  $('instructions').replaceChildren(...instructionsFor(step, os).map(instruction => {
    const li = document.createElement('li');
    li.textContent = instruction;
    return li;
  }));
  $('step-tip').textContent = step.tip;
  $('open-claude').hidden = current !== 0;
  $('demo-form').hidden = current !== 3;
  $('previous').disabled = current === 0;
  $('next').innerHTML = current === 3 ? '重新查看 <span aria-hidden="true">↺</span>' : '下一步 <span aria-hidden="true">→</span>';
  $('page-dots').textContent = steps.map((_, index) => index === current ? '●' : '○').join(' ');
  document.querySelectorAll('[data-os]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.os === os)));
  if (moveFocus) $('step-title').focus({ preventScroll: true });
}

$('previous').addEventListener('click', () => { current = nextStep(current, -1); render(true); });
$('next').addEventListener('click', () => { current = current === 3 ? 0 : nextStep(current, 1); render(true); });
document.querySelectorAll('[data-os]').forEach(button => button.addEventListener('click', () => { os = button.dataset.os; render(); }));
$('zoom').addEventListener('click', () => {
  $('large-image').src = $('step-image').src;
  $('large-image').alt = steps[current].alt;
  $('dialog-title').textContent = steps[current].title;
  $('image-dialog').showModal();
});
$('close-dialog').addEventListener('click', () => $('image-dialog').close());
$('image-dialog').addEventListener('click', event => { if (event.target === $('image-dialog')) $('image-dialog').close(); });
render();
