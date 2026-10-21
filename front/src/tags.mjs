export const MAX_TAGS=10;
export const MAX_TAG_CHARACTERS=10;
export function validTags(tags){
  return Array.isArray(tags)&&tags.length<=MAX_TAGS&&new Set(tags).size===tags.length&&tags.every(tag=>typeof tag==='string'&&tag.trim()===tag&&tag.length>0&&Array.from(tag).length<=MAX_TAG_CHARACTERS);
}
