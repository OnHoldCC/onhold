import existingAvatar from './assets/avatars/bafybeiatfqe436qpesbk6etwwkrxmg4wssyoai5mcuwt6ys56f3kfxriyi.webp';

// Immutable CID: the thumbnail changes display bytes, never the stored listing URL.
export function avatarThumbnail(url){
  return url==='https://gateway.pinata.cloud/ipfs/bafybeiatfqe436qpesbk6etwwkrxmg4wssyoai5mcuwt6ys56f3kfxriyi'?existingAvatar:url;
}
