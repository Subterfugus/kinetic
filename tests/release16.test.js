import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises,exerciseById,matchesQuery,searchExercises} from '../dist/data.js';
import {validateState} from '../dist/validation.js';
import {initialState} from '../dist/store.js';
import {isFreshJournal,setupTitles} from '../dist/setup.js';
import {tourSteps} from '../dist/tour.js';

test('Exercise search matches words in any order, across muscles and equipment, with gym shorthand',()=>{
 const find=q=>exercises.filter(e=>matchesQuery(e,q)).map(e=>e.id);
 assert.equal(find('').length,exercises.length);
 const squat=exerciseById('goblet-squat');
 assert.ok(matchesQuery(squat,'squat goblet'));
 assert.ok(matchesQuery(squat,'DUMBBELL quadriceps'));
 assert.ok(matchesQuery(squat,'db squat'));
 assert.ok(!matchesQuery(squat,'barbell'));
 assert.match(searchExercises(exercises,'biceps')[0].name,/curl/i,'curls come before rows for biceps');
 assert.ok(find('chest barbell').every(id=>{const e=exerciseById(id);return e.equipment.includes('barbell')}));
});

test('Protein amounts and the protein target are optional and range-checked',()=>{
 const s=initialState();
 assert.equal(s.profile.proteinTarget,null);
 s.calories=[{id:'a',date:'2026-10-09',kcal:500,description:'Oats'},{id:'b',date:'2026-10-09',kcal:300,description:'Shake',protein:40}];
 s.profile.proteinTarget=140;
 validateState(structuredClone(s));
 assert.throws(()=>validateState({...structuredClone(s),calories:[{id:'c',date:'2026-10-09',kcal:300,description:'',protein:-1}]}));
 assert.throws(()=>validateState({...structuredClone(s),profile:{...s.profile,proteinTarget:5}}));
 const old=initialState();delete old.profile.proteinTarget;
 assert.equal(validateState(old).profile.proteinTarget,null,'older backups without a protein target still restore');
});

test('First-run setup only opens on a fresh journal, and the tour mentions the new features',()=>{
 const s=initialState();
 assert.ok(isFreshJournal(s));
 assert.ok(!isFreshJournal({...s,weights:[{id:'w',date:'2026-10-09',kg:80}]}));
 assert.ok(!isFreshJournal({...s,program:{templateId:'fb3'}}));
 assert.deepEqual(setupTitles,['Units','Equipment','Training days','Your program']);
 const text=JSON.stringify(tourSteps);
 for(const phrase of ['protein','first-time setup','+ button'])assert.ok(text.includes(phrase),phrase+' missing from the tour');
});

test('Muscle load counts primary sets fully and secondary sets as half',async()=>{
 const {muscleLoad,topGroups}=await import('../dist/figure.js');
 const e=exerciseById('goblet-squat'),load=muscleLoad([{exerciseId:'goblet-squat',sets:3}]);
 for(const g of e.primary)assert.equal(load[g],3);
 for(const g of e.secondary.filter(g=>!e.primary.includes(g)))assert.equal(load[g],1.5);
 assert.equal(topGroups(load)[0].sets,3);
});

test('Suggested workouts use available equipment, fit the focus and skip muscles still recovering',async()=>{
 const {suggestWorkout}=await import('../dist/suggest.js');
 const {available,isCompound}=await import('../dist/programs.js');
 const s=initialState(),today='2026-10-10';
 const w=suggestWorkout(s,{focus:'auto',today});
 assert.ok(w.items.length>=3&&w.items.length<=5,'beginner session length');
 for(const i of w.items){const e=exerciseById(i.exerciseId);assert.ok(available(e,s.profile.equipment));assert.ok(i.sets>=2&&i.sets<=3);assert.ok(i.why.length<=300)}
 const kinds=w.items.map(i=>isCompound(exerciseById(i.exerciseId)));assert.deepEqual(kinds,[...kinds].sort((a,b)=>b-a),'big lifts first');
 const pull=suggestWorkout(s,{focus:'pull',today});
 assert.ok(pull.items.every(i=>exerciseById(i.exerciseId).primary.some(g=>['lats','upper-back','rear-delts','biceps'].includes(g))));
 const done=n=>({id:'s'+n,reps:8,load:20,duration:0,distance:0,rpe:null,rir:2,warmup:false,done:true});
 s.sessions=[{id:'x',name:'Chest',date:'2026-10-09',notes:'',restSeconds:120,exercises:[{id:'i',exerciseId:'floor-press',targetReps:8,notes:'',superset:'',sets:[1,2,3].map(done)}]}];
 const after=suggestWorkout(s,{focus:'auto',today});
 assert.ok(after.skipped.includes('chest'));
 assert.ok(after.items.every(i=>!exerciseById(i.exerciseId).primary.includes('chest')),'chest trained yesterday is skipped');
 assert.equal(suggestWorkout(s,{focus:'push',today}).tired.includes('chest'),true);
});
