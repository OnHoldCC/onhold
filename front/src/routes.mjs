export function pageFromPath(path){
  const name=path.slice(1);
  return ['claim','analytics','burn','docs'].includes(name)?name:'home';
}
export const pagePath=page=>page==='home'?'/':`/${page}`;
