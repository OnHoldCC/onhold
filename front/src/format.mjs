export function formatBanTime(value){
 const date=new Date(value);return Number.isNaN(date.getTime())?'—':date.toISOString().slice(0,19).replace('T',' ');
}

export function compactCount(value,lang='en'){
 return Number.isSafeInteger(value)&&value>=0?new Intl.NumberFormat(lang==='zh'?'zh-CN':lang,{notation:'compact',maximumFractionDigits:1}).format(value):'—';
}

export function compactAmount(value,lang='en'){
 const n=Number(value);
 if(value==null||typeof value==='string'&&!value.trim()||!Number.isFinite(n)||n<0)return '—';
 if(n>=1000)return new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:2}).format(n);
 if(n>0&&n<0.0001)return '<0.0001';
 return new Intl.NumberFormat(lang==='zh'?'zh-CN':lang,{minimumFractionDigits:2,maximumFractionDigits:4}).format(n);
}
