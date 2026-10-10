// First-run setup: units, equipment and training days, then an offer to start the recommended program.
// Shown once per device on a fresh journal in place of the welcome tour, and on demand from Settings → About.
import {esc,icon} from './ui.js';
import {equipmentLabels} from './data.js';
import {recommend,programById} from './programs.js';
import {startTour} from './tour.js';

export const isFreshJournal=s=>!s.program&&!s.sessions.length&&!s.routines.length&&!s.weights.length&&!s.calories.length;
export const setupTitles=['Units','Equipment','Training days','Your program'];

export function startSetup(C){
 const d=document.querySelector('#modal'),p=C.state.profile,draft={units:p.units,equipment:[...new Set(['bodyweight',...p.equipment])],days:p.days},last=setupTitles.length-1;
 const dots=i=>`<div class="tour-dots" role="img" aria-label="Step ${i+1} of ${setupTitles.length}">${setupTitles.map((_,n)=>`<i class="${n===i?'on':''}"></i>`).join('')}</div>`;
 const bodyFor=i=>{
  if(i===0)return `<h3>Which units do you use?</h3><p>You can change this later in Settings. Your records convert automatically.</p><div class="setup-choices" role="radiogroup" aria-label="Units">${[['metric','Metric','kg, cm, km'],['imperial','Imperial','lb, in, mi']].map(([v,l,h])=>`<label class="setup-choice"><input type="radio" name="setup-units" value="${v}" ${draft.units===v?'checked':''}><span><strong>${l}</strong><small>${h}</small></span></label>`).join('')}</div>`;
  if(i===1)return `<h3>What equipment can you use?</h3><p>Programs and exercise swaps only use what you tick. Bodyweight is always included.</p><div class="setup-grid">${Object.entries(equipmentLabels).map(([v,l])=>`<label class="check"><input type="checkbox" name="setup-equipment" value="${v}" ${draft.equipment.includes(v)?'checked':''} ${v==='bodyweight'?'disabled':''}>${esc(l)}</label>`).join('')}</div>`;
  if(i===2)return `<h3>How many days a week can you train?</h3><p>Pick what you can keep up most weeks, not your best week.</p><div class="setup-days" role="radiogroup" aria-label="Training days per week">${[1,2,3,4,5,6,7].map(n=>`<label class="setup-day"><input type="radio" name="setup-days" value="${n}" ${draft.days===n?'checked':''}><span>${n}</span></label>`).join('')}</div>`;
  const s=C.state,saved='<p class="meta">Your units, equipment and training days are saved.</p>';if(s.profile.goal==='mobility')return `<h3>You’re set up</h3>${saved}<p>Your goal is mobility, so there is no strength program to start. Open Plan to build routines.</p>`;
  if(s.program)return `<h3>You’re set up</h3>${saved}<p>You are already following ${esc(programById(s.program.templateId)?.name||'a program')}. It now uses your new equipment and days.</p>`;
  const rec=recommend(s.profile),t=programById(rec.id);
  return `<h3>We recommend ${esc(t.name)}</h3><p>${esc(t.summary)} ${esc(rec.reason)}</p><p class="meta">Each session is adjusted to your equipment, and the targets rise as you get stronger. You can preview it or pick another program in Plan.</p>${saved}`;
 };
 const footer=i=>{
  const back=i===0?'<button type="button" class="btn" data-setup="close">Skip setup</button>':'<button type="button" class="btn" data-setup="back">Back</button>';
  if(i<last)return back+'<button type="button" class="btn primary" data-setup="next">Next</button>';
  const s=C.state,rec=!s.program&&s.profile.goal!=='mobility'?recommend(s.profile).id:null;
  return '<button type="button" class="btn" data-setup="tour">Take the tour</button>'+(rec?`<button type="button" class="btn" data-setup="close">Not now</button><button type="button" class="btn primary" data-action="program-start:${rec}">Start this program</button>`:'<button type="button" class="btn primary" data-setup="close">Done</button>');
 };
 const read=i=>{
  if(i===0)draft.units=d.querySelector('[name=setup-units]:checked')?.value||draft.units;
  if(i===1)draft.equipment=['bodyweight',...[...d.querySelectorAll('[name=setup-equipment]:checked')].map(x=>x.value).filter(x=>x!=='bodyweight')];
  if(i===2)draft.days=Number(d.querySelector('[name=setup-days]:checked')?.value)||draft.days;
 };
 const paint=i=>{
  d.setAttribute('aria-labelledby','modal-title');
  d.innerHTML=`<div class="modal-header"><h2 id="modal-title">Set up Kinetic</h2><button type="button" class="btn ghost small" data-setup="close" aria-label="Close setup">${icon('close')}</button></div><div class="modal-body tour setup"><div class="tour-icon">${icon(['settings','training','plan','check'][i])}</div><p class="eyebrow">Step ${i+1} of ${setupTitles.length} · ${setupTitles[i]}</p>${bodyFor(i)}${dots(i)}<p class="error" role="alert"></p><div class="modal-footer">${footer(i)}</div></div>`;
  d.querySelectorAll('[data-setup]').forEach(b=>b.onclick=async()=>{
   const a=b.dataset.setup;
   if(a==='close'){d.close();return}
   if(a==='tour'){startTour(C);return}
   read(i);
   if(a==='back'){paint(i-1);return}
   if(i===2){const old=C.state.profile;try{C.state.profile={...old,...draft};await C.persist();C.render()}catch(err){C.state.profile=old;d.querySelector('.error').textContent=err.message;return}}
   paint(i+1);
  });
  (d.querySelector('input:not([disabled]):checked')||d.querySelector('.btn.primary'))?.focus({preventScroll:true});
 };
 C.setPref('tourSeen',true);
 d.onclose=()=>document.querySelector('#main')?.focus({preventScroll:true});
 paint(0);if(!d.open)d.showModal();
}
