export async function uploadAvatar(file) {
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('create.media.invalidImage');
  if(!file.size||file.size>5*1024*1024)throw Error('create.media.tooLarge');
  const form=new FormData();form.append('file',await resizeAvatar(file));
  const response=await fetch('/api/uploads/avatar',{method:'POST',body:form,credentials:'omit',signal:AbortSignal.timeout(45000)});
  if(response.status===503)throw Error('create.media.unavailable');
  if(!response.ok)throw Error('create.media.failed');
  const result=await response.json();if(!/^https:\/\/gateway\.pinata\.cloud\/ipfs\/(?:Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,120})$/.test(result.url||''))throw Error('create.media.failed');return result.url;
}

export async function resizeAvatar(file){
  let image;
  try{image=await createImageBitmap(file);}catch{throw Error('create.media.invalidImage');}
  try{
    const scale=Math.min(1,256/Math.max(image.width,image.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.85));
    return blob&&blob.size<file.size?new File([blob],'avatar.webp',{type:blob.type}):file;
  }finally{image.close();}
}
