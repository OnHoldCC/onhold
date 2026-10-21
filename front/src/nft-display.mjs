// Only the website display copy changes; on-chain SVG and uploaded PNGs stay intact.
export function banPassDisplayImage(image){
  if(typeof image!=='string'||!image.startsWith('data:image/svg+xml;base64,')||image.length>131072)return image;
  try{
    const svg=atob(image.slice(26));
    const display=svg.replace(/<g transform="rotate\(-5 420 213\)">[\s\S]*?<\/g>/,stamp=>stamp.includes('>BANNED</text>')?stamp.replace(/(stroke|fill)="#(?:c36948|625785|77726a)"/g,'$1="#b64336"'):stamp);
    return display===svg?image:`data:image/svg+xml;base64,${btoa(display)}`;
  }catch{return image;}
}
