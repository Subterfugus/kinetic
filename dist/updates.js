// Update checker: asks GitHub which Kinetic release is newest and says so. It never downloads or installs anything itself.
// Keep APP_VERSION equal to "version" in package.json (tests/updates.test.js checks this).
import {esc,btn,toast,icon} from './ui.js';
import {isNative} from './native.js';
export const APP_VERSION='1.12.0';
export const RELEASES_PAGE='https://github.com/Subterfugus/kinetic/releases';
const LATEST='https://api.github.com/repos/Subterfugus/kinetic/releases/latest',VERSION_FILE='https://raw.githubusercontent.com/Subterfugus/kinetic/main/package.json',DAY=86400000;

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
  // 404 means no release has been published yet. 403 and 429 mean GitHub's hourly limit for unsigned requests is used up
  // (it counts per internet address, so a shared network can hit it): then the version number in the repository answers instead.
  let release=res.status===404?null:res.ok?readRelease(await res.json()):undefined;
  if(release===undefined&&(res.status===403||res.status===429)){release=await versionFile();if(release===undefined){const busy=Error('GitHub rate limit');busy.busy=true;throw busy}}
  if(release===undefined)throw Error('GitHub answered '+res.status);
  C.setPref('updateCheckedAt',Date.now());C.setPref('updateLatest',release);
  const update=availableUpdate(C);
  if(manual){if(update){C.setPref('updateDismissed',null);showUpdate(C);updateNotes(C)}else toast(release?'You have the latest version of Kinetic.':'No Kinetic releases have been published yet.')}
  else if(update)showUpdate(C);
 }catch(error){if(manual)toast(failureMessage(error))}
 finally{checkForUpdates.busy=false;const el=globalThis.document?.querySelector('#update-state');if(el)el.textContent=updateStatus(C);const btns=globalThis.document?.querySelector('#update-buttons');if(btns)btns.innerHTML=updateButtons(C)}
}
export const failureMessage=error=>error?.busy?'GitHub is busy and asked Kinetic to wait. Your connection is fine. Try again in an hour.':'Couldn’t reach GitHub to check for updates. Check your connection and try again.';

// Fallback when the releases API is rate-limited: the version in package.json on main. It has no notes, so the
// button opens the newest release (Android gets the fixed-name APK the release workflow uploads).
async function versionFile(native=isNative){
 try{const res=await fetch(VERSION_FILE,{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});if(!res.ok)return undefined;const v=String((await res.json())?.version||'');if(!/^\d+(\.\d+)*$/.test(v))return undefined;return {version:v,name:'',notes:'Open the release on GitHub to read what changed.',page:RELEASES_PAGE+'/latest',url:native?RELEASES_PAGE+'/latest/download/Kinetic.apk':RELEASES_PAGE+'/latest'}}
 catch{return undefined}
}

export function updateStatus(C){const u=availableUpdate(C),at=C.prefs.updateCheckedAt;return 'You have Kinetic '+APP_VERSION+'. '+(u?'Version '+u.version+' is available. ':'')+(at?'Last checked '+new Date(at).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})+'.':'Not checked yet.')}

// Settings → Updates buttons: Check now, plus What's new and Download while an update is waiting.
export function updateButtons(C){const u=availableUpdate(C);return btn('Check now','check-updates')+(u?btn('What’s new','update-notes')+downloadLink(u,'btn primary'):'')}
function downloadLink(u,cls,short=false){return `<a class="${cls}" href="${esc(u.url)}" target="_blank" rel="noopener" data-external>${(isNative?'Download':'Get')+(short?'':' '+esc(u.version))}</a>`}

// A one-line notice at the top of Today until it is dismissed for that version. Settings → Updates always has the same buttons.
export function updateBanner(C){const u=availableUpdate(C);if(!u||C.prefs.updateDismissed===u.version)return '';return `<div class="update-banner" role="status"><button type="button" class="update-text" data-action="update-notes"><strong>Kinetic ${esc(u.version)} is out</strong> <span>What’s new</span></button>${downloadLink(u,'btn small primary',true)}<button type="button" class="btn ghost small" data-action="update-dismiss" aria-label="Not now" title="Not now">${icon('close')}</button></div>`}
function showUpdate(C){const main=globalThis.document?.querySelector('#main'),page=globalThis.location?.hash.slice(1)||'overview';if(!main||page!=='overview'||main.querySelector('.update-banner'))return;main.insertAdjacentHTML('afterbegin',updateBanner(C))}

export function updateNotes(C){const u=availableUpdate(C);if(!u)return;const d=document.querySelector('#modal');d.setAttribute('aria-labelledby','modal-title');d.innerHTML=`<div class="modal-header"><h2 id="modal-title">What’s new in ${esc(u.version)}</h2></div><div class="modal-body">${u.name&&u.name!==u.version&&u.name!=='v'+u.version?`<h3>${esc(u.name)}</h3>`:''}<p class="release-notes">${esc(u.notes.trim()||'No notes were published with this release.')}</p><p class="meta">${isNative?'The download is an APK file. Open it once it finishes and Android will install it over this version. Your journal stays on this device.':'Opens the release page on GitHub. Your journal stays in this browser.'}</p><div class="modal-footer"><button type="button" class="btn" data-update="close">Close</button>${downloadLink(u,'btn primary')}</div></div>`;d.querySelector('[data-update=close]').onclick=()=>d.close();if(!d.open)d.showModal()}

export function updateAction(a,C){if(a==='check-updates'){checkForUpdates(C,true);return true}if(a==='update-notes'){updateNotes(C);return true}if(a==='update-dismiss'){C.setPref('updateDismissed',availableUpdate(C)?.version||null);document.querySelector('.update-banner')?.remove();return true}return false}
