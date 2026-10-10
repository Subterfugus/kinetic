// Suggested changes: when a workout starts, any step up (or down) in load or reps is offered in a popup, never applied
// without asking. Until accepted, each exercise starts at what was done last time.
import {exerciseById} from './data.js';
import {performance} from './science.js';
import {esc,modal,num} from './ui.js';

// Last session's top load and the fewest reps done at it: the baseline a suggestion is compared with.
export function lastTime(sessions,exerciseId){
 const last=performance(sessions,exerciseId).at(-1);if(!last)return null;
 const load=last.load>0?last.load:null,reps=last.sets.filter(s=>load===null||s.load===load).map(s=>s.reps).filter(r=>r>0);
 return reps.length?{load,reps:Math.min(...reps)}:null;
}
// The change a target would make, or null when it matches last time.
export function change(prev,target){
 if(!prev||!target)return null;
 const load=target.load>0&&prev.load>0&&Math.abs(target.load-prev.load)>.01?target.load:null,reps=target.reps>0&&target.reps!==prev.reps?target.reps:null;
 return load===null&&reps===null?null:{load:target.load>0?target.load:prev.load,reps:target.reps>0?target.reps:prev.reps,from:prev};
}
const setAll=(item,load,reps)=>{for(const s of item.sets)if(!s.done){if(load>0)s.load=load;s.reps=reps}};
// Put an item that already carries its program target back to last time's numbers, keeping the target as a suggestion.
export function holdBack(C,item){
 const e=exerciseById(item.exerciseId);if(e?.tracking!=='reps-load')return item;
 const prev=lastTime(C.state.sessions,item.exerciseId),c=change(prev,{load:item.targetLoad,reps:item.targetReps});if(!c)return item;
 item.suggest={load:c.load,reps:c.reps,note:(item.why||'').slice(0,300)};
 setAll(item,prev.load,prev.reps);item.targetLoad=prev.load;item.targetReps=prev.reps;item.why='Same as last time unless you take the suggested change.';
 return item;
}
const describe=(C,i)=>{const s=i.suggest,f=s.from||lastTime(C.state.sessions,i.exerciseId)||{},w=kg=>num(C.displayLoad(kg),1)+' '+C.loadUnit(),parts=[];
 if(s.load>0&&f.load>0&&Math.abs(s.load-f.load)>.01)parts.push(w(f.load)+' → '+w(s.load));
 if(s.reps!==f.reps)parts.push((f.reps??'?')+' → '+s.reps+' reps');
 return parts.join(' · ')};
// Offer every pending suggestion in one popup. Ticked ones are applied; the rest stay at last time's numbers.
// Closing it any other way (Keep last time's, the X, Escape) keeps last time's numbers too, so no hidden suggestion is left behind.
export function offerSteps(C){
 const d=C.state.draft,items=d?.exercises.filter(i=>i.suggest)||[];if(!items.length)return;
 const clear=()=>{for(const i of d.exercises)delete i.suggest};
 const dialog=modal('Ready to step up?',`<p>Based on your last sessions, Kinetic suggests these changes. Untick any you’d rather keep at last time’s numbers.</p>${items.map(i=>`<label class="check step-row"><input type="checkbox" name="step" value="${esc(i.id)}" checked><span><strong>${esc(exerciseById(i.exerciseId).name)}</strong> · ${esc(describe(C,i))}<br><small>${esc(i.suggest.note)}</small></span></label>`).join('')}`,async fd=>{
  const ticked=new Set(fd.getAll('step'));let n=0;
  for(const i of items)if(ticked.has(i.id)){setAll(i,i.suggest.load,i.suggest.reps);i.targetLoad=i.suggest.load>0?i.suggest.load:i.targetLoad;i.targetReps=i.suggest.reps;i.why=i.suggest.note;n++}
  clear();await C.save(n?n+' suggested change'+(n===1?'':'s')+' applied':'Kept last time’s numbers');
 });
 dialog.querySelector('.modal-footer .primary').textContent='Use ticked';
 dialog.querySelector('.modal-footer [data-close]').textContent='Keep last time’s';
 dialog.addEventListener('close',()=>{const now=C.state.draft;if(now?.id===d.id&&now.exercises.some(i=>i.suggest)){for(const i of now.exercises)delete i.suggest;C.save('Kept last time’s numbers')}},{once:true});
}
