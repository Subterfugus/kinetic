// Program screens: recommendation, the active program, starting a program workout, swapping and equipment changes.
import {exerciseById,groups,equipmentLabels,exercises} from './data.js';
import {programs,programById,recommend,buildProgram,nextTarget,substitutes,lostMuscles,compensate,adaptItems,stalledLifts,programWeek,deloading,namesOf,regionalGaps,loadable,isCompound,available,MAJOR} from './programs.js';
import {itemFor,newSet,picker} from './training.js';
import {esc,btn,modal,num,toast} from './ui.js';
import {TODAY,uid} from './store.js';
import {openFocus} from './focus.js';

const SOURCES=['pelland2026','schoenfeld2021','refalo2023','plotkin2022','singer2024','coleman2024','ramoscampo2024','haugen2023'];
const MAIN_GROUPS=MAJOR;
const range=r=>r[0]===r[1]?String(r[0]):r[0]+'–'+r[1];
const list=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a.at(-1);
const lower=s=>s.toLowerCase();
const loadText=(C,kg)=>kg>0?num(C.displayLoad(kg),1)+' '+C.loadUnit():'';
const equipmentNow=C=>C.ui.equipmentToday||C.state.profile.equipment;
const built=(C,id=C.state.program?.templateId)=>buildProgram(id,C.state.profile);
const name=id=>exerciseById(id)?.name||id;

// The one equipment item that would unlock the most uncovered muscles.
function unlocks(uncovered,equipment){
 const score=Object.keys(equipmentLabels).filter(x=>!equipment.includes(x)).map(x=>({x,n:new Set(exercises.filter(e=>e.category==='strength'&&available(e,[...equipment,x])&&!available(e,equipment)).flatMap(e=>e.primary.filter(g=>uncovered.includes(g)))).size})).filter(s=>s.n).sort((a,b)=>b.n-a.n);
 return score.slice(0,2).map(s=>lower(equipmentLabels[s.x]));
}
function adjustments(C,b){
 const changes=b.days.flatMap(d=>d.changes),swaps=[...new Map(changes.filter(c=>c.to).map(c=>[c.from+c.to,c])).values()],dropped=[...new Set(changes.filter(c=>!c.to).map(c=>c.from))],added=b.days.flatMap(d=>d.added.map(a=>({...a,day:d.name}))),uncovered=[...new Set(b.days.flatMap(d=>d.uncovered))].filter(g=>MAJOR.includes(g)&&!(b.volume[g]>=4));
 if(!changes.length)return '';
 const fix=uncovered.length?unlocks(uncovered,C.state.profile.equipment):[];
 return `<details class="notice adjust"${uncovered.length?" open":""}><summary><strong>Adjusted for your equipment</strong> · ${swaps.length} swap${swaps.length===1?"":"s"}${added.length?", "+added.length+" addition"+(added.length===1?"":"s"):""}${uncovered.length?" · some muscles not covered":""}</summary><ul class="detail-list">${swaps.map(c=>`<li>${esc(name(c.from))} → <strong>${esc(name(c.to))}</strong>${c.tier==='Closest match'?'':' <span class="meta">· '+esc(lower(c.tier))+'</span>'}</li>`).join('')}${dropped.map(id=>`<li>${esc(name(id))}: nothing similar is possible with your equipment</li>`).join('')}${added.map(a=>`<li>${a.extended?a.sets+' more set'+(a.sets>1?'s':'')+' of':'Added'} <strong>${esc(name(a.exerciseId))}</strong> on ${esc(a.day)} to cover ${esc(lower(namesOf([a.covers])[0]))}</li>`).join('')}</ul>${uncovered.length?`<p class="warn-text">Not covered: ${esc(lower(list(namesOf(uncovered))))}.${fix.length?' A '+esc(fix.join(' or a '))+' would fix most of this.':''}</p>`:''}<small>Equipment comes from Settings. Change it there and the program updates itself.</small></details>`;
}
const itemRow=(C,i,target=null)=>`<div class="row"><div><strong>${esc(name(i.exerciseId))}</strong>${target?.note?`<p>${esc(target.note)}</p>`:''}${i.from?`<p class="meta">In place of ${esc(lower(name(i.from)))}</p>`:i.covers?`<p class="meta">Added to cover ${esc(lower(namesOf([i.covers])[0]))}</p>`:''}</div><span class="mono target">${target?target.sets:i.sets} × ${range(i.reps)}${target?.load?' · '+loadText(C,target.load):''}</span></div>`;
const dayBlock=(C,d)=>`<div class="program-day"><h3>${esc(d.name)}</h3>${d.items.map(i=>itemRow(C,i)).join('')}</div>`;
function volumeBars(b){
 const [lo,hi]=b.target,scale=24,rows=MAIN_GROUPS.map(id=>({id,n:b.volume[id]||0}));
 return rows.map(r=>`<div class="volume-row"><span>${esc(groups.find(g=>g.id===r.id).name)}</span><div class="progress band" style="--lo:${lo/scale*100}%;--hi:${hi/scale*100}%"><span style="width:${Math.min(100,r.n/scale*100)}%"></span></div><span class="mono">${num(r.n,1)}</span></div>`).join('')+`<p class="meta" style="margin:12px 0 0">Sets per week, counting half a set for muscles that assist. The shaded band is ${lo}–${hi}, a sensible range for your experience level.</p>`;
}
const about=C=>`<details class="fine"><summary>About this</summary><p>Targets use double progression: add reps inside the range, then add load once every set reaches the top. Sets are stopped 1–3 reps short of failure and rest is 2–3 minutes for big lifts. Recovery weeks are suggested only when lifts stall, because planned weeks off have not been shown to help. Different exercises for the same muscle build similar muscle when effort is matched, which is why swaps are safe; strength is more specific to the lift you practise. Load jumps are practical defaults, not tested values. ${C.sourceLinks(SOURCES)}</p></details>`;

export function programSection(C){
 const p=C.state.program,profile=C.state.profile;
 if(profile.goal==='mobility'&&!p)return '';
 if(!p){
  const rec=recommend(profile),b=built(C,rec.id),t=b.template;
  return `<section class="card program"><div class="card-head"><div><div class="eyebrow">Recommended program</div><h2>${esc(t.name)}</h2></div>${btn('Start this program','program-start:'+t.id,'primary')}</div><p>${esc(t.summary)} ${esc(rec.reason)}</p>${adjustments(C,b)}<div class="program-days">${b.days.map(d=>dayBlock(C,d)).join('')}</div><details class="fine"><summary>Other programs</summary><div>${programs.filter(x=>x.id!==t.id).map(x=>`<div class="row"><div><strong>${esc(x.name)}</strong><p>${esc(x.level)} · ${esc(x.summary)}</p></div><div class="row-actions">${btn('Preview','program-preview:'+x.id,'small')}${btn('Start','program-start:'+x.id,'small')}</div></div>`).join('')}</div></details>${about(C)}</section>`;
 }
 const b=built(C),t=b.template,d=b.days[p.next],deload=deloading(p),week=programWeek(p),inWeek=p.completed%t.perWeek,stuck=deload?[]:stalledLifts(b,C.state.sessions),gaps=regionalGaps(b.days.flatMap(x=>x.items));
 return `<section class="card program"><div class="card-head"><div><div class="eyebrow">Your program</div><h2>${esc(t.name)}</h2><p class="meta" style="margin:5px 0 0">Week ${week} · session ${inWeek+1} of ${t.perWeek}${deload?' · <span class="badge">Recovery week</span>':''}</p></div>${C.state.draft?btn('Continue workout','go-training','primary'):btn('Start '+d.name,'program-workout','primary','plus')}</div>${stuck.length>=2?`<div class="notice warning"><strong>Progress has stalled</strong><p>${esc(list(stuck.slice(0,3).map(name)))} ${stuck.length>1?'have':'has'} not improved in three sessions. A recovery week (half the sets, same loads) often helps.</p>${btn('Start a recovery week','program-deload','small')}</div>`:''}<h3 class="subsection">Next: ${esc(d.name)}</h3>${d.items.map(i=>itemRow(C,i,nextTarget(i,C.state.sessions,{units:profile.units,deload}))).join('')}<div class="button-group" style="margin-top:16px">${btn('Skip this session','program-skip','small')}${btn(deload?'End recovery week':'Recovery week','program-deload','small')}${btn('Change program','program-change','small')}${btn('End program','program-end','small danger')}</div>${adjustments(C,b)}${gaps.length?`<div class="notice"><strong>Worth knowing</strong><ul class="detail-list">${gaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div>`:''}<details class="fine"><summary>Weekly sets per muscle</summary><div>${volumeBars(b)}</div></details><details class="fine"><summary>All sessions</summary><div class="program-days">${b.days.map(x=>dayBlock(C,x)).join('')}</div></details>${about(C)}</section>`;
}
// Compact card for Today.
// Shown on Today and Training before any program is running, so a new user sees the recommendation without opening Plan.
export function programPrompt(C){
 const s=C.state;if(s.program||s.draft||s.profile.goal==='mobility')return '';
 const rec=recommend(s.profile),t=programById(rec.id),b=built(C,rec.id);
 return `<section class="card accent-card program-prompt"><div class="eyebrow">Recommended program</div><h2>${esc(t.name)}</h2><p>${esc(rec.reason)} ${b.days.length} different sessions, adjusted to your equipment.</p><div class="button-group">${btn('Start the recommended program','program-start:'+t.id)}${btn('Preview','program-preview:'+t.id,'quiet')}${btn('Empty workout','start-workout','quiet')}</div></section>`;
}
export function todayProgram(C){
 const p=C.state.program;if(!p||C.state.draft)return '';
 const b=built(C),d=b.days[p.next],deload=deloading(p);
 return `<section class="card"><div class="card-head"><div><div class="eyebrow">Week ${programWeek(p)}${deload?' · recovery week':''}</div><h2>${esc(d.name)}</h2></div>${btn('Start','program-workout','primary','plus')}</div>${d.items.slice(0,5).map(i=>{const t=nextTarget(i,C.state.sessions,{units:C.state.profile.units,deload});return `<div class="row"><span>${esc(name(i.exerciseId))}</span><span class="mono target">${t.sets} × ${range(i.reps)}${t.load?' · '+loadText(C,t.load):''}</span></div>`}).join('')}${d.items.length>5?`<p class="meta" style="margin:10px 0 0">and ${d.items.length-5} more</p>`:''}</section>`;
}
function itemFromSlot(C,s,deload=!!C.state.draft?.program?.deload){
 const t=nextTarget(s,C.state.sessions,{units:C.state.profile.units,deload}),item=itemFor(s.exerciseId,t.sets,t.reps);
 item.sets.forEach(x=>{x.load=t.load});
 return Object.assign(item,{range:t.range,targetLoad:t.load,targetRir:t.rir,rest:s.rest,why:s.covers?'Added to cover '+lower(namesOf([s.covers])[0])+'.':t.note});
}
export async function startProgramWorkout(C){
 if(C.state.draft){location.hash='training';toast('Your unfinished workout is ready');return}
 const p=C.state.program,d=built(C).days[p.next],deload=deloading(p);
 C.state.draft={id:uid(),name:d.name+(deload?' · recovery':''),date:TODAY(),startedAt:Date.now(),exercises:d.items.map(s=>itemFromSlot(C,s,deload)),notes:'',restSeconds:150,program:{templateId:p.templateId,day:p.next,week:programWeek(p),deload}};
 C.ui.equipmentToday=null;await C.save('Workout started');location.hash='training';if(C.prefs.focusAuto)openFocus(C);
}
const slotOf=item=>{const e=exerciseById(item.exerciseId),compound=isCompound(e);return {exerciseId:item.exerciseId,sets:item.sets.length,reps:item.range||[item.targetReps||10,item.targetReps||10],rir:item.targetRir??(compound?2:1),rest:item.rest||(compound?150:90),main:false}};
// Apply the result of compensate() to the unfinished workout.
function applyCompensation(C,pseudo){
 const notes=[];
 for(const x of pseudo){
  if(x.ref){const extra=x.sets-x.ref.sets.length;if(extra>0){const last=x.ref.sets.at(-1);for(let i=0;i<extra;i++)x.ref.sets.push({...newSet(last?.reps||0,last?.load??null)});notes.push(extra+' more set'+(extra>1?'s':'')+' of '+name(x.exerciseId))}}
  else{C.state.draft.exercises.push(itemFromSlot(C,x));notes.push(x.sets+' sets of '+name(x.exerciseId))}
 }
 return notes;
}
async function swap(C,item,toId){
 // Sets already done stay logged under the original exercise; only the remaining sets move to the replacement.
 if(item.sets.some(x=>x.done)){const rest=item.sets.filter(x=>!x.done);if(!rest.length)throw Error('Every set of this exercise is already done.');const copy={...item,id:uid(),sets:rest,notes:'',superset:item.superset||''};item.sets=item.sets.filter(x=>x.done);C.state.draft.exercises.splice(C.state.draft.exercises.indexOf(item)+1,0,copy);item=copy}
 const d=C.state.draft,fromId=item.exerciseId,sets=item.sets.length,lost=lostMuscles(fromId,toId,sets),s=slotOf(item),to=exerciseById(toId);
 if(to.tracking!=='reps-load'){const fresh=itemFor(toId,sets);Object.assign(item,{exerciseId:toId,sets:fresh.sets,targetReps:0,targetDuration:fresh.targetDuration,range:null,targetLoad:null,why:''})}
 else{const reps=item.range?(loadable(to)?s.reps:[s.reps[0],Math.max(s.reps[1],20)]):s.reps,fresh=itemFromSlot(C,{...s,exerciseId:toId,reps});Object.assign(item,{exerciseId:toId,sets:fresh.sets,targetReps:fresh.targetReps,targetDuration:null,why:fresh.why,targetLoad:fresh.targetLoad,range:item.range?fresh.range:null})}
 const pseudo=d.exercises.map(e=>({exerciseId:e.exerciseId,sets:e.sets.length,ref:e,main:false})),{uncovered}=compensate(lost,pseudo,equipmentNow(C)),notes=applyCompensation(C,pseudo);
 await C.save(notes.length?'Swapped. Added '+list(notes)+' so the same muscles are trained.':uncovered.length?'Swapped. '+list(namesOf(uncovered))+' will get less work today.':'Exercise swapped');
}
function swapDialog(C,itemId){
 const item=C.state.draft.exercises.find(e=>e.id===itemId),e=exerciseById(item.exerciseId),equipment=equipmentNow(C),options=substitutes(e,equipment,{exclude:C.state.draft.exercises.map(x=>x.exerciseId)}).slice(0,8);
 const d=modal('Swap '+e.name,`${options.length?options.map(o=>`<div class="row"><div><strong>${esc(o.exercise.name)}</strong><p>${esc(o.tier)} · ${o.exercise.equipment.map(x=>equipmentLabels[x]).join(', ')}</p>${o.lost.length?`<p class="meta">Less work for ${esc(lower(list(namesOf(o.lost))))}; sets are added elsewhere to make up for it.</p>`:''}${o.regional?`<p class="meta">Trains a different part of the muscle.</p>`:''}</div><button type="button" class="btn small primary" data-swap="${o.exercise.id}">Use</button></div>`).join(''):'<p class="note-box">Nothing similar is possible with your equipment.</p>'}<div class="button-group" style="margin-top:16px"><button type="button" class="btn small" data-browse>Browse all exercises</button></div>`,()=>{});
 d.querySelector('.modal-footer').remove();
 d.querySelectorAll('[data-swap]').forEach(b=>b.onclick=async()=>{try{await swap(C,item,b.dataset.swap);d.close()}catch(err){toast(err.message)}});
 d.querySelector('[data-browse]').onclick=()=>picker(C,async id=>{try{await swap(C,item,id)}catch(err){toast(err.message)}},exercises.filter(x=>x.category===e.category&&x.id!==e.id));
}
function equipmentDialog(C){
 const owned=C.state.profile.equipment.filter(x=>x!=='bodyweight'),now=equipmentNow(C);
 if(!owned.length)throw Error('Your equipment list only has bodyweight. Add equipment in Settings first.');
 modal('Equipment today',`<p>Untick anything you can’t use today. Exercises you haven’t started are swapped, and sets are added so the same muscles are still trained.</p>${owned.map(x=>`<label class="check"><input type="checkbox" name="eq" value="${x}" ${now.includes(x)?'checked':''}>${esc(equipmentLabels[x])}</label>`).join('')}`,async fd=>{
  const equipment=['bodyweight',...fd.getAll('eq')],d=C.state.draft,started=d.exercises.filter(e=>e.sets.some(s=>s.done)),pending=d.exercises.filter(e=>!e.sets.some(s=>s.done)),result=adaptItems(pending.filter(e=>exerciseById(e.exerciseId).tracking==='reps-load').map(e=>({...slotOf(e),ref:e})),equipment),kept=pending.filter(e=>exerciseById(e.exerciseId).tracking!=='reps-load'&&available(exerciseById(e.exerciseId),equipment));
  C.ui.equipmentToday=equipment;
  const next=result.items.map(i=>{if(i.ref&&i.ref.exerciseId===i.exerciseId){const extra=i.sets-i.ref.sets.length,last=i.ref.sets.at(-1);for(let n=0;n<extra;n++)i.ref.sets.push({...newSet(last?.reps||0,last?.load??null)});return i.ref}const fresh=itemFromSlot(C,i);if(i.ref&&!i.ref.range)fresh.range=null;return fresh});
  d.exercises=[...started,...next,...kept];
  const swapped=result.changes.filter(c=>c.to).map(c=>name(c.from)+' → '+name(c.to)),dropped=[...result.changes.filter(c=>!c.to).map(c=>name(c.from)),...pending.filter(e=>exerciseById(e.exerciseId).tracking!=='reps-load'&&!kept.includes(e)).map(e=>name(e.exerciseId))];
  await C.save(swapped.length||dropped.length?'Workout adjusted':'Nothing needed changing');
  if(swapped.length||dropped.length)setTimeout(()=>{const s=modal('Workout adjusted',`<ul class="detail-list">${swapped.map(x=>`<li>${esc(x)}</li>`).join('')}${dropped.map(x=>`<li>${esc(x)} removed: nothing similar is possible</li>`).join('')}${result.added.map(a=>`<li>${a.extended?a.sets+' more set'+(a.sets>1?'s':'')+' of':'Added'} ${esc(name(a.exerciseId))} to cover ${esc(lower(namesOf([a.covers])[0]))}</li>`).join('')}</ul>${result.uncovered.length?`<p class="warn-text">Not covered today: ${esc(lower(list(namesOf(result.uncovered))))}.</p>`:''}`,()=>{});s.querySelector('.modal-footer').innerHTML='<button type="button" class="btn primary" data-close>Done</button>';s.querySelector('.modal-footer [data-close]').onclick=()=>s.close()},0);
 });
}
export async function programAction(a,id,C){
 const s=C.state;
 if(a==='program-start'){const begin=async()=>{s.program={templateId:id,startedAt:TODAY(),next:0,completed:0,deloadUntil:null};document.querySelector('#modal').close();await C.save('Program started')};if(!programById(id))return true;if(s.program)C.confirm('Switch to '+programById(id).name+'?','Your week count starts again. Workout history is kept.',begin);else await begin();return true}
 if(a==='program-preview'){const b=built(C,id),d=modal(b.template.name,`<p>${esc(b.template.summary)}</p>${adjustments(C,b)}<div class="program-days">${b.days.map(x=>dayBlock(C,x)).join('')}</div><details class="fine"><summary>Weekly sets per muscle</summary><div>${volumeBars(b)}</div></details>`,()=>{});d.querySelector('.modal-footer').innerHTML=`<button type="button" class="btn" data-close>Close</button>${btn('Start this program','program-start:'+id,'primary')}`;d.querySelector('.modal-footer [data-close]').onclick=()=>d.close();return true}
 if(a==='program-change'){const d=modal('Change program',programs.map(x=>`<div class="row"><div><strong>${esc(x.name)}</strong>${x.id===recommend(s.profile).id?' <span class="badge">Recommended</span>':''}<p>${esc(x.level)} · ${esc(x.summary)}</p></div><div class="row-actions">${btn('Preview','program-preview:'+x.id,'small')}</div></div>`).join(''),()=>{});d.querySelector('.modal-footer').remove();return true}
 if(!s.program&&a.startsWith('program-'))return true;
 if(a==='program-workout'){await startProgramWorkout(C);return true}
 if(a==='program-skip'){s.program.next=(s.program.next+1)%programById(s.program.templateId).days.length;await C.save('Moved to the next session');return true}
 if(a==='program-deload'){const on=deloading(s.program);s.program.deloadUntil=on?null:s.program.completed+programById(s.program.templateId).perWeek;await C.save(on?'Recovery week ended':'Recovery week started');return true}
 if(a==='program-end'){C.confirm('End this program?','Workout history is kept. You can start a program again at any time.',async()=>{s.program=null;await C.save('Program ended')});return true}
 if(a==='swap-exercise'){swapDialog(C,id);return true}
 if(a==='equipment-today'){if(!s.draft)return true;equipmentDialog(C);return true}
 return false;
}
