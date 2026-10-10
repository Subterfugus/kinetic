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
