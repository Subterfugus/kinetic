import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {APP_VERSION,newerVersion,readRelease,availableUpdate,checkForUpdates} from '../dist/updates.js';
import {tourSteps} from '../dist/tour.js';

test('The version the app reports matches package.json',()=>{
 assert.equal(APP_VERSION,JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8')).version);
});

test('Version comparison handles tags, multi-digit parts and missing parts',()=>{
 assert.ok(newerVersion('v1.8.0','1.7.0'));
 assert.ok(newerVersion('1.10.0','1.9.9'));
 assert.ok(newerVersion('2','1.99.99'));
 assert.ok(!newerVersion('v1.7.0','1.7.0'));
 assert.ok(!newerVersion('1.7','1.7.0'));
 assert.ok(!newerVersion('1.6.9','1.7.0'));
 assert.ok(!newerVersion('','1.7.0'));
});

test('A GitHub release becomes a download link: the APK on Android, the release page elsewhere',()=>{
 const r={tag_name:'v1.8.0',name:'Kinetic 1.8',body:'Better charts',html_url:'https://github.com/Subterfugus/kinetic/releases/tag/v1.8.0',assets:[{name:'notes.txt',browser_download_url:'https://github.com/x/notes.txt'},{name:'Kinetic-1.8.0.apk',browser_download_url:'https://github.com/Subterfugus/kinetic/releases/download/v1.8.0/Kinetic-1.8.0.apk'}]};
 const web=readRelease(r,false),phone=readRelease(r,true);
 assert.equal(web.version,'1.8.0');
 assert.equal(web.url,r.html_url);
 assert.match(phone.url,/Kinetic-1\.8\.0\.apk$/);
 assert.equal(readRelease({...r,html_url:'javascript:alert(1)',assets:[]},true).url,'https://github.com/Subterfugus/kinetic/releases','unexpected links fall back to the releases page');
 assert.equal(readRelease({message:'Not Found'}),null);
});

function fakeApp(prefs={}){const C={prefs:{updateCheck:true,updateCheckedAt:null,updateLatest:null,updateDismissed:null,...prefs},setPref:(k,v)=>{C.prefs[k]=v}};return C}
async function withFetch(impl,fn){const saved=globalThis.fetch,calls=[];globalThis.fetch=async(...a)=>{calls.push(a);return impl(...a)};try{await fn()}finally{globalThis.fetch=saved}return calls}

test('The automatic check asks at most once a day, respects the switch, and never throws',async()=>{
 const release={ok:true,status:200,json:async()=>({tag_name:'v9.0.0',html_url:'https://github.com/Subterfugus/kinetic/releases/tag/v9.0.0',assets:[]})};
 let C=fakeApp();
 let calls=await withFetch(()=>release,()=>checkForUpdates(C));
 assert.equal(calls.length,1);
 assert.match(calls[0][0],/^https:\/\/api\.github\.com\/repos\/Subterfugus\/kinetic\/releases\/latest$/);
 assert.equal(availableUpdate(C).version,'9.0.0');
 calls=await withFetch(()=>release,()=>checkForUpdates(C));
 assert.equal(calls.length,0,'second check the same day is skipped');
 C=fakeApp({updateCheck:false});
 calls=await withFetch(()=>release,()=>checkForUpdates(C));
 assert.equal(calls.length,0,'switched off');
 C=fakeApp();
 await withFetch(()=>{throw Error('offline')},()=>checkForUpdates(C));
 assert.equal(C.prefs.updateCheckedAt,null,'a failed check is retried next time');
 C=fakeApp({updateLatest:{version:'9.0.0'}});
 await withFetch(()=>({ok:false,status:404}),()=>checkForUpdates(C));
 assert.equal(availableUpdate(C),null,'no published release means no notice');
 assert.equal(availableUpdate(fakeApp({updateLatest:{version:APP_VERSION}})),null,'the installed version is not an update');
});

test('The welcome tour mentions the update check',()=>{
 assert.ok(JSON.stringify(tourSteps).includes('checks for a newer version'));
});

test('Settings shows a download button while an update is waiting',async()=>{
 const {updateButtons}=await import('../dist/updates.js');
 assert.doesNotMatch(updateButtons(fakeApp()),/href=/);
 const html=updateButtons(fakeApp({updateLatest:{version:'99.0.0',url:'https://github.com/Subterfugus/kinetic/releases/download/v99.0.0/Kinetic-99.0.0.apk'}}));
 assert.match(html,/check-updates/);
 assert.match(html,/href="https:\/\/github\.com\/Subterfugus\/kinetic\/releases\/download\/v99\.0\.0\/Kinetic-99\.0\.0\.apk"/);
});
