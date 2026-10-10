import test from 'node:test';import assert from 'node:assert/strict';
import {project,progressFraction,runSeries,habitStreak,habitWeeks,paceCheck,parseTime,fmtTime,buildGoal,goalStatus,goalsView,goalsSummary,syncGoals,repsOf,target1rm} from '../dist/goals.js';
import {initialState,TODAY} from '../dist/store.js';
import {validateState} from '../dist/validation.js';
import {addDays} from '../dist/science.js';
const pts=(n,start,step,gap=7)=>Array.from({length:n},(_,i)=>({date:new Date(Date.parse('2026-01-01T12:00:00Z')+i*gap*864e5).toISOString().slice(0,10),value:start+step*i}));
test('project rising',()=>{const p=project(pts(7,100,2),150,'2026-02-12');assert.ok(p);assert.ok(Math.abs(p.weeklyRate-2)<1e-6);assert.ok(p.weeksSteady>0&&p.weeksSlowing>=p.weeksSteady);assert.ok(Math.abs(p.weeksSteady-19)<.1)});
test('project falling',()=>{const p=project(pts(7,90,-.5),80,'2026-02-12');assert.ok(p&&p.weeklyRate<0&&p.weeksSteady>0&&p.weeksSlowing>=p.weeksSteady)});
test('project null cases',()=>{assert.equal(project(pts(3,100,2),150,'2026-02-12'),null);assert.equal(project(pts(4,100,2,3),150,'2026-01-10'),null);assert.equal(project(pts(7,100,2),50,'2026-02-12'),null)});
test('project caps',()=>{const p=project(pts(7,100,.01),500,'2026-02-12');assert.equal(p.weeksSteady,104);assert.equal(p.far,true)});
test('progressFraction',()=>{assert.equal(progressFraction(60,80,100),.5);assert.equal(progressFraction(90,80,70),.5);assert.equal(progressFraction(null,80,100),0);assert.equal(progressFraction(100,100,100),0);assert.equal(progressFraction(60,120,100),1);assert.equal(progressFraction(60,50,100),0)});
test('runSeries Riegel',()=>{const s=runSeries({activity:'Running',distance:10},[{date:'2026-01-01',type:'Running',duration:25,distance:5},{date:'2026-01-02',type:'Running',duration:5,distance:1},{date:'2026-01-03',type:'Cycling',duration:25,distance:5}]);assert.equal(s.length,1);assert.ok(Math.abs(s[0].value-25*2**1.06)<1e-9)});
test('habit',()=>{assert.equal(habitStreak([1,3,3,4],3),3);assert.equal(habitStreak([3,3,2],3),0);const c=habitWeeks({},[{date:'2026-03-12'},{date:'2026-03-06'},{date:'2026-03-05'}],'2026-03-12',2);assert.deepEqual(c,[1,2])});
test('paceCheck',()=>{const g={type:'weight',target:70,deadline:'2026-02-12'};const p=paceCheck(g,80,{},'2026-01-12');assert.equal(p.level,'fast');assert.match(p.message,/1% of body weight/);assert.equal(paceCheck({...g,deadline:'2026-07-12'},80,{},'2026-01-12').level,'ok');assert.equal(paceCheck({type:'weight',target:80},80,{},'2026-01-12'),null)});

const KG=0.45359237,T='2026-06-15';
const mk=(units='metric')=>{const imp=units==='imperial',C={state:{...initialState(),profile:{...initialState().profile,units}},saved:0,
 displayLoad:v=>v===null||v===''?'':imp?v/KG:v,parseLoad:v=>imp?v*KG:v,displayWeight:v=>v===null||v===''?null:imp?v/KG:v,parseWeight:v=>imp?v*KG:v,displayDist:v=>imp?v/1.609344:v,parseDist:v=>imp?v*1.609344:v,
 loadUnit:()=>imp?'lb':'kg',weightUnit:()=>imp?'lb':'kg',distUnit:()=>imp?'mi':'km',sourceLinks:()=>'',async save(){C.saved++;validateState(C.state)}};return C};
const fd=o=>({get:k=>o[k]??null});
const sets=l=>[{id:'s',reps:5,load:l,duration:0,distance:0,rpe:null,rir:0,warmup:false,done:true}];
const sess=(date,l)=>({id:date,name:'t',date,exercises:[{id:'i',exerciseId:'bench-press',targetReps:5,notes:'',superset:'',sets:sets(l)}]});
const add=(C,v)=>{C.state.goals=[...C.state.goals,v];validateState(C.state);return v};

test('buildGoal records pass validateState in both unit systems and keep id/date/start on edit',()=>{for(const u of ['metric','imperial']){const C=mk(u);C.state.sessions=[sess('2026-06-01',80)];
 const lift=add(C,buildGoal(fd({type:'lift',exerciseId:'bench-press',reps:'5',liftTarget:'225',deadline:'',note:' hi '}),null,C,T));
 assert.ok(Math.abs(lift.target-(u==='imperial'?225*KG:225))<=.006);assert.ok(Math.abs(C.displayLoad(lift.target)-225)<.02);assert.equal(lift.note,'hi');assert.equal(lift.deadline,null);assert.equal(lift.achieved,null);assert.equal(lift.date,T);assert.ok(lift.start>0);
 const w=add(C,buildGoal(fd({type:'weight',weightTarget:'180'}),null,C,T));assert.equal(w.start,null);assert.ok(Math.abs(C.displayWeight(w.target)-180)<.02);
 const r=add(C,buildGoal(fd({type:'run',activity:'Running',distance:'3.1',runTarget:'25:00'}),null,C,T));assert.equal(r.target,25);assert.ok(Math.abs(C.displayDist(r.distance)-3.1)<.01);
 const h=add(C,buildGoal(fd({type:'habit',perWeek:'3'}),null,C,T));assert.equal(h.start,null);
 const e=buildGoal(fd({type:'lift',exerciseId:'bench-press',reps:'3',liftTarget:String(C.displayLoad(lift.target)),note:'x'}),lift,C,'2026-06-20');
 assert.equal(e.id,lift.id);assert.equal(e.date,lift.date);assert.equal(e.start,lift.start);assert.equal(e.reps,3);
 assert.equal(repsOf({reps:'5'}),1);assert.equal(repsOf({reps:11}),1);assert.equal(target1rm({target:100,reps:'x'}),100)}});
test('buildGoal rejects bad input with readable messages',()=>{const C=mk(),b=o=>()=>buildGoal(fd(o),null,C,T);
 assert.throws(b({type:'lift',exerciseId:'bench-press',reps:'11',liftTarget:'100'}),/Reps/);assert.throws(b({type:'lift',exerciseId:'bench-press',reps:'2.5',liftTarget:'100'}),/Reps/);
 assert.throws(b({type:'lift',exerciseId:'nope',reps:'5',liftTarget:'100'}),/exercise/);assert.throws(b({type:'lift',exerciseId:'bench-press',reps:'5',liftTarget:'0.001'}),/target load/);
 assert.throws(b({type:'run',activity:'Running',distance:'5',runTarget:'abc'}),/mm:ss/);assert.throws(b({type:'run',activity:'Running',distance:'0.01',runTarget:'25'}),/distance/);assert.throws(b({type:'run',activity:'<b>',distance:'5',runTarget:'25'}),/activity/i);
 assert.throws(b({type:'habit',perWeek:'0'}),/Workouts/);assert.throws(b({type:'weight',weightTarget:'5'}),/weight/);assert.throws(b({type:'habit',perWeek:'3',deadline:'2026-06-01'}),/today or later/);assert.throws(b({type:'x'}),/type/)});
test('editing without changes keeps imperial values stable (no round-trip drift)',()=>{const C=mk('imperial');C.state.cardio=[{id:'c',date:'2026-06-01',type:'Running',duration:25,distance:5,intensity:'moderate'}];
 const r=add(C,buildGoal(fd({type:'run',activity:'Running',distance:'5',runTarget:'25:01'}),null,C,T));assert.equal(r.target,25.02);
 const same=buildGoal(fd({type:'run',activity:'Running',distance:String(C.displayDist(r.distance)),runTarget:fmtTime(r.target)}),r,C,T);
 assert.equal(same.target,r.target);assert.equal(same.start,r.start);assert.ok(Math.abs(same.distance-r.distance)<=.01);
 const past={...r,deadline:'2026-06-01'};assert.equal(buildGoal(fd({type:'run',activity:'Running',distance:String(C.displayDist(r.distance)),runTarget:'25:01',deadline:'2026-06-01'}),past,C,T).deadline,'2026-06-01')});
test('parseTime',()=>{const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9);near(parseTime('25:00'),25);near(parseTime('25'),25);near(parseTime('24.5'),24.5);near(parseTime('24,5'),24.5);near(parseTime('1:02:30'),62.5);near(parseTime('25:30'),25.5);
 for(const bad of ['','abc','25:','1:2:3:4','25:75','-5','1:-5','::','12:xx'])assert.ok(Number.isNaN(parseTime(bad))||parseTime(bad)<=0,bad);assert.equal(fmtTime(62.5),'1:02:30')});
test('direction: lifts always rise, run times fall, weight follows its start',()=>{const C=mk(),S=C.state;S.sessions=[sess('2026-06-10',100)];
 const lift={type:'lift',exerciseId:'bench-press',reps:1,target:90,start:100,achieved:null};let st=goalStatus(lift,S,T);assert.equal(st.reached,true);assert.equal(st.fraction,1);
 S.weights=[{id:'a',date:'2026-06-14',kg:85},{id:'b',date:'2026-06-15',kg:85}];
 const loss={type:'weight',target:80,start:90,achieved:null};st=goalStatus(loss,S,T);assert.equal(st.reached,false);assert.ok(Math.abs(st.fraction-.5)<1e-9);assert.equal(goalStatus({...loss,target:85},S,T).reached,true);
 const gain={type:'weight',target:90,start:80,achieved:null};st=goalStatus(gain,S,T);assert.equal(st.reached,false);assert.ok(Math.abs(st.fraction-.5)<1e-9);assert.equal(goalStatus({...gain,target:84},S,T).reached,true);
 assert.equal(goalStatus({type:'weight',target:85,start:85,achieved:null},S,T).reached,true);
 S.cardio=[{id:'c',date:'2026-06-10',type:'Running',duration:30,distance:5}];const run={type:'run',activity:'Running',distance:5,target:25,start:30,achieved:null};st=goalStatus(run,S,T);assert.equal(st.reached,false);assert.equal(st.fraction,0);assert.equal(goalStatus({...run,target:31},S,T).reached,true);
 assert.equal(goalStatus({...loss,target:50,achieved:'2026-06-01'},S,T).reached,true,'achieved goals stay reached')});
test('weight goals created before any data use the first observation as the start',()=>{const C=mk(),S=C.state,g={type:'weight',target:80,start:null,achieved:null};assert.equal(goalStatus(g,S,T).current,null);
 S.weights=[{id:'a',date:'2026-06-10',kg:90},{id:'b',date:'2026-06-14',kg:85}];const st=goalStatus(g,S,T);assert.ok(st.fraction>0&&st.fraction<1);assert.equal(st.reached,false)});
test('syncGoals marks reached non-habit goals once, never habits, and tolerates no data',async()=>{const C=mk();assert.equal(await syncGoals(C),0);C.state.goals=[{id:'h',date:T,type:'habit',target:1,start:null,deadline:null,achieved:null,note:''}];
 assert.equal(await syncGoals(C),0);assert.equal(await syncGoals({state:{}}),0);
 C.state.sessions=[sess(TODAY(),100)];C.state.goals.push({id:'l',date:T,type:'lift',exerciseId:'bench-press',reps:1,target:90,start:80,deadline:null,achieved:null,note:''});
 assert.equal(await syncGoals(C),1);assert.equal(C.state.goals[1].achieved,TODAY());assert.equal(C.state.goals[0].achieved,null);assert.equal(await syncGoals(C),0);assert.equal(C.saved,1)});
test('goalsView and goalsSummary never print NaN/undefined/Infinity/null and escape user text',()=>{const bad=/NaN|undefined|Infinity|\bnull\b/,td=TODAY();
 for(const u of ['metric','imperial']){const C=mk(u),S=C.state,X='<img src=x onerror=1>';
  S.goals=[
  {id:'l',date:td,type:'lift',exerciseId:'bench-press',reps:5,target:100,start:null,deadline:addDays(td,60),achieved:null,note:X},
  {id:'w',date:td,type:'weight',target:75,start:null,deadline:addDays(td,60),achieved:null,note:''},
  {id:'r',date:td,type:'run',activity:'Running',distance:5,target:22,start:null,deadline:addDays(td,60),achieved:null,note:''},
  {id:'h',date:td,type:'habit',target:3,start:null,deadline:null,achieved:null,note:''},
  {id:'d',date:td,type:'lift',exerciseId:'bench-press',reps:1,target:10,start:5,deadline:null,achieved:td,note:''}];
  for(const stage of ['empty','one','rich']){
   if(stage==='one'){S.sessions=[sess(addDays(td,-1),60)];S.weights=[{id:'a',date:td,kg:80}];S.cardio=[{id:'c',date:td,type:'Running',duration:27,distance:5,intensity:'moderate'}]}
   if(stage==='rich'){S.sessions=Array.from({length:8},(_,i)=>sess(addDays(td,-49+i*7),60+i*3));S.weights=Array.from({length:30},(_,i)=>({id:'w'+i,date:addDays(td,-29+i),kg:85-i*.15}));S.cardio=Array.from({length:8},(_,i)=>({id:'c'+i,date:addDays(td,-49+i*7),type:'Running',duration:28-i*.4,distance:5,intensity:'moderate'}))}
   for(const html of [goalsView(C),goalsSummary(C)]){assert.ok(!bad.test(html),stage+u+(html.match(bad)||[''])[0]);assert.ok(!html.includes(X))}}
  assert.match(goalsView(C),/Target reached/)}});
test('too little history says so instead of projecting',()=>{const C=mk(),td=TODAY();C.state.sessions=[sess(addDays(td,-3),60),sess(addDays(td,-1),62)];
 C.state.goals=[{id:'l',date:td,type:'lift',exerciseId:'bench-press',reps:1,target:120,start:60,deadline:null,achieved:null,note:''}];const h=goalsView(C);assert.match(h,/Not enough history yet/);assert.ok(!/At your recent pace/.test(h))});
test('deadline text is direction-aware and does not over-promise',()=>{const C=mk(),td=TODAY();C.state.weights=Array.from({length:30},(_,i)=>({id:'w'+i,date:addDays(td,-29+i),kg:90-i*.2}));
 const g={id:'w',date:addDays(td,-29),type:'weight',target:80,start:90,deadline:addDays(td,300),achieved:null,note:''};C.state.goals=[g];assert.match(goalsView(C),/On track for[^<]*(at your recent pace, but not if progress slows|even if progress slows)/);
 C.state.goals=[{...g,deadline:addDays(td,14)}];{const h=goalsView(C);assert.match(h,/Behind\. You need about [^<]* a week; your recent pace is about [^<]* a week\./);assert.ok(!/realistic to keep up/.test(h),'an ok pace check is not shown next to the deadline line')}
 C.state.goals=[{...g,deadline:addDays(td,-2)}];assert.match(goalsView(C),/Deadline passed/)});
