export function formatBanTime(value){
 const date=new Date(value);return Number.isNaN(date.getTime())?'—':date.toISOString().slice(0,19).replace('T',' ');
}

export function compactCount(value,lang='en'){
 return Number.isSafeInteger(value)&&value>=0?new Intl.NumberFormat(lang==='zh'?'zh-CN':lang,{notation:'compact',maximumFractionDigits:1}).format(value):'—';
}
