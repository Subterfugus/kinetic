// Effort-aware double progression and progression for saved routines.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {nextTarget,EASY} from '../dist/programs.js';

const set=(i,reps,load,rir)=>({id:'s'+i,reps,load,duration:0,distance:0,rpe:null,rir,warmup:false,done:true});
const session=(date,exerciseId,load,reps,rir=null)=>({id:date,name:'x',date,notes:'',restSeconds:120,exercises:[{id:'i'+date,exerciseId,notes:'',superset:'',sets:reps.map((r,i)=>set(i,r,load,rir))}]});
const slot={exerciseId:'dumbbell-bench',sets:3,reps:[8,12],rir:2,rest:150,main:false};

test('Plain double progression is unchanged when effort is not logged',()=>{
 assert.equal(nextTarget(slot,[session('2026-10-01','dumbbell-bench',30,[12,12,12])]).load,32);
 const t=nextTarget(slot,[session('2026-10-01','dumbbell-bench',30,[10,9,9])]);assert.equal(t.load,30);assert.equal(t.reps,10);
});

test('Sets with lots left in reserve progress faster',()=>{
 const t=nextTarget(slot,[session('2026-10-01','dumbbell-bench',30,[9,9,9],2+EASY)]);assert.equal(t.reps,11);assert.match(t.note,/reps in reserve/);
 const big=nextTarget(slot,[session('2026-10-01','dumbbell-bench',50,[12,12,12],6)]);assert.equal(big.load,54,'two steps when that is still a modest jump');
 const small=nextTarget(slot,[session('2026-10-01','dumbbell-bench',30,[12,12,12],6)]);assert.equal(small.load,32,'one step when two would be over 10%');
 const hard=nextTarget(slot,[session('2026-10-01','dumbbell-bench',50,[12,12,12],1)]);assert.equal(hard.load,52);
});

test('A short session with reps to spare is not counted toward a load reset',()=>{
 const easy=[session('2026-09-28','dumbbell-bench',30,[7,6,6],5),session('2026-10-01','dumbbell-bench',30,[7,6,6],5)];
 assert.equal(nextTarget(slot,easy).reason,'repeat');
 const hard=[session('2026-09-28','dumbbell-bench',30,[7,6,6],0),session('2026-10-01','dumbbell-bench',30,[7,6,6],0)];
 assert.equal(nextTarget(slot,hard).reason,'reset');
});

test('Saved routines step up load once every set reaches the target',()=>{
 const src=fs.readFileSync(new URL('../dist/training.js',import.meta.url),'utf8');assert.match(src,/function progressed\(C,e\)/);
 const one={exerciseId:'dumbbell-bench',sets:3,reps:[10,10],rir:2};
 assert.equal(nextTarget(one,[session('2026-10-01','dumbbell-bench',30,[10,10,10])]).load,32);
 assert.equal(nextTarget(one,[session('2026-10-01','dumbbell-bench',30,[10,9,9])]).load,30);
});

test('Step-ups are offered, not applied: a held-back item starts at last time and keeps the target as a suggestion',async()=>{
 const {holdBack,change,lastTime}=await import('../dist/steps.js');
 const sessions=[session('2026-10-01','dumbbell-bench',30,[12,12,11])];
 assert.deepEqual(lastTime(sessions,'dumbbell-bench'),{load:30,reps:11});
 assert.equal(change({load:30,reps:10},{load:30,reps:10}),null);
 const item={id:'a',exerciseId:'dumbbell-bench',targetLoad:32,targetReps:8,why:'Add load',sets:[{reps:8,load:32,done:false},{reps:8,load:32,done:false}]};
 holdBack({state:{sessions}},item);
 assert.deepEqual(item.suggest,{load:32,reps:8,note:'Add load'});
 assert.equal(item.targetLoad,30);assert.ok(item.sets.every(s=>s.load===30&&s.reps===11));
 assert.match(nextTarget({...slot,reps:[10,10]},[session('2026-10-01','dumbbell-bench',30,[10,10,10])]).note,/aim for 10\./);
});

test('A workout cut short does not trigger a load increase',()=>{
 const t=nextTarget(slot,[session('2026-10-01','dumbbell-bench',30,[12])]);assert.equal(t.load,30);assert.equal(t.reason,'build');assert.match(t.note,/1 of 3 sets/);
 assert.equal(nextTarget({...slot,sets:1},[session('2026-10-01','dumbbell-bench',30,[12])]).load,32);
});
