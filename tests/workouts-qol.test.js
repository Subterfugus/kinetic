import test from 'node:test';
import assert from 'node:assert/strict';
import {completedSession,untickedEdited,needsWeight} from '../dist/training.js';
import {exercises,exerciseById,searchExercises} from '../dist/data.js';

const set=o=>({id:'s'+String(Math.random()).slice(2,10),reps:8,load:80,duration:0,distance:0,resistance:'',rpe:null,rir:null,warmup:false,done:true,...o});
const draft=sets=>({id:'d',name:'Push',date:'2026-10-09',startedAt:0,notes:'',restSeconds:120,exercises:[{id:'i',exerciseId:'bench-press',targetReps:8,notes:'',superset:'',sets,suggest:{load:85,reps:8,note:'Step up'}}]});

test('Typed but unticked sets are counted so finishing can warn about them',()=>{
 const d=draft([set(),set({done:false,edited:true}),set({done:false})]);
 assert.equal(untickedEdited(d),1,'only sets whose numbers were changed count, not untouched pre-filled ones');
});

test('Saved sessions keep no hidden step-up suggestion or editing marks',()=>{
 const saved=completedSession(draft([set({edited:true}),set({done:false,edited:true})]),60000);
 assert.equal(saved.exercises[0].suggest,undefined);
 assert.equal(saved.exercises[0].sets.length,1);
 assert.equal(saved.exercises[0].sets[0].edited,undefined);
});

test('A weighted exercise with no weight is flagged; bodyweight and timed ones are not',()=>{
 assert.ok(needsWeight(exerciseById('back-squat')??exercises.find(e=>e.equipment.includes('barbell')),{load:null}));
 assert.ok(!needsWeight(exerciseById('bench-press'),{load:60}));
 assert.ok(!needsWeight(exerciseById('push-up')??exercises.find(e=>e.equipment.join()==='bodyweight'&&e.tracking==='reps-load'),{load:null}));
 assert.ok(!needsWeight(exerciseById('plank'),{load:null}));
});

test('Exercise search forgives one typo and missing spaces',()=>{
 const top=q=>searchExercises(exercises,q)[0]?.name||'';
 assert.match(top('bensh'),/bench press/i);
 assert.match(top('benchpress'),/bench press/i);
 assert.match(top('squt'),/squat/i);
 assert.ok(searchExercises(exercises,'dumbell').every(e=>e.equipment.includes('dumbbell')||/dumbbell/i.test(e.name)));
 assert.ok(searchExercises(exercises,'dumbell').length>10);
 assert.equal(searchExercises(exercises,'xyzzy').length,0);
});
