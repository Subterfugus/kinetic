import test from 'node:test';
import assert from 'node:assert/strict';
import {exercises,exerciseById,equipmentLabels} from '../dist/data.js';
import {
 programs,programById,buildProgram,recommend,substitutes,lostMuscles,compensate,adaptItems,fractionalSets,contribution,
 available,loadStep,estimate1rm,bestEstimate,nextTarget,stalled,stalledLifts,programWeek,deloading,plates,regionalGaps,loadable,isCompound,emphasis,volumeTargets
} from '../dist/programs.js';

const LB=.45359237;
const FULL=Object.keys(equipmentLabels);
const full=experience=>({experience,equipment:FULL});
const set=o=>({id:'s',reps:8,load:60,duration:0,distance:0,rpe:null,rir:2,warmup:false,done:true,...o});
const session=(date,exerciseId,sets)=>({id:date+exerciseId,name:'Fixture',date,notes:'',restSeconds:120,exercises:[{id:'i'+date,exerciseId,targetReps:8,notes:'',superset:'',sets}]});
const reps=(date,exerciseId,load,list,o={})=>session(date,exerciseId,list.map((r,i)=>set({id:'s'+i,reps:r,load,...o})));
const ex=id=>exerciseById(id);
const allItems=built=>built.days.flatMap(d=>d.items);

test('Every program template references real exercises and has no duplicate exercise within a day',()=>{
 for(const p of programs){
  assert.equal(p.days.length>0,true,p.id);
  for(const d of p.days){
   const ids=d.slots.map(s=>s.exerciseId);
   for(const id of ids)assert.ok(ex(id),`${p.id}/${d.name}: unknown exercise ${id}`);
   assert.equal(new Set(ids).size,ids.length,`${p.id}/${d.name} lists an exercise twice`);
  }
 }
});

test('With full equipment every template builds unchanged, nothing uncovered, and trains the key muscles',()=>{
 const key=['chest','lats','quads','hamstrings','glutes','side-delts','biceps','triceps'];
 for(const p of programs)for(const level of ['beginner','intermediate','advanced']){
  const built=buildProgram(p.id,full(level));
  for(const d of built.days){
   assert.deepEqual(d.changes,[],`${p.id} changes`);assert.deepEqual(d.added,[],`${p.id} added`);assert.deepEqual(d.uncovered,[],`${p.id} uncovered`);
   const ids=d.items.map(i=>i.exerciseId);assert.equal(new Set(ids).size,ids.length);
  }
  for(const g of key)assert.ok((built.volume[g]||0)>=4,`${p.id}/${level}: ${g} only ${built.volume[g]}`);
 }
});

test('Limited equipment: bench press becomes a dumbbell or bodyweight horizontal chest push and everything stays available',()=>{
 const equipment=['bodyweight','dumbbell','bench'];let swaps=0;
 for(const p of programs){
  const built=buildProgram(p.id,{experience:'intermediate',equipment});
  for(const d of built.days){
   const ids=d.items.map(i=>i.exerciseId);
   assert.equal(new Set(ids).size,ids.length,`${p.id}/${d.name} duplicates`);
   for(const i of d.items)assert.ok(available(ex(i.exerciseId),equipment),`${p.id}: ${i.exerciseId} needs missing equipment`);
   for(const i of d.items.filter(i=>i.from==='bench-press')){
    swaps++;const to=ex(i.exerciseId);
    assert.equal(to.pattern,'horizontal-push');assert.ok(to.primary.includes('chest'));
    assert.ok(to.equipment.every(x=>['dumbbell','bodyweight','bench'].includes(x)));
   }
  }
 }
 assert.ok(swaps>=3,'bench press should appear in several templates');
});

test('Without a barbell, squat slots become another squat-pattern exercise, never a hinge',()=>{
 const equipment=FULL.filter(x=>x!=='barbell');let swaps=0;
 for(const p of programs){
  const built=buildProgram(p.id,{experience:'intermediate',equipment});
  for(const i of allItems(built).filter(i=>i.from==='barbell-squat')){
   swaps++;const to=ex(i.exerciseId);
   assert.equal(to.pattern,'squat');assert.notEqual(to.pattern,'hinge');assert.ok(available(to,equipment));
  }
 }
 assert.ok(swaps>=3);
});

test('Swapping bench press for a fly loses triceps; compensate extends an existing triceps exercise',()=>{
 const lost=lostMuscles('bench-press','dumbbell-fly',3);
 assert.equal(lost.triceps,1.5);assert.equal(lost.chest,undefined);assert.equal(lost['front-delts'],undefined,'fly has the same front-delt credit');
 const single=lostMuscles('bench-press','dumbbell-fly',1);assert.equal(single.triceps,.5);
 const items=[{exerciseId:'dumbbell-fly',sets:3,main:false},{exerciseId:'triceps-pushdown',sets:2,main:false}];
 const r=compensate({triceps:1.5},items,FULL);
 assert.equal(items.length,2,'no new exercise added');assert.equal(items[1].sets,4);
 assert.deepEqual(r.added,[{exerciseId:'triceps-pushdown',sets:2,covers:'triceps',extended:true}]);assert.deepEqual(r.uncovered,[]);
});

test('compensate adds an available triceps exercise when the session has none, and reports uncovered muscles',()=>{
 const equipment=['dumbbell','bench'],items=[{exerciseId:'dumbbell-fly',sets:3,main:false}];
 const r=compensate({triceps:1.5},items,equipment);
 assert.equal(items.length,2);const added=items[1];
 assert.ok(ex(added.exerciseId).primary.includes('triceps'));assert.ok(available(ex(added.exerciseId),equipment));assert.ok(added.sets>=2);
 assert.equal(r.added[0].covers,'triceps');assert.equal(r.added[0].extended,undefined);
 // A main lift is never extended.
 const main=[{exerciseId:'close-grip-push-up',sets:2,main:true}];
 compensate({triceps:1},main,['bodyweight']);assert.equal(main[0].sets,2);
});

test('Bodyweight only: pulling muscles are reported as uncovered, not silently dropped',()=>{
 const built=buildProgram('ul4',{experience:'intermediate',equipment:['bodyweight']});
 const uncovered=new Set(built.days.flatMap(d=>d.uncovered));
 assert.ok(uncovered.size>0);
 assert.ok(uncovered.has('lats')||uncovered.has('upper-back')||uncovered.has('biceps'),[...uncovered].join());
 for(const i of allItems(built))assert.ok(available(ex(i.exerciseId),['bodyweight']));
 const direct=adaptItems([{exerciseId:'barbell-row',sets:3,reps:[6,10],rir:2,rest:150,main:false}],['bodyweight']);
 assert.ok(direct.uncovered.length>0||direct.items.length>0);
 assert.ok(direct.changes.length===1);
 // Anything dropped without a substitute must be listed in changes with its missing equipment.
 for(const d of built.days)for(const c of d.changes.filter(c=>c.to===null))assert.ok(c.missing.length>0);
});

test('substitutes never return the same exercise or unavailable equipment and are sorted by score',()=>{
 const equipment=['bodyweight','dumbbell','bench','cable'];
 for(const id of ['bench-press','barbell-squat','overhead-triceps','lateral-raise','deadlift','barbell-row','pull-up']){
  const e=ex(id),list=substitutes(e,equipment);
  assert.ok(list.length>0,id);
  for(const s of list){assert.notEqual(s.exercise.id,id);assert.ok(available(s.exercise,equipment));assert.ok(s.score>0)}
  for(let i=1;i<list.length;i++)assert.ok(list[i-1].score>=list[i].score,id+' not sorted');
 }
 const ids=substitutes(ex('bench-press'),FULL,{exclude:['dumbbell-bench']}).map(s=>s.exercise.id);assert.ok(!ids.includes('dumbbell-bench'));
});

test('substitutes keep movements apart: squat never lists a deadlift, lateral raise never an overhead press',()=>{
 assert.ok(!substitutes(ex('barbell-squat'),FULL).some(s=>s.exercise.id==='deadlift'));
 assert.ok(!substitutes(ex('barbell-squat'),FULL).some(s=>s.exercise.pattern==='hinge'));
 assert.ok(!substitutes(ex('lateral-raise'),FULL).some(s=>s.exercise.id==='overhead-press'));
 assert.ok(!substitutes(ex('deadlift'),FULL).some(s=>s.exercise.pattern==='squat'));
});

test('Overhead triceps extension ranks another overhead movement above a pushdown',()=>{
 const equipment=['cable','band','bench','barbell','dumbbell'];
 const list=substitutes(ex('overhead-triceps'),equipment).map(s=>s.exercise.id);
 const overhead=list.findIndex(id=>emphasis[id]==='triceps-long-head'),pushdown=list.indexOf('triceps-pushdown');
 assert.ok(overhead>=0&&pushdown>=0);assert.ok(overhead<pushdown);
 const first=substitutes(ex('overhead-triceps'),['cable'])[0];
 assert.equal(first.exercise.id,'cable-overhead-triceps');assert.equal(first.regional,null);
 const toPushdown=substitutes(ex('overhead-triceps'),['cable']).find(s=>s.exercise.id==='triceps-pushdown');
 assert.equal(toPushdown.regional,'triceps-long-head');
});

const bench={exerciseId:'bench-press',sets:3,reps:[6,10],rir:2};

test('nextTarget: first session has no load; progress, build, repeat and reset follow double progression',()=>{
 const first=nextTarget(bench,[]);assert.equal(first.load,null);assert.equal(first.reason,'first');assert.equal(first.reps,6);
 const top=nextTarget(bench,[reps('2026-10-01','bench-press',60,[10,10,10])]);
 assert.equal(top.reason,'progress');assert.equal(top.load,62.5);assert.equal(top.reps,6);
 const mid=nextTarget(bench,[reps('2026-10-01','bench-press',60,[9,8,7])]);
 assert.equal(mid.reason,'build');assert.equal(mid.load,60);assert.equal(mid.reps,8);
 const once=nextTarget(bench,[reps('2026-10-01','bench-press',60,[6,5,5])]);
 assert.equal(once.reason,'repeat');assert.equal(once.load,60);assert.equal(once.reps,6);
 const twice=nextTarget(bench,[reps('2026-10-01','bench-press',60,[5,5,4]),reps('2026-10-04','bench-press',60,[5,4,4])]);
 assert.equal(twice.reason,'reset');assert.ok(twice.load<60&&twice.load>=50);
 const recovered=nextTarget(bench,[reps('2026-10-01','bench-press',60,[5,5,4]),reps('2026-10-04','bench-press',60,[7,6,6])]);
 assert.equal(recovered.reason,'build');
});

test('nextTarget imperial progression adds a 5 lb jump and deload halves sets at the same load',()=>{
 const load=100*LB,top=nextTarget(bench,[reps('2026-10-01','bench-press',load,[10,10,10])],{units:'imperial'});
 assert.equal(top.reason,'progress');assert.ok(Math.abs(top.load-105*LB)<1e-9);
 const d=nextTarget(bench,[reps('2026-10-01','bench-press',60,[8,8,8])],{deload:true});
 assert.equal(d.reason,'deload');assert.equal(d.sets,2);assert.equal(d.load,60);assert.ok(d.rir>=3);
 assert.equal(nextTarget({...bench,sets:5},[],{deload:true}).sets,3);
 assert.equal(nextTarget({...bench,rir:4},[],{deload:true}).rir,4);
});

test('nextTarget: bodyweight exercises never get a load and reaching the top says harder',()=>{
 const slot={exerciseId:'push-up',sets:3,reps:[8,15],rir:1};
 const build=nextTarget(slot,[session('2026-10-01','push-up',[10,11,12].map((r,i)=>set({id:'p'+i,reps:r,load:null})))]);
 assert.equal(build.load,null);assert.equal(build.reason,'build');assert.equal(build.reps,11);
 const top=nextTarget(slot,[session('2026-10-01','push-up',[15,15,16].map((r,i)=>set({id:'p'+i,reps:r,load:null})))]);
 assert.equal(top.load,null);assert.equal(top.reason,'harder');assert.equal(top.reps,15);
});

test('nextTarget: light dumbbell isolation with a big step needs top plus two reps before progressing',()=>{
 const slot={exerciseId:'lateral-raise',sets:3,reps:[12,15],rir:1};
 assert.ok(loadStep(ex('lateral-raise'))/8>.1);
 const atTop=nextTarget(slot,[reps('2026-10-01','lateral-raise',8,[15,15,15])]);
 assert.equal(atTop.reason,'build');assert.equal(atTop.load,8);
 const past=nextTarget(slot,[reps('2026-10-01','lateral-raise',8,[17,17,17])]);
 assert.equal(past.reason,'progress');assert.equal(past.load,10);assert.equal(past.reps,12);
 // A heavy load (small relative step) progresses at the plain top of the range.
 const heavy=nextTarget(slot,[reps('2026-10-01','lateral-raise',40,[15,15,15])]);
 assert.equal(heavy.reason,'progress');assert.equal(heavy.load,42);
});

test('loadStep depends on equipment, movement and unit system',()=>{
 const cable=exercises.find(e=>e.equipment.includes('cable')&&!e.equipment.includes('barbell'));
 assert.equal(loadStep(ex('barbell-squat')),5);assert.ok(Math.abs(loadStep(ex('barbell-squat'),'imperial')-10*LB)<1e-12);
 assert.equal(loadStep(ex('bench-press')),2.5);assert.ok(Math.abs(loadStep(ex('bench-press'),'imperial')-5*LB)<1e-12);
 assert.equal(loadStep(ex('dumbbell-curl')),2);assert.ok(Math.abs(loadStep(ex('dumbbell-curl'),'imperial')-5*LB)<1e-12);
 assert.equal(loadStep(cable),2.5);assert.ok(Math.abs(loadStep(cable,'imperial')-5*LB)<1e-12);
 assert.equal(loadStep(ex('deadlift')),5);
});

test('estimate1rm uses Epley with reps in reserve and rejects unreliable estimates',()=>{
 assert.ok(Math.abs(estimate1rm(100,5,0)-100*(1+5/30))<1e-9);assert.ok(Math.abs(estimate1rm(100,5,0)-116.6667)<1e-3);
 assert.ok(estimate1rm(100,5,2)>estimate1rm(100,5,0));
 assert.equal(estimate1rm(100,10,3),null);assert.ok(estimate1rm(100,10,2)>0);
 assert.equal(estimate1rm(100,1,0),100);assert.equal(estimate1rm(0,5,0),null);assert.equal(estimate1rm(100,0,0),null);
 assert.equal(bestEstimate([{load:100,reps:5,rir:0},{load:100,reps:3,rir:0},{load:50,reps:30,rir:0}]),estimate1rm(100,5,0));
 assert.equal(bestEstimate([{load:50,reps:30,rir:0}]),null);
});

test('plates computes plates per side and handles bar weight and imperial loads',()=>{
 const p=plates(100);assert.deepEqual(p.perSide,[25,15]);assert.equal(p.bar,20);assert.equal(p.remainder,0);
 assert.equal(plates(20).perSide.length,0);
 assert.equal(plates(15),null);
 const lb=plates(225*LB,'imperial');assert.deepEqual(lb.perSide,[45,45]);assert.equal(lb.bar,45);assert.equal(lb.remainder,0);
 assert.equal(plates(40*LB,'imperial'),null);
 assert.ok(plates(21).remainder>0);
});

test('recommend picks a template from days and goal, and caps beginners at four days',()=>{
 assert.equal(recommend({days:3,goal:'general',experience:'intermediate'}).id,'fb3');
 assert.equal(recommend({days:4,goal:'strength',experience:'intermediate'}).id,'str4');
 assert.equal(recommend({days:3,goal:'strength',experience:'intermediate'}).id,'str3');
 assert.equal(recommend({days:6,goal:'muscle',experience:'beginner'}).id,'ul4');
 assert.equal(recommend({days:6,goal:'muscle',experience:'advanced'}).id,'ppl6');
 assert.equal(recommend({days:2,goal:'general',experience:'beginner'}).id,'fb2');
 for(const days of [1,2,3,4,5,6,7])for(const goal of ['general','strength','muscle'])assert.ok(programById(recommend({days,goal,experience:'beginner'}).id));
});

test('programWeek and deloading track completed sessions',()=>{
 const program={templateId:'ul4',completed:0};
 assert.equal(programWeek(program),1);assert.equal(programWeek({...program,completed:3}),1);assert.equal(programWeek({...program,completed:4}),2);assert.equal(programWeek({templateId:'fb3',completed:7}),3);
 assert.equal(deloading({completed:3,deloadUntil:null}),false);assert.equal(deloading({completed:3}),false);
 assert.equal(deloading({completed:3,deloadUntil:5}),true);assert.equal(deloading({completed:5,deloadUntil:5}),false);assert.equal(deloading({completed:0,deloadUntil:0}),false);
});

test('stalled needs three flat sessions; an improvement in the last one clears it',()=>{
 const flat=['2026-10-01','2026-10-04','2026-10-07'].map(d=>reps(d,'bench-press',100,[5,5,5]));
 assert.equal(stalled(flat,'bench-press'),true);
 assert.equal(stalled(flat.slice(0,2),'bench-press'),false);
 const improved=[...flat.slice(0,2),reps('2026-10-07','bench-press',105,[5,5,5])];
 assert.equal(stalled(improved,'bench-press'),false);
 const built=buildProgram('fb3',full('intermediate'));
 assert.deepEqual(stalledLifts(built,flat),['bench-press']);assert.deepEqual(stalledLifts(built,improved),[]);
});

test('regionalGaps flags pushdown-only triceps training and clears with overhead work',()=>{
 const gaps=regionalGaps([{exerciseId:'triceps-pushdown'}]);
 assert.equal(gaps.length,1);assert.match(gaps[0],/overhead triceps/i);
 assert.deepEqual(regionalGaps([{exerciseId:'triceps-pushdown'},{exerciseId:'overhead-triceps'}]),[]);
 assert.deepEqual(regionalGaps([{exerciseId:'dumbbell-curl'}]),[]);
 assert.ok(regionalGaps([{exerciseId:'seated-calf-raise'}]).some(g=>/gastrocnemius/.test(g)));
 assert.ok(regionalGaps([{exerciseId:'lying-leg-curl'}]).some(g=>/hamstring/i.test(g)));
});

test('Beginners get fewer sets than intermediates for the same template, never fewer than the heavy main sets',()=>{
 const total=b=>allItems(b).reduce((n,i)=>n+i.sets,0);
 for(const p of programs){
  const beginner=buildProgram(p.id,full('beginner')),intermediate=buildProgram(p.id,full('intermediate'));
  assert.ok(total(beginner)<total(intermediate),p.id);
  assert.deepEqual(beginner.target,volumeTargets.beginner);assert.deepEqual(intermediate.target,volumeTargets.intermediate);
 }
 const s=buildProgram('str3',full('beginner')),t=buildProgram('str3',full('intermediate'));
 assert.deepEqual(s.days[0].items.filter(i=>i.main).map(i=>i.sets),t.days[0].items.filter(i=>i.main).map(i=>i.sets));
 assert.equal(buildProgram('nope',full('beginner')),null);
});

test('Fractional set counting credits primary muscles fully and secondary muscles by half',()=>{
 assert.deepEqual(contribution('bench-press',4),{chest:4,'front-delts':2,triceps:2});
 assert.deepEqual(contribution('plank',3),{core:3});
 assert.deepEqual(contribution('missing',3),{});
 assert.deepEqual(fractionalSets([{exerciseId:'bench-press',sets:2},{exerciseId:'triceps-pushdown',sets:2}]),{chest:2,'front-delts':1,triceps:3});
 assert.equal(isCompound(ex('bench-press')),true);assert.equal(isCompound(ex('lateral-raise')),false);
});
