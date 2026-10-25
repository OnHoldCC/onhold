import React from 'react';
import {OnHoldTagsField as SharedTagsField} from '@onhold/ui/ui';
import {MAX_TAGS,MAX_TAG_CHARACTERS} from '../../src/tags.mjs';
const suggestions=['Claude','GPT','Gemini','API','Fast','Stable','Low cost','Private','24/7'];
export function TagsField({value,onChange,t}){
 return <SharedTagsField value={value} onChange={onChange} suggestions={suggestions} maxTags={MAX_TAGS} maxCharacters={MAX_TAG_CHARACTERS}
  labels={{label:t('tags'),input:t('tagsInput'),options:t('chooseTags'),add:t('addTag'),remove:t('removeTag'),limit:t('tagLimit'),length:t('tagLength'),countUnit:t('tagCountUnit')}}/>;
}
