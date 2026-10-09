import test from 'node:test';
import assert from 'node:assert/strict';
import {itemFor,completedSession} from '../dist/training.js';
import {performance,progression,workSets,lastSets} from '../dist/science.js';
import {validateDraft,validateState} from '../dist/validation.js';
import {initialState} from '../dist/store.js';
import {chart} from '../dist/ui.js';

const set=overrides=>({id:'set',reps:7,load:60,duration:0,distance:0,rpe:null,rir:2,warmup:false,done:true,...overrides});
const session=(date,sets,targetReps=5)=>({id:date,name:'Regression fixture',date,notes:'',restSeconds:120,exercises:[{id:'item',exerciseId:'bench-press',targetReps,notes:'',superset:'',sets}]});

test('Static holds have no phantom repetitions and require actual duration',()=>{
 const item=itemFor('plank',2,10,60);
 assert.equal(item.targetDuration,60);assert.equal(item.sets[0].reps,0);assert.equal(item.sets[0].duration,0);assert.equal(item.sets[0].load,null);
 item.sets[0].done=true;
 const draft={id:'draft',name:'Hold',date:'2026-10-08',restSeconds:120,notes:'',exercises:[item]};
 assert.throws(()=>validateDraft(draft,{requireTracking:true}));assert.equal(workSets(item).length,0);
 item.sets[0].duration=45;validateDraft(draft,{requireTracking:true});assert.equal(workSets(item).length,1);
 assert.equal(itemFor('dead-bug',2,10).sets[0].reps,10);
});

test('Missing loads and warm-up-only sessions cannot fabricate performance points',()=>{
 assert.deepEqual(performance([session('2026-10-01',[set({warmup:true})])],'bench-press'),[]);
 const h=performance([session('2026-10-01',[set({load:null})])],'bench-press');assert.equal(h[0].load,null);assert.equal(h[0].volume,null);assert.equal(h[0].e1rm,null);
 assert.equal(performance([session('2026-10-01',[set({load:0})])],'bench-press')[0].load,0);
});

test('Progression respects consistent saved targets and rejects changed targets',()=>{
 const sessions=[session('2026-10-01',[set({id:'a'}),set({id:'b'})]),session('2026-10-04',[set({id:'c'}),set({id:'d'})])];
 const p=progression(sessions,'bench-press');assert.equal(p.ready,true);assert.equal(p.target,5);assert.ok(Math.abs(p.load-61.5)<1e-8);
 sessions[1].exercises[0].targetReps=10;assert.equal(progression(sessions,'bench-press').ready,false);
});

test('Partial draft effort edits remain restorable while completed sessions stay strict',()=>{
 const state=initialState();state.draft=session('2026-10-01',[set({rpe:9,rir:0})]);validateState(state);
 assert.throws(()=>validateDraft(state.draft));state.sessions=[state.draft];state.draft=null;assert.throws(()=>validateState(state));
});

test('Inspectable weight and calorie charts expose secondary readings and completion status',()=>{
 const html=chart([{date:'2026-10-01',value:80.5}],{secondary:[{date:'2026-10-01',value:81}],unit:'kg',seriesLabel:'7-day mean'});
 assert.ok(html.includes('Raw reading'));assert.ok(html.includes('<td>81</td>'));assert.ok(html.includes('data-chart-tip'));
 const calorie=chart([{date:'2026-10-01',value:700,complete:false},{date:'2026-10-02',value:2000,complete:true}],{unit:'kcal',bars:true});
 assert.ok(calorie.includes('<td>Partial</td>'));assert.ok(calorie.includes('<td>Complete</td>'));
});

test('Correcting a historical session preserves its duration and recorded start',()=>{const draft=session('2026-10-01',[set()]);draft.startedAt=1000;draft.durationMinutes=60;draft.editingId=draft.id;const saved=completedSession(draft,120000);assert.equal(saved.durationMinutes,60);assert.equal(saved.startedAt,1000);assert.equal(saved.editingId,undefined);delete draft.editingId;assert.equal(completedSession(draft,121000).durationMinutes,2)});

test('New workout items prefill loads from the most recent working sets only',()=>{
 const sessions=[session('2026-10-01',[set({id:'a',load:50})]),session('2026-10-05',[set({id:'w',load:20,warmup:true}),set({id:'b',load:60}),set({id:'c',load:62.5})])];
 const previous=lastSets(sessions,'bench-press');assert.equal(previous.date,'2026-10-05');assert.deepEqual(previous.sets.map(s=>s.load),[60,62.5]);
 const item=itemFor('bench-press',3,8,30,previous);assert.deepEqual(item.sets.map(s=>s.load),[60,62.5,62.5]);assert.ok(item.sets.every(s=>s.reps===8&&!s.done));
 assert.equal(lastSets(sessions,'plank'),null);assert.equal(itemFor('bench-press',1,8,30,null).sets[0].load,null);
 validateDraft({id:'draft',name:'Prefilled',date:'2026-10-08',restSeconds:120,notes:'',exercises:[item]},{editing:true});
});
