// Suggested workouts: one session built from what you have trained this week, your equipment and your experience.
// Pure functions, no DOM. The rules match the program engine (see scientific-methodology.md, "Suggested workouts").
import {exercises,groups} from './data.js';
import {available,isCompound,loadable,MAJOR,volumeTargets,applyRepPreference} from './programs.js';
import {muscleStats,dayNumber} from './science.js';

export const FOCI=[
 ['auto','Best for today',null],
 ['full','Full body',MAJOR],
 ['upper','Upper body',['chest','lats','upper-back','front-delts','side-delts','rear-delts','biceps','triceps']],
 ['lower','Lower body',['quads','hamstrings','glutes','calves','core']],
 ['push','Push',['chest','front-delts','side-delts','triceps']],
 ['pull','Pull',['lats','upper-back','rear-delts','biceps']]
];
export const SUGGEST_SOURCES=['pelland2026','schoenfeld2017','schoenfeld2021','refalo2023','singer2024','ramoscampo2024','haugen2023'];
const nameOf=id=>groups.find(g=>g.id===id)?.name||id;

// Weekly fractional sets per group over the last 7 days, and the groups still recovering.
export function weekStatus(state,today){
 const stats=muscleStats(state.sessions,exercises,groups,today,7),hours=state.profile.recoveryHours||48,done={},recovering=[];
 for(const g of MAJOR){const s=stats[g];done[g]=s.primary+s.secondary*.5;if(s.last&&s.primary>0&&(dayNumber(today)-dayNumber(s.last))*24<hours)recovering.push(g)}
 return {done,recovering};
}

// How far each group is below the bottom of its weekly range. Groups trained inside the recovery window count as zero
// so the session goes elsewhere, unless the person picked a focus that needs them.
function deficits(state,today,ids,skipRecovering){
 const [lo]=volumeTargets[state.profile.experience]||volumeTargets.beginner,{done,recovering}=weekStatus(state,today);
 return Object.fromEntries(ids.map(g=>[g,skipRecovering&&recovering.includes(g)?0:Math.max(0,lo-(done[g]||0))+.01]));
}

export function suggestWorkout(state,{focus='auto',today,shuffle=0}={}){
 const p=state.profile,{done,recovering}=weekStatus(state,today),[lo,hi]=volumeTargets[p.experience]||volumeTargets.beginner;
 let chosen=FOCI.find(f=>f[0]===focus)||FOCI[0];
 if(chosen[0]==='auto'){
  // Pick the split with the most unmet weekly work per group, ignoring muscles still recovering.
  const scored=FOCI.slice(2).map(f=>{const d=deficits(state,today,f[2],true);return {f,score:Object.values(d).reduce((a,x)=>a+x,0)/f[2].length}}).sort((a,b)=>b.score-a.score);
  const everything=Object.values(done).every(x=>x<lo/2);
  chosen=everything||!scored[0].score?FOCI[1]:scored[0].f;
 }
 const [id,label,ids]=chosen,need=deficits(state,today,ids,focus==='auto'),limit=p.experience==='beginner'?5:6,maxSets=p.experience==='beginner'?3:4;
 const pool=exercises.filter(e=>e.category==='strength'&&available(e,p.equipment)&&(p.experience!=='beginner'||e.difficulty!=='advanced'));
 const remaining=new Set(ids.filter(g=>need[g]>0)),picked=[];
 while(remaining.size&&picked.length<limit){
  const ranked=pool.filter(e=>!picked.some(x=>x.id===e.id||x.pattern===e.pattern&&x.primary.join()===e.primary.join())).map(e=>({e,score:e.primary.reduce((a,g)=>a+(remaining.has(g)?need[g]+1:0),0)+e.secondary.reduce((a,g)=>a+(remaining.has(g)?.3:0),0)+(isCompound(e)?.5:0)})).filter(x=>x.score>1).sort((a,b)=>b.score-a.score||a.e.name.localeCompare(b.e.name));
  if(!ranked.length)break;
  const top=ranked.filter(x=>x.score>=ranked[0].score*.8).slice(0,3),e=top[(shuffle+picked.length)%top.length].e;
  picked.push(e);for(const g of e.primary)remaining.delete(g);
  // Every group has one exercise but the session is short: give the groups furthest behind a second one.
  if(!remaining.size&&picked.length<4&&!picked.refilled){picked.refilled=true;ids.filter(g=>need[g]>=lo/2).forEach(g=>remaining.add(g))}
 }
 const strength=p.goal==='strength',items=picked.sort((a,b)=>isCompound(b)-isCompound(a)).map(e=>{
  const compound=isCompound(e)&&e.id!=='face-pull',main=e.primary.filter(g=>ids.includes(g)),gap=Math.max(...main.map(g=>need[g]||0),0);
  const sets=Math.max(2,Math.min(maxSets,Math.round(gap/3))),reps=!loadable(e)?(compound?[8,15]:[10,20]):compound?(strength?[4,6]:[6,10]):e.id==='face-pull'?[12,20]:[10,15];
  // Strength-goal compound lifts stay heavy whatever the rep preference: heavier loads build maximal strength better.
  return applyRepPreference({exerciseId:e.id,sets,reps,rir:compound?2:1,rest:compound?150:90,main:strength&&compound&&loadable(e),why:main.map(g=>nameOf(g)+': '+fmt(done[g])+' of '+lo+'–'+hi+' weekly sets so far').join(' · ')||'Rounds out the session.'},p);
 });
 const skipped=focus==='auto'?recovering:[],tired=focus!=='auto'?recovering.filter(g=>ids.includes(g)):[];
 return {focus:id,name:label+(focus==='auto'?' · suggested':''),items,groups:ids,skipped,tired,target:[lo,hi]};
}
const fmt=x=>String(Math.round((x||0)*10)/10);
