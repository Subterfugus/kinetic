// Bridges to the Android shell (android/). In a normal browser every export is inert.
import {focusOpen,closeFocus} from './focus.js';
const cap=globalThis.Capacitor;
export const isNative=!!cap?.isNativePlatform?.();
const call=(method,options={})=>cap.nativePromise('KineticNative',method,options);

// Opens Android's "Save as" picker. Resolves true when the file was written, false when the person cancelled.
export async function saveFile(name,data,type){const r=await call('saveFile',{name,data,type});return !!r?.saved}

// Opens a web address in the phone's browser. Links inside the app's WebView can fail silently, so the shell hands them to Android.
export async function openExternal(url){await call('openUrl',{url})}

if(isNative){
  // Every link that leaves the app (download buttons, source links) opens in the phone's browser.
  document.addEventListener('click',e=>{const a=e.target.closest?.('a[href^="https://"],a[href^="http://"]');if(!a||e.defaultPrevented)return;e.preventDefault();openExternal(a.href).catch(()=>{location.href=a.href})});
  // Android WebView has no Screen Wake Lock API, so focus mode keeps the screen on through the shell instead.
  if(!navigator.wakeLock){let held=0;Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{async request(){held++;await call('keepAwake',{on:true});const t=new EventTarget();t.released=false;t.release=async()=>{if(t.released)return;t.released=true;if(--held===0)await call('keepAwake',{on:false});t.dispatchEvent(new Event('release'))};document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')t.release()},{once:true});return t}}})}
  // The status and navigation bars take the journal's light or dark background.
  let dark=null;const syncBars=()=>{const now=document.documentElement.dataset.theme==='dark';if(now!==dark){dark=now;call('setTheme',{dark}).catch(()=>{})}};
  new MutationObserver(syncBars).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});syncBars();
  // The hardware back button closes an open dialog, focus mode or the menu first; the shell navigates back or exits when this returns false.
  globalThis.kineticBack=()=>{const d=document.querySelector('dialog[open]');if(d){d.close();return true}if(focusOpen()){closeFocus();return true}if(document.querySelector('.sidebar.open')){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return true}return false};
}
