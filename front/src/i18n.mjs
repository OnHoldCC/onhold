import {messages,localeLoaders} from './locale-catalog.mjs';
import {chain} from './network.mjs';
export {messages};
export const supportedLocales=['en','zh','ja','ko','es','fr','de','pt'];
export function initialLocale(saved,languages=[]){
  if(supportedLocales.includes(saved))return saved;
  for(const language of languages){
    const base=typeof language==='string'?language.toLowerCase().split(/[-_]/)[0]:'';
    if(supportedLocales.includes(base))return base;
  }
  return 'en';
}

export async function loadLocale(lang){
  if(messages[lang]||!localeLoaders[lang])return;
  messages[lang]=(await localeLoaders[lang]()).default;
}
export function translate(lang,key) { return ((messages[lang] || messages.en)[key] ?? messages.en[key] ?? key).replaceAll('{network}',chain.label); }
const errors = {
  '请输入正数，最多保留 18 位小数。':'Enter a positive number with up to 18 decimal places.',
  '出价必须大于 0。':'Your bid must be greater than zero.',
  '项目名称须为 1–32 个字符。':'The site name must be 1–32 characters.',
  '最多 10 个标签，每个标签最多 10 个字。':'Up to 10 tags, with up to 10 characters each.',
  '最低出价为 0.001 BNB。':'The minimum bid is 0.001 BNB.',
  '项目介绍须为 1–80 个字符。':'The description must be 1–80 characters.',
  '特点标签须为 1–10 个字。':'The feature tag must be 1–10 characters.',
  '后端技术须为 1–24 个字符。':'Backend technology must be 1–24 characters.',
  '头像须为不含用户名或密码的 HTTPS 图片地址。':'Use an HTTPS avatar URL without embedded credentials.',
  '请填写不含用户名或密码的完整 HTTPS 主页地址。':'Enter a complete HTTPS URL without embedded credentials.',
  '请选择项目分类。':'Choose a site category.',
  '当前广告合约尚未升级为 10 个标签，请等待合约更新后再提交。':'The advertising contract needs the 10-tag upgrade before this listing can be submitted.',
  '广告位不存在，请刷新重试。':'This slot does not exist. Refresh and try again.',
  '出价必须至少高于当前广告位价格 10%。':'Your bid must be at least the current price plus 10%.',
  '出价必须高于当前广告位价格。':'Your bid must be higher than the current price.',
};
export function translateError(error,lang) { return lang==='en' ? errors[error.message] || translate(lang,'genericError') : error.message; }
export const categoryLabels={en:{'开发工具':'Developer tools','社区':'Community','创作者':'Creators'},zh:{'开发工具':'开发工具','社区':'社区','创作者':'创作者'}};
