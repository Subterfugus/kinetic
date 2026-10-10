// Suggested-workout card (Training and Today) and starting a suggested session.
import {exerciseById,groupById} from './data.js';
import {FOCI,SUGGEST_SOURCES,suggestWorkout} from './suggest.js';
import {itemFromSlot} from './program-view.js';
import {figure,muscleLoad,groupChips} from './figure.js';
import {esc,btn} from './ui.js';
import {TODAY,uid} from './store.js';
import {openFocus} from './focus.js';
import {holdBack,offerSteps} from './steps.js';

const range=r=>r[0]===r[1]?String(r[0]):r[0]+'–'+r[1];
const current=C=>suggestWorkout(C.state,{focus:C.ui.suggestFocus||'auto',today:TODAY(),shuffle:C.ui.suggestShuffle||0});
const names=ids=>ids.map(id=>(groupById(id)?.name||id).toLowerCase()).join(', ');

export function suggestionCard(C,{compact=false}={}){
 const s=C.state;if(s.draft)return '';
 const w=current(C),load=muscleLoad(w.items),second=!s.program&&s.profile.goal!=='mobility';// with no program, the recommended program is the main choice
 const chips=`<div class="studio-filter suggest-focus" role="group" aria-label="Workout focus">${FOCI.map(([id,label])=>`<button type="button" class="btn small studio-chip" data-action="suggest-focus:${id}" aria-pressed="${(C.ui.suggestFocus||'auto')===id}">${label}</button>`).join('')}</div>`;
 const list=w.items.length?w.items.map(i=>`<div class="row"><div><strong>${esc(exerciseById(i.exerciseId).name)}</strong>${compact?'':`<p class="meta">${esc(i.why)}</p>`}</div><span class="mono target">${i.sets} × ${range(i.reps)}</span></div>`).join(''):`<p class="meta">Nothing in this focus fits your equipment. Add equipment in Settings or pick another focus.</p>`;
 const notes=[w.skipped.length?`Skipped because you trained them in the last ${s.profile.recoveryHours||48} hours: ${esc(names(w.skipped))}.`:'',w.tired.length?`You trained ${esc(names(w.tired))} recently. Go a little easier on those today.`:''].filter(Boolean).map(x=>`<p class="meta">${x}</p>`).join('');
 return `<section class="card suggest-card"><div class="card-head"><div><div class="eyebrow">Suggested workout${second?' · one session for today':''}</div><h2>${esc(w.name)}</h2></div>${w.items.length?btn('Start','suggest-start',second?'':'primary','plus'):''}</div>${compact?'':chips}<div class="suggest-body">${figure(load,{size:compact?'small':'medium'})}<div class="suggest-list">${list}${notes}</div></div>${groupChips(load)}<div class="button-group">${compact?btn('Change focus','go-training','small'):btn('Different exercises','suggest-shuffle','small')}</div>${compact?'':`<details class="fine"><summary>About this</summary><p>Built from the last 7 days of your log. Each muscle has a weekly range of hard sets for your experience level (${w.target[0]}–${w.target[1]}); the session goes to the muscles furthest below it, skipping ones you trained inside your recovery window. Exercises come from your equipment list, big lifts first. Sets stop 1–3 reps short of failure, with 2–3 minutes' rest after big lifts and about 90 seconds after small ones. Load targets come from your last sessions of each exercise. The recovery window is an app setting, not a measured recovery time. ${C.sourceLinks(SUGGEST_SOURCES)}</p></details>`}</section>`;
}

export async function startSuggested(C){
 if(C.state.draft){location.hash='training';return}
 const w=current(C);if(!w.items.length)return;
 C.state.draft={id:uid(),name:w.name.replace(' · suggested',''),date:TODAY(),startedAt:Date.now(),exercises:w.items.map(s=>{const item=itemFromSlot(C,s,false);if(!item.why)item.why=s.why.slice(0,300);return holdBack(C,item)}),notes:'',restSeconds:150};
 await C.save('Workout started');location.hash='training';if(C.prefs.focusAuto)openFocus(C);offerSteps(C);
}

export async function suggestAction(a,id,C){
 if(a==='suggest-focus'){C.ui.suggestFocus=id;C.ui.suggestShuffle=0;C.render();return true}
 if(a==='suggest-shuffle'){C.ui.suggestShuffle=(C.ui.suggestShuffle||0)+1;C.render();return true}
 if(a==='suggest-start'){await startSuggested(C);return true}
 return false;
}
