// Quick log: one "+" button on every page that opens the common entry dialogs.
import {icon,modal} from './ui.js';
import {TODAY} from './store.js';
import {weightDialog,cardioDialog,wellbeingDialog} from './journal.js';
import {picker,startWorkout,withHistory} from './training.js';
import {openFocus} from './focus.js';

export const quickLogItems=[['calories','Calories','calories','Food or a meal, with optional protein'],['weight','Weight','weight','Today’s weigh-in'],['set','A set','training','Add an exercise to your workout'],['walk','A walk or run','cardio','Any activity with a duration'],['sleep','Sleep','time','Hours slept, steps and recovery']];

// Hidden during a live workout on Training, where the finish bar and focus mode take that space.
export function quickLogButton(C,page){
 if(page==='training'&&C.state.draft)return '';
 return `<button class="quick-log" data-action="quick-log" aria-label="Quick log" title="Quick log">${icon('plus')}</button>`;
}

export async function quickLog(C,kind,openCalories){
 const s=C.state;
 if(!kind){const d=modal('Quick log',`<div class="quick-grid">${quickLogItems.map(([id,label,ico,hint])=>`<button type="button" class="quick-item" data-action="quick-log:${id}">${icon(ico)}<span><strong>${label}</strong><small>${hint}</small></span></button>`).join('')}</div>`,()=>{});d.querySelector('.modal-footer').remove();d.querySelector('.quick-item').focus({preventScroll:true});return}
 if(kind==='calories'){openCalories();return}
 if(kind==='weight'){weightDialog(C);return}
 if(kind==='walk'){cardioDialog(C);return}
 if(kind==='sleep'){wellbeingDialog(C,s.wellbeing.find(w=>w.date===TODAY())?.id||'');return}
 if(kind==='set'){
  if(s.draft){document.querySelector('#modal').close();location.hash='training';if(C.prefs.focusAuto&&s.draft.exercises.length&&!s.draft.editingId)openFocus(C);return}
  picker(C,async exerciseId=>{await startWorkout(C);C.state.draft.exercises.push(withHistory(C,exerciseId));await C.save('Workout started');if(C.prefs.focusAuto)openFocus(C)});
 }
}
