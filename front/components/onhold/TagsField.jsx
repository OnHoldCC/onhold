import React,{useEffect,useId,useRef,useState} from 'react';
import {Button,Input} from '@singlespark/component-atlas/ui';
import {MAX_TAGS,MAX_TAG_CHARACTERS} from '../../src/tags.mjs';

const suggestions=['Claude','GPT','Gemini','API','Fast','Stable','Low cost','Private','24/7'];
export function TagsField({value,onChange,t}){
  const [draft,setDraft]=useState(''),[open,setOpen]=useState(false),[active,setActive]=useState(-1),[error,setError]=useState('');
  const input=useRef(null),id=useId(),query=draft.trim();
  const options=suggestions.filter(tag=>!value.includes(tag)&&tag.toLowerCase().includes(query.toLowerCase())).map(tag=>({value:tag,label:tag}));
  if(query&&!value.includes(query)&&!suggestions.includes(query))options.unshift({value:query,label:`${t('addTag')} “${query}”`});
  const disabled=option=>value.length>=MAX_TAGS||Array.from(option.value).length>MAX_TAG_CHARACTERS;
  useEffect(()=>{if(open&&active>=0)document.getElementById(`${id}-${active}`)?.scrollIntoView({block:'nearest'});},[open,active,id]);
  function add(tag){
    const next=tag.trim();if(!next)return;
    if(Array.from(next).length>MAX_TAG_CHARACTERS){setError(t('tagLength'));return;}
    if(value.includes(next)){setDraft('');return;}
    if(value.length>=MAX_TAGS){setError(t('tagLimit'));return;}
    onChange([...value,next]);setDraft('');setActive(-1);setError('');setOpen(true);input.current?.focus();
  }
  function remove(index){onChange(value.filter((_,i)=>i!==index));setError('');setActive(-1);}
  function keyDown(event){
    if(event.nativeEvent.isComposing||event.keyCode===229)return;
    if(event.key==='Enter'){event.preventDefault();const selected=options[active];add(open&&selected&&!disabled(selected)?selected.value:draft);}
    else if(event.key==='Escape'){if(open){event.preventDefault();event.stopPropagation();setOpen(false);}}
    else if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();setOpen(true);const enabled=options.map((option,index)=>disabled(option)?-1:index).filter(index=>index>=0);if(!enabled.length)return;
      const direction=event.key==='ArrowDown'?1:-1,index=enabled.indexOf(active);setActive(enabled[index<0?(direction>0?0:enabled.length-1):(index+direction+enabled.length)%enabled.length]);
    }else if(event.key==='Backspace'&&!draft&&value.length)remove(value.length-1);
  }
  return <fieldset className="tags-field"><legend>{t('tags')} <small>{value.length}/{MAX_TAGS} {t('tagCountUnit')}</small></legend>
    <div className="tag-input" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
      <div className="tag-entry" onClick={event=>{if(event.target===event.currentTarget)input.current?.focus();}}>
        {value.map((tag,index)=><Button className="tag-chip" key={tag} size="sm" variant="ghost" onClick={()=>remove(index)} aria-label={`${t('removeTag')} ${tag}`}>{tag}<span aria-hidden="true">×</span></Button>)}
        <Input bare ref={input} role="combobox" aria-label={t('tagsInput')} aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`} aria-activedescendant={open&&active>=0?`${id}-${active}`:undefined} aria-describedby={`${id}-hint`} aria-invalid={Boolean(error)} autoComplete="off" placeholder={t('tagsInput')} value={draft} onFocus={()=>setOpen(true)} onChange={event=>{setDraft(event.target.value);setActive(-1);setError('');setOpen(true);}} onKeyDown={keyDown}/>
        {draft&&<small className="tag-draft-count">{Array.from(draft).length}/{MAX_TAG_CHARACTERS}</small>}
      </div>
      {open&&options.length>0&&<div className="tag-options" id={`${id}-options`} role="listbox" aria-label={t('chooseTags')}>
        {options.map((option,index)=><Button key={option.value} id={`${id}-${index}`} role="option" aria-selected={active===index} disabled={disabled(option)} className={active===index?'tag-option is-active':'tag-option'} variant="ghost" onMouseDown={event=>event.preventDefault()} onClick={()=>add(option.value)} title={disabled(option)?t('tagLimit'):undefined}>{option.label}</Button>)}
      </div>}
    </div>
    <p className={`tag-hint ${error?'tag-hint--error':''}`} id={`${id}-hint`} role={error?'alert':undefined}>{error||t('tagLimit')}</p>
  </fieldset>;
}
