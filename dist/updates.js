// Update checker: asks GitHub which Kinetic release is newest and says so. It never downloads or installs anything itself.
// Keep APP_VERSION equal to "version" in package.json (tests/updates.test.js checks this).
import {esc,btn,toast} from './ui.js';
import {isNative} from './native.js';
export const APP_VERSION='1.11.2';
export const RELEASES_PAGE='https://github.com/Subterfugus/kinetic/releases';
const LATEST='https://api.github.com/repos/Subterfugus/kinetic/releases/latest',DAY=86400000;

// "v1.10.0" > "1.9.2". Anything after a hyphen (1.8.0-beta) is ignored.
export function newerVersion(latest,current){const parts=v=>String(v||'').trim().replace(/^v/i,'').split('-')[0].split('.').map(n=>parseInt(n,10)||0);const a=parts(latest),b=parts(current);for(let i=0;i<Math.max(a.length,b.length);i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)>(b[i]||0)}return false}

// Turns GitHub's release record into what the notice needs. On Android the button downloads the APK; elsewhere it opens the release page.
export function readRelease(r,native=isNative){if(!r||typeof r.tag_name!=='string')return null;const page=typeof r.html_url==='string'&&r.html_url.startsWith('https://github.com/')?r.html_url:RELEASES_PAGE;const apk=(Array.isArray(r.assets)?r.assets:[]).find(a=>/\.apk$/i.test(a?.name||'')&&String(a.browser_download_url||'').startsWith('https://github.com/'));return {version:r.tag_name.replace(/^v/i,''),name:String(r.name||'').slice(0,120),notes:String(r.body||'').slice(0,4000),page,url:native&&apk?apk.browser_download_url:page}}

export function availableUpdate(C){const u=C.prefs.updateLatest;return u&&newerVersion(u.version,APP_VERSION)?u:null}

// Runs when the app opens and when the device comes back online: at most once a day, silent on any failure.
// manual=true is the "Check now" button: it always asks and reports the outcome.
export async function checkForUpdates(C,manual=false){
 if(!manual&&(!C.prefs.updateCheck||globalThis.navigator?.onLine===false||Date.now()-(C.prefs.updateCheckedAt||0)<DAY))return;
 if(checkForUpdates.busy)return;checkForUpdates.busy=true;
 try{
  const res=await fetch(LATEST,{headers:{Accept:'application/vnd.github+json'},cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
  // 404 means no release has been published yet.
  const release=res.status===404?null:res.ok?readRelease(await res.json()):undefined;
  if(release===undefined)throw Error('GitHub answered '+res.status);
  C.setPref('updateCheckedAt',Date.now());C.setPref('updateLatest',release);
  const update=availableUpdate(C);
  if(manual){if(update){C.setPref('updateDismissed',null);showUpdate(C);updateNotes(C)}else toast(release?'You have the latest version of Kinetic.':'No Kinetic releases have been published yet.')}
  else if(update)showUpdate(C);
 }catch{if(manual)toast('Couldn’t reach GitHub to check for updates. Check your connection and try again.')}
 finally{checkForUpdates.busy=false;const el=globalThis.document?.querySelector('#update-state');if(el)el.textContent=updateStatus(C);const btns=globalThis.document?.querySelector('#update-buttons');if(btns)btns.innerHTML=updateButtons(C)}
}

export function updateStatus(C){const u=availableUpdate(C),at=C.prefs.updateCheckedAt;return 'You have Kinetic '+APP_VERSION+'. '+(u?'Version '+u.version+' is available. ':'')+(at?'Last checked '+new Date(at).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})+'.':'Not checked yet.')}

// Settings → Updates buttons: Check now, plus What's new and Download while an update is waiting.
export function updateButtons(C){const u=availableUpdate(C);return btn('Check now','check-updates')+(u?btn('What’s new','update-notes')+downloadLink(u,'btn primary'):'')}
function downloadLink(u,cls){return `<a class="${cls}" href="${esc(u.url)}" target="_blank" rel="noopener" data-external>${isNative?'Download '+esc(u.version):'Get '+esc(u.version)}</a>`}

// The notice shown above every page until it is dismissed for that version.
export function updateBanner(C){const u=availableUpdate(C);if(!u||C.prefs.updateDismissed===u.version)return '';return `<div class="live-banner update-banner" role="status"><span><strong>Kinetic ${esc(u.version)} is available</strong> · you have ${APP_VERSION}.</span><span class="button-group">${btn('What’s new','update-notes','small')}${downloadLink(u,'btn small primary')}${btn('Not now','update-dismiss','small')}</span></div>`}
function showUpdate(C){const main=globalThis.document?.querySelector('#main');if(!main||main.querySelector('.update-banner'))return;main.insertAdjacentHTML('afterbegin',updateBanner(C))}

export function updateNotes(C){const u=availableUpdate(C);if(!u)return;const d=document.querySelector('#modal');d.setAttribute('aria-labelledby','modal-title');d.innerHTML=`<div class="modal-header"><h2 id="modal-title">What’s new in ${esc(u.version)}</h2></div><div class="modal-body">${u.name&&u.name!==u.version&&u.name!=='v'+u.version?`<h3>${esc(u.name)}</h3>`:''}<p class="release-notes">${esc(u.notes.trim()||'No notes were published with this release.')}</p><p class="meta">${isNative?'The download is an APK file. Open it once it finishes and Android will install it over this version. Your journal stays on this device.':'Opens the release page on GitHub. Your journal stays in this browser.'}</p><div class="modal-footer"><button type="button" class="btn" data-update="close">Close</button>${downloadLink(u,'btn primary')}</div></div>`;d.querySelector('[data-update=close]').onclick=()=>d.close();if(!d.open)d.showModal()}

export function updateAction(a,C){if(a==='check-updates'){checkForUpdates(C,true);return true}if(a==='update-notes'){updateNotes(C);return true}if(a==='update-dismiss'){C.setPref('updateDismissed',availableUpdate(C)?.version||null);document.querySelector('.update-banner')?.remove();return true}return false}
