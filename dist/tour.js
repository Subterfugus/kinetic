// Welcome tour: shown once per device on first launch and on demand from Settings.
// Keep these steps in sync with the app. When a page is added, renamed or removed, or a headline feature changes, update this list (see info.md).
import {esc,icon} from './ui.js';
export const tourSteps=[
 {icon:'check',title:'Welcome to Kinetic',body:'A private journal for your training, food and body. Everything you log stays in this browser on this device. Nothing is uploaded.',points:[]},
 {icon:'overview',title:'Today',body:'Your day at a glance.',points:['The workout you scheduled, ready to start','Calories logged against your target','Your weight trend and this week’s sessions']},
 {icon:'training',title:'Training',body:'Where you log workouts.',points:['Start a workout, add exercises and tick each set as you finish it','Loads are filled in from last time, and the rest timer starts on its own','Save a set of exercises as a routine to start faster next time']},
 {icon:'plan',title:'Plan',body:'Decide what you’ll do before you get to the gym.',points:['Build routines, or generate a starter routine from your equipment','Assign routines to days of the week']},
 {icon:'insights',title:'Track',body:'Body, Calories, Cardio and Insights.',points:['Body: weigh-ins, measurements, body-fat readings and photos','Calories: quick totals with an optional description','Cardio: activities, plus optional sleep and recovery notes','Insights: charts and personal records from everything you log']},
 {icon:'exercises',title:'Library',body:'Exercises, Muscle atlas and Sources.',points:['63 exercises with technique notes and substitutions','A muscle map showing what each exercise works and what you’ve trained','The research behind every number the app shows']},
 {icon:'settings',title:'Settings and backups',body:'Set your units, goal and equipment in Settings. Your journal exists only in this browser, so export a backup regularly. You can also lock it with a passphrase.',points:[]}
];
export function startTour(C,index=0){
 const d=document.querySelector('#modal'),last=tourSteps.length-1;
 const paint=i=>{const s=tourSteps[i];
  d.setAttribute('aria-labelledby','modal-title');
  d.innerHTML=`<div class="modal-header"><h2 id="modal-title">Welcome tour</h2><button type="button" class="btn ghost small" data-tour="close" aria-label="Close tour">${icon('close')}</button></div><div class="modal-body tour"><div class="tour-icon">${icon(s.icon)}</div><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p>${s.points.length?`<ul class="detail-list">${s.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:''}<div class="tour-dots" role="img" aria-label="Step ${i+1} of ${tourSteps.length}">${tourSteps.map((_,n)=>`<i class="${n===i?'on':''}"></i>`).join('')}</div><div class="modal-footer">${i===0?'<button type="button" class="btn" data-tour="close">Skip</button>':'<button type="button" class="btn" data-tour="back">Back</button>'}${i===last?'<button type="button" class="btn" data-tour="settings">Open Settings</button><button type="button" class="btn primary" data-tour="close">Done</button>':'<button type="button" class="btn primary" data-tour="next">Next</button>'}</div></div>`;
  d.querySelectorAll('[data-tour]').forEach(b=>b.onclick=()=>{const a=b.dataset.tour;if(a==='next')paint(i+1);else if(a==='back')paint(i-1);else{d.close();if(a==='settings')location.hash='settings'}});
  d.querySelector('.btn.primary').focus({preventScroll:true})};
 C.setPref('tourSeen',true);d.onclose=()=>document.querySelector('#main')?.focus({preventScroll:true});
 paint(Math.min(Math.max(index,0),last));if(!d.open)d.showModal();
}
