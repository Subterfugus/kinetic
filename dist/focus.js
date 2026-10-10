// Focus mode: a full-screen, one-set-at-a-time view of the unfinished workout.
// It edits the same draft as the Training page, so leaving it loses nothing.
import {exerciseById} from './data.js';
import {loadStep,plates} from './programs.js';
import {validateDraft} from './validation.js';
import {newSet,trainingAction} from './training.js';
import {esc,icon,num,toast} from './ui.js';
import {figure,exerciseLoad} from './figure.js';

let el=null,C=null,at=0,mode='set',justDone=null,ticker=null,busy=false;
const draft=()=>C?.state?.draft;
const nextOpen=item=>item.sets.findIndex(s=>!s.done);
const firstOpenItem=()=>{const d=draft(),i=d.exercises.findIndex(e=>nextOpen(e)>=0);return i<0?null:i};
const range=item=>item.range?(item.range[0]===item.range[1]?item.range[0]:item.range[0]+'–'+item.range[1]):item.targetReps;
const clock=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
const shown=kg=>Number.isFinite(kg)?Number(Number(C.displayLoad(kg)).toFixed(2)):'';
const unitStep=e=>Number(Number(C.displayLoad(loadStep(e,C.state.profile.units))).toFixed(2));

export const focusOpen=()=>!!el;
export function openFocus(context){
 C=context;if(!draft())return;if(el)closeFocus(false);
 at=firstOpenItem()??0;mode='set';justDone=null;
 el=document.createElement('div');el.className='focus';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Focus mode');
 el.tabIndex=-1;document.body.append(el);document.body.classList.add('focus-open');const app=document.querySelector('#app');if(app)app.inert=true;
 el.addEventListener('click',onClick);el.addEventListener('change',onChange);el.addEventListener('keydown',onKey);
 ticker=setInterval(tick,250);paint();
}
export function closeFocus(render=true){
 if(!el)return;clearInterval(ticker);el.remove();el=null;busy=false;document.body.classList.remove('focus-open');const app=document.querySelector('#app');if(app)app.inert=false;if(render&&C?.state)C.render();
}
// Called after every app render so a swap, an added exercise or a deleted workout shows up here too.
export function refreshFocus(){if(!el)return;if(!draft()){closeFocus(false);return}at=Math.min(at,Math.max(0,draft().exercises.length-1));if(mode==='set'&&draft().exercises.length&&nextOpen(draft().exercises[at])<0)at=firstOpenItem()??at;paint()}

function plateLine(e,kg){
 if(!e.equipment.includes('barbell')||!(kg>0))return '';
 const units=C.state.profile.units,bar=C.prefs.bar?.[units]??(units==='imperial'?45:20),p=plates(kg,units,bar),u=C.loadUnit();
 return `<button type="button" class="focus-plates" data-f="bar" title="Change bar weight">${p?(p.perSide.length?'Each side: '+p.perSide.join(' + '):'Empty bar')+(p.remainder?' · '+num(Math.abs(p.remainder),2)+' '+u+' short of an exact match':''):'Lighter than the bar'} · ${bar} ${u} bar</button>`;
}
function dial(key,label,value,step,unit){
 return `<div class="focus-dial"><span class="focus-label">${label}</span><div class="focus-stepper"><button type="button" data-f="step" data-key="${key}" data-by="${-step}" aria-label="Lower ${label.toLowerCase()}">−</button><input class="focus-num" data-key="${key}" type="number" inputmode="decimal" min="0" step="any" value="${value}" aria-label="${label}"><button type="button" data-f="step" data-key="${key}" data-by="${step}" aria-label="Raise ${label.toLowerCase()}">+</button></div><span class="focus-unit">${unit}</span></div>`;
}
function ring(){
 const end=C.restEnd,left=end===null?0:Math.max(0,Math.ceil((end-Date.now())/1000)),item=draft().exercises[justDone?.item??at],total=(item?.rest||draft().restSeconds||120),r=54,c=2*Math.PI*r,frac=end===null?0:Math.min(1,left/total);
 return `<div class="focus-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="${r}" class="track"/><circle cx="60" cy="60" r="${r}" class="fill" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-frac)}" transform="rotate(-90 60 60)"/></svg><div class="focus-ring-text" role="timer"><strong data-rest>${end===null?'—':clock(left)}</strong><small>${end===null?'No timer':left?'Rest':'Go'}</small></div></div>`;
}
function upNext(){
 const d=draft(),i=firstOpenItem();if(i===null)return 'That was the last set.';
 const item=d.exercises[i],s=item.sets[nextOpen(item)],e=exerciseById(item.exerciseId),load=Number.isFinite(s.load)&&s.load>0?' · '+num(C.displayLoad(s.load),1)+' '+C.loadUnit():'';
 return 'Next: '+e.name+' · set '+(nextOpen(item)+1)+' of '+item.sets.length+load;
}
function paint(){
 const d=draft();if(!d||!el)return;queueMicrotask(()=>{if(el&&!document.querySelector("#modal").open&&!el.contains(document.activeElement))(el.querySelector(".focus-done")||el).focus({preventScroll:true})});
 const total=d.exercises.reduce((n,e)=>n+e.sets.length,0),done=d.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0);
 const head=`<header class="focus-head"><button type="button" class="btn ghost small" data-f="close" aria-label="Leave focus mode">${icon('close')}</button><div class="focus-progress"><div class="progress"><span style="width:${total?done/total*100:0}%"></span></div><small>${done} of ${total} sets · <span data-elapsed></span></small></div><button type="button" class="btn small" data-f="close">List</button></header>`;
 if(!d.exercises.length){el.innerHTML=head+`<div class="focus-body"><h1>No exercises yet</h1><p class="focus-why">Add one from the list view.</p><button type="button" class="btn primary focus-done" data-f="close">Open the list</button></div>`;return}
 if(mode==='rest'&&justDone){
  const item=d.exercises[justDone.item],set=item?.sets[justDone.set],finished=firstOpenItem()===null;
  el.innerHTML=head+`<div class="focus-body"><div class="eyebrow">Set done</div>${ring()}<div class="focus-rir"><span class="focus-label">How many more could you have done?</span><div class="focus-chips">${[0,1,2,3,4].map(n=>`<button type="button" data-f="rir" data-rir="${n}" class="${set?.rir===n?'on':''}" aria-pressed="${set?.rir===n}" aria-label="${n===4?'4 or more':n} reps in reserve">${n===4?'4+':n}</button>`).join('')}</div></div><p class="focus-why">${esc(upNext())}</p><button type="button" class="btn primary focus-done" data-f="${finished?'finish':'next'}">${finished?'Finish workout':'Start next set'}</button><div class="button-group focus-rest-actions"><button type="button" class="btn small" data-action="timer-add:30">+30 s</button><button type="button" class="btn small" data-f="undo">Undo set</button></div></div>`;
  return;
 }
 const item=d.exercises[at],e=exerciseById(item.exerciseId),open=nextOpen(item),timed=e.tracking!=='reps-load';
 if(open<0){
  const all=firstOpenItem()===null;
  el.innerHTML=head+`<div class="focus-body"><div class="eyebrow">Exercise ${at+1} of ${d.exercises.length}</div><h1>${esc(e.name)}</h1><p class="focus-why">All ${item.sets.length} sets done.</p><button type="button" class="btn primary focus-done" data-f="${all?'finish':'jump'}">${all?'Finish workout':'Next exercise'}</button><div class="button-group focus-rest-actions"><button type="button" class="btn small" data-f="add-set">Add a set</button></div></div>${foot(d)}`;
  return;
 }
 const set=item.sets[open],target=timed?'Target '+(item.targetDuration||30)+' seconds':'Target '+range(item)+' reps'+(item.targetRir!==null&&item.targetRir!==undefined?' · leave about '+item.targetRir+' in reserve':'');
 el.innerHTML=head+`<div class="focus-body"><div class="eyebrow">Exercise ${at+1} of ${d.exercises.length} · set ${open+1} of ${item.sets.length}</div><h1>${esc(e.name)}</h1>${figure(exerciseLoad(e),{size:'tiny',unit:'role'})}<p class="focus-target">${esc(target)}</p>${item.why?`<p class="focus-why">${esc(item.why)}</p>`:''}<div class="focus-dials">${timed?dial('duration','Seconds',set.duration||item.targetDuration||30,5,'s'):dial('load','Load',shown(set.load),unitStep(e),C.loadUnit())+dial('reps','Reps',set.reps||item.targetReps||'',1,'reps')}</div>${timed?'':plateLine(e,set.load)}<button type="button" class="btn primary focus-done" data-f="done">${icon('check')}Done</button></div>${foot(d)}`;
}
const foot=d=>`<footer class="focus-foot"><button type="button" class="btn small" data-f="prev" ${at===0?'disabled':''}>Previous</button><button type="button" class="btn small" data-action="swap-exercise:${d.exercises[at].id}">Swap</button><button type="button" class="btn small" data-action="exercise:${d.exercises[at].exerciseId}">How to</button><button type="button" class="btn small" data-f="skip" ${at>=d.exercises.length-1?'disabled':''}>Skip</button></footer>`;

function readDials(set,e){
 for(const input of el.querySelectorAll('.focus-num')){const v=input.value===''?null:Number(input.value),key=input.dataset.key;if(v!==null&&!(v>=0))throw Error('Enter a positive number.');set[key]=key==='load'?(v===null?null:C.parseLoad(v)):key==='reps'?(v===null?0:Math.round(v)):v??0}
}
async function commit(message){try{validateDraft(draft(),{editing:true});await C.persist()}catch(err){toast(err.message);throw err}if(message)toast(message)}
async function onClick(event){
 const b=event.target.closest('[data-f]');if(!b||!draft()||busy)return;busy=true;
 const d=draft(),item=d.exercises[at],f=b.dataset.f;
 try{
  if(f==='close'){closeFocus();return}
  if(f==='step'){const input=el.querySelector('.focus-num[data-key="'+b.dataset.key+'"]'),next=Math.max(0,(Number(input.value)||0)+Number(b.dataset.by));input.value=Number(next.toFixed(2));input.dispatchEvent(new Event('change',{bubbles:true}));return}
  if(f==='bar'){const units=C.state.profile.units,options=units==='imperial'?[45,35,25,15]:[20,15,10,7.5],current=C.prefs.bar?.[units]??options[0];C.setPref('bar',{...C.prefs.bar,[units]:options[(options.indexOf(current)+1)%options.length]});paint();return}
  if(f==='done'){const e=exerciseById(item.exerciseId),i=nextOpen(item),set=item.sets[i];const before={...set};try{readDials(set,e);set.done=true;validateDraft({...d,exercises:[{...item,sets:[set]}]},{requireTracking:true});validateDraft(d,{editing:true})}catch(err){Object.assign(set,before);throw err}for(const later of item.sets.slice(i+1))if(!later.done&&later.load===null)later.load=set.load;await commit();justDone={item:at,set:i};mode='rest';C.startRest(item.rest||d.restSeconds);paint();return}
  if(f==='rir'&&justDone){const set=d.exercises[justDone.item].sets[justDone.set],n=Number(b.dataset.rir);set.rir=set.rir===n?null:n;set.rpe=null;await commit();paint();return}
  if(f==='undo'&&justDone){d.exercises[justDone.item].sets[justDone.set].done=false;at=justDone.item;justDone=null;mode='set';await commit();paint();return}
  if(f==='next'||f==='jump'){mode='set';justDone=null;if(nextOpen(d.exercises[at])<0)at=firstOpenItem()??at;paint();return}
  if(f==='prev'){at=Math.max(0,at-1);mode='set';paint();return}
  if(f==='skip'){at=Math.min(d.exercises.length-1,at+1);mode='set';paint();return}
  if(f==='add-set'){const last=item.sets.at(-1);item.sets.push({...newSet(last?.reps||0,last?.load??null),duration:last?.duration??0});await commit();paint();return}
  if(f==='finish'){closeFocus(false);await trainingAction('finish-workout','',C);return}
 }catch(err){toast(err.message)}finally{busy=false}
}
// Typing a number saves it straight to the set, so leaving focus mode keeps it.
async function onChange(event){
 const input=event.target.closest('.focus-num');if(!input||!draft())return;
 const item=draft().exercises[at],i=nextOpen(item);if(i<0)return;
 const before={...item.sets[i]};try{readDials(item.sets[i],exerciseById(item.exerciseId));try{await commit()}catch(err){Object.assign(item.sets[i],before);throw err}const line=el.querySelector('.focus-plates');if(line)line.outerHTML=plateLine(exerciseById(item.exerciseId),item.sets[i].load)}catch{/* The message is already shown. */}
}
function onKey(event){if(event.key==='Escape'&&!document.querySelector('#modal').open){closeFocus()}else if(event.key==='Enter'&&event.target.matches('.focus-num')){event.preventDefault();el.querySelector('[data-f="done"]')?.click()}}
function tick(){
 if(!el)return;if(!draft()){closeFocus(false);return}
 if(mode!=='rest')return;
 const end=C.restEnd,text=el.querySelector('[data-rest]');
 if(end!==null&&Date.now()>=end&&firstOpenItem()!==null){mode='set';justDone=null;if(nextOpen(draft().exercises[at])<0)at=firstOpenItem()??at;paint();return}
 if(text){const left=end===null?0:Math.max(0,Math.ceil((end-Date.now())/1000)),label=end===null?'—':clock(left);if(text.textContent!==label){const body=el.querySelector('.focus-ring');if(body)body.outerHTML=ring()}}
}
