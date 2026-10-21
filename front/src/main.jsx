import {createRoot} from 'react-dom/client';
import {App} from '../components/onhold/App.jsx';

import {initialLocale,loadLocale} from './i18n.mjs';
let savedLocale;try{savedLocale=localStorage.getItem('onhold.locale');}catch{}
await loadLocale(initialLocale(savedLocale,navigator.languages?.length?navigator.languages:[navigator.language])).catch(()=>{});

createRoot(document.getElementById('root')).render(<App/>);
