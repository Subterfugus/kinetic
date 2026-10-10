// 1.8: rep-range preference (general and per exercise) and equipment alternatives for every movement.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {exercises,exerciseById,groups} from '../dist/data.js';
import {programs,buildProgram,substitutes,available,preferredReps,repPreference,applyRepPreference,defaultReps,REP_SOURCES,loadable} from '../dist/programs.js';
import {suggestWorkout} from '../dist/suggest.js';
import {initialState} from '../dist/store.js';
import {validateState} from '../dist/validation.js';

const ex=id=>exerciseById(id);
const evidence=JSON.parse(fs.readFileSync(new URL('../dist/assets/evidence.json',import.meta.url)));
const profile=(o={})=>({...initialState().profile,experience:'intermediate',...o});

test('The library is larger and every strength exercise is tagged with real muscle groups for the map',()=>{
 assert.ok(exercises.length>=190,'only '+exercises.length+' exercises');
 for(const e of exercises.filter(e=>e.category==='strength')){
  assert.ok(e.primary.length,e.id+' has no primary muscle');
  for(const g of [...e.primary,...e.secondary,...e.stabilizers])assert.ok(groups.some(x=>x.id===g),e.id+': '+g);
  assert.ok(!e.primary.some(g=>e.secondary.includes(g)),e.id+' lists a muscle as both primary and secondary');
 }
});

test('No shoulder press machine: dumbbells alone give a dumbbell overhead press as the closest match',()=>{
 const top=substitutes(ex('machine-shoulder-press'),['bodyweight','dumbbell'])[0];
 assert.equal(top.exercise.id,'standing-dumbbell-press');assert.equal(top.tier,'Closest match');
});

test('Each common home setup has a same-movement option for the main gym lifts',()=>{
 const setups={dumbbells:['bodyweight','dumbbell'],kettlebell:['bodyweight','kettlebell'],bands:['bodyweight','band'],cableMachines:['bodyweight','cable','machine']};
 const lifts=['barbell-squat','romanian-deadlift','bench-press','overhead-press','barbell-row','leg-extension','leg-curl','triceps-pushdown','dumbbell-curl','hip-adduction','hip-abduction'];
 for(const [name,eq]of Object.entries(setups))for(const id of lifts){
  const s=substitutes(ex(id),eq);assert.ok(s.length,name+': nothing for '+id);
  assert.ok(s[0].exercise.primary.some(g=>ex(id).primary.includes(g)),name+': '+id+' → '+s[0].exercise.id);
 }
});

test('Programs still build with nothing uncovered on a dumbbell-and-bench home setup',()=>{
 for(const p of programs){const b=buildProgram(p.id,profile({equipment:['bodyweight','dumbbell','bench','pullup']}));for(const d of b.days)assert.deepEqual(d.uncovered,[],p.id+'/'+d.name)}
});

test('Rep preference: lower and higher ranges per kind of exercise, and main lifts keep their range',()=>{
 assert.deepEqual(preferredReps(ex('bench-press'),[6,10],'lower'),[5,8]);
 assert.deepEqual(preferredReps(ex('bench-press'),[6,10],'higher'),[12,20]);
 assert.deepEqual(preferredReps(ex('barbell-squat'),[6,10],'higher'),[10,15]);
 assert.deepEqual(preferredReps(ex('lateral-raise'),[12,20],'lower'),[8,12]);
 assert.deepEqual(preferredReps(ex('leg-extension'),[10,15],'lower'),[6,10]);
 assert.deepEqual(preferredReps(ex('leg-extension'),[10,15],'higher'),[15,25]);
 assert.deepEqual(preferredReps(ex('pull-up'),[5,10],'higher'),[8,15]);
 assert.deepEqual(preferredReps(ex('bench-press'),[3,6],'higher',true),[3,6]);
 assert.deepEqual(preferredReps(ex('bench-press'),[6,10],'balanced'),[6,10]);
 assert.deepEqual(preferredReps(ex('plank'),[1,1],'higher'),[1,1]);
 // Applying twice gives the same answer, and the high end never passes 30 reps.
 for(const e of exercises.filter(e=>e.tracking==='reps-load'))for(const pref of ['lower','higher']){const once=preferredReps(e,defaultReps(e),pref);assert.deepEqual(preferredReps(e,once,pref),once);assert.ok(once[1]<=30&&once[0]>=3&&once[0]<once[1],e.id)}
});

test('A per-exercise setting wins over the general one',()=>{
 const p=profile({repPreference:'higher',repPrefs:{'bench-press':'lower','leg-press':'balanced'}});
 assert.equal(repPreference(p,'bench-press'),'lower');assert.equal(repPreference(p,'leg-press'),'balanced');assert.equal(repPreference(p,'lat-pulldown'),'higher');
 assert.equal(repPreference({},'bench-press'),'balanced');
 const item=applyRepPreference({exerciseId:'bench-press',sets:3,reps:[6,10],rir:2,rest:150,main:false},p);
 assert.deepEqual(item.reps,[5,8]);assert.ok(item.rest>=180,'heavier sets get more rest');
});

test('Programs follow the preference but heavy strength lifts stay heavy',()=>{
 const high=buildProgram('ul4',profile({repPreference:'higher',equipment:['bodyweight','barbell','dumbbell','bench','rack','cable','machine','pullup']}));
 const bench=high.days[0].items.find(i=>i.exerciseId==='bench-press');assert.deepEqual(bench.reps,[12,20]);
 const strength=buildProgram('str3',profile({repPreference:'higher',equipment:['bodyweight','barbell','dumbbell','bench','rack','cable','machine','pullup']}));
 const squat=strength.days[0].items.find(i=>i.exerciseId==='barbell-squat');assert.deepEqual(squat.reps,[3,6]);
 const row=strength.days[0].items.find(i=>i.exerciseId==='barbell-row');assert.deepEqual(row.reps,[12,20]);
 const plain=buildProgram('ul4',profile({equipment:['bodyweight','barbell','dumbbell','bench','rack','cable','machine','pullup']}));
 assert.deepEqual(plain.days[0].items.find(i=>i.exerciseId==='bench-press').reps,[6,10]);
});

test('Suggested workouts follow the preference',()=>{
 const state={...initialState(),profile:profile({repPreference:'lower',equipment:['bodyweight','dumbbell','bench']})};
 const w=suggestWorkout(state,{focus:'full',today:'2026-10-10'});
 assert.ok(w.items.length);
 for(const i of w.items){const e=ex(i.exerciseId);if(loadable(e))assert.ok(i.reps[1]<=12,i.exerciseId+' '+i.reps)}
});

test('Backups store the preference; old backups without it still load; bad values are refused',()=>{
 const old=initialState();delete old.profile.repPreference;delete old.profile.repPrefs;
 const loaded=validateState(old);assert.equal(loaded.profile.repPreference,'balanced');assert.deepEqual(loaded.profile.repPrefs,{});
 const good=initialState();good.profile.repPreference='higher';good.profile.repPrefs={'bench-press':'lower'};assert.doesNotThrow(()=>validateState(good));
 const bad=initialState();bad.profile.repPreference='heavy';assert.throws(()=>validateState(bad));
 const badId=initialState();badId.profile.repPrefs={'not-an-exercise':'lower'};assert.throws(()=>validateState(badId));
});

test('Rep-range research is in the bundled references',()=>{
 const ids=new Set(evidence.sources.map(s=>s.id));for(const id of REP_SOURCES)assert.ok(ids.has(id),id);
});
