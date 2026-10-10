// Program engine: substitution, session rebalancing, recommended programs and load targets.
// Pure functions only (no DOM), so every rule here is covered by tests. Numbers are sourced in assets/evidence.json.
import {exercises,exerciseById,groups} from './data.js';
import {workSets,performance} from './science.js';

// A set counts 1 for a primary muscle and 0.5 for a secondary one (fractional counting, Pelland 2026).
export const INDIRECT=.5;
// Weekly fractional sets per muscle group. Hypertrophy shows a dose-response with diminishing returns.
export const volumeTargets={beginner:[6,10],intermediate:[10,16],advanced:[12,20]};
const LOADABLE=['barbell','dumbbell','kettlebell','cable','machine'];
const ACCESSORY=['isolation','elbow-flexion','elbow-extension','core','carry'];
export const available=(e,equipment)=>e.equipment.every(x=>x==='bodyweight'||equipment.includes(x));
export const loadable=e=>e.equipment.some(x=>LOADABLE.includes(x));
export const isCompound=e=>!ACCESSORY.includes(e.pattern);
// 'isolation' is a catch-all pattern, so two isolations only count as the same movement when they train the same muscle.
const movement=e=>e.pattern==='isolation'?'isolation:'+e.primary[0]:e.pattern;
// Where exercise choice changes which part of a muscle grows (regional hypertrophy). Used to rank and to flag gaps.
export const emphasis={
 'overhead-triceps':'triceps-long-head','cable-overhead-triceps':'triceps-long-head','band-overhead-triceps':'triceps-long-head',
 'incline-dumbbell-press':'upper-chest','incline-bench-press':'upper-chest','decline-push-up':'upper-chest',
 'leg-curl':'hamstrings-lengthened','romanian-deadlift':'hamstrings-lengthened','dumbbell-rdl':'hamstrings-lengthened','single-leg-rdl':'hamstrings-lengthened',
 'standing-calf-raise':'gastrocnemius','single-leg-calf-raise':'gastrocnemius','calf-press':'gastrocnemius',
 'incline-dumbbell-curl':'biceps-lengthened','leg-extension':'rectus-femoris',
 'machine-incline-press':'upper-chest','low-cable-fly':'upper-chest','incline-dumbbell-fly':'upper-chest',
 'kettlebell-rdl':'hamstrings-lengthened','good-morning':'hamstrings-lengthened','bodyweight-single-leg-rdl':'hamstrings-lengthened',
 'dumbbell-calf-raise':'gastrocnemius','standing-calf-machine':'gastrocnemius'
};
const jaccard=(a,b)=>{const u=new Set([...a,...b]);return u.size?a.filter(x=>b.includes(x)).length/u.size:0};
const rank={beginner:0,intermediate:1,advanced:2};

// Muscles worth adding work for when a swap drops them. Small assisting groups are left alone.
export const MAJOR=['chest','lats','upper-back','front-delts','side-delts','rear-delts','biceps','triceps','quads','hamstrings','glutes','calves','core'];
export function similarity(a,b,loose=false){
 const same=movement(a)===movement(b),primary=jaccard(a.primary,b.primary);
 if(a.category!==b.category||a.tracking!==b.tracking||!primary||(!same&&(loose?primary<.5:primary<=.5)))return 0;
 let score=(same?50:0)+30*primary+10*jaccard([...a.primary,...a.secondary],[...b.primary,...b.secondary]);
 if(emphasis[a.id])score+=emphasis[a.id]===emphasis[b.id]?8:-6;
 if(loadable(a)===loadable(b))score+=2;
 if(rank[b.difficulty]>rank[a.difficulty])score-=8*(rank[b.difficulty]-rank[a.difficulty]);
 return score;
}
// Fractional sets one exercise gives each muscle group.
export function contribution(exerciseId,sets){const e=exerciseById(exerciseId),out={};if(!e||e.category!=='strength')return out;for(const g of e.primary)out[g]=sets;for(const g of e.secondary)out[g]=(out[g]||0)+sets*INDIRECT;return out}
export function fractionalSets(items){const out={};for(const i of items)for(const [g,n]of Object.entries(contribution(i.exerciseId,i.sets)))out[g]=(out[g]||0)+n;return out}
// What a swap takes away: muscles that get fewer fractional sets from the replacement.
export function lostMuscles(fromId,toId,sets){const before=contribution(fromId,sets),after=toId?contribution(toId,sets):{},out={};for(const [g,n]of Object.entries(before)){const d=n-(after[g]||0);if(d>0)out[g]=d}return out}
const tierLabel=(a,b)=>movement(a)!==movement(b)?'Same muscle, different movement':jaccard(a.primary,b.primary)===1&&(!emphasis[a.id]||emphasis[a.id]===emphasis[b.id])?'Closest match':'Similar movement';

// Ranked substitutes the person can actually do with their equipment.
export function substitutes(exercise,equipment,{exclude=[]}={}){
 const pool=exercises.filter(e=>e.id!==exercise.id&&!exclude.includes(e.id)&&available(e,equipment)),score=loose=>pool.map(e=>({exercise:e,score:similarity(exercise,e,loose)})).filter(x=>x.score>0);
 // Only when nothing matches the movement do we accept a different movement that shares half the main muscles.
 let found=score(false);if(!found.length)found=score(true);
 return found.sort((a,b)=>b.score-a.score||a.exercise.name.localeCompare(b.exercise.name))
  .map(x=>({...x,tier:tierLabel(exercise,x.exercise),lost:Object.keys(lostMuscles(exercise.id,x.exercise.id,1)),regional:emphasis[exercise.id]&&emphasis[exercise.id]!==emphasis[x.exercise.id]?emphasis[exercise.id]:null}));
}
const groupName=id=>groups.find(g=>g.id===id)?.name||id;
export const namesOf=ids=>ids.map(groupName);

// Cover muscles that lost work. Prefer adding sets to an exercise already in the session; otherwise add the simplest available exercise for that muscle.
export function compensate(lost,items,equipment,profile=null){
 const added=[],uncovered=[];
 for(const [group,amount]of Object.entries(lost).sort((a,b)=>b[1]-a[1])){
  const sets=Math.min(3,Math.round(amount));if(sets<1||!MAJOR.includes(group))continue;
  const existing=items.filter(i=>exerciseById(i.exerciseId).primary.includes(group)&&!i.main).sort((a,b)=>exerciseById(a.exerciseId).primary.length-exerciseById(b.exerciseId).primary.length)[0];
  if(existing&&existing.sets<5){const n=Math.min(sets,5-existing.sets,2);existing.sets+=n;added.push({exerciseId:existing.exerciseId,sets:n,covers:group,extended:true});continue}
  const used=items.map(i=>i.exerciseId),pick=exercises.filter(e=>e.category==='strength'&&e.tracking==='reps-load'&&e.primary.includes(group)&&!used.includes(e.id)&&available(e,equipment))
   .sort((a,b)=>(rank[a.difficulty]===2)-(rank[b.difficulty]===2)||(a.primary.length+a.secondary.length)-(b.primary.length+b.secondary.length)||rank[a.difficulty]-rank[b.difficulty]||a.unilateral-b.unilateral||loadable(b)-loadable(a))[0];
  if(!pick){uncovered.push(group);continue}
  const item={exerciseId:pick.id,sets:Math.max(2,sets),reps:isCompound(pick)?[8,12]:[10,loadable(pick)?15:20],rir:isCompound(pick)?2:1,rest:isCompound(pick)?150:90,main:false,covers:group};
  const final=applyRepPreference(item,profile);items.push(final);added.push({exerciseId:pick.id,sets:final.sets,covers:group});
 }
 return {added,uncovered};
}

// Swap out everything the equipment list rules out, then rebalance so the same muscles still get trained.
export function adaptItems(source,equipment,profile=null){
 const items=[],changes=[],lost={};
 const lose=map=>{for(const [g,n]of Object.entries(map))lost[g]=(lost[g]||0)+n};
 for(const slot of source){
  const original=exerciseById(slot.exerciseId);
  if(available(original,equipment)){items.push({...slot});continue}
  const best=substitutes(original,equipment,{exclude:[...source.map(s=>s.exerciseId),...items.map(i=>i.exerciseId)]})[0];
  if(!best){lose(contribution(original.id,slot.sets));changes.push({from:original.id,to:null,missing:original.equipment.filter(x=>x!=='bodyweight'&&!equipment.includes(x))});continue}
  const to=best.exercise,reps=slot.reps&&!loadable(to)?[slot.reps[0],Math.max(slot.reps[1],20)]:slot.reps;
  items.push(applyRepPreference({...slot,exerciseId:to.id,reps,main:slot.main&&to.pattern===original.pattern&&loadable(to),from:original.id},profile));
  lose(lostMuscles(original.id,to.id,slot.sets));
  changes.push({from:original.id,to:to.id,tier:best.tier,regional:best.regional,missing:original.equipment.filter(x=>x!=='bodyweight'&&!equipment.includes(x))});
 }
 // A swap can also add work elsewhere; only compensate what the whole session is still short of.
 const before=fractionalSets(source),after=fractionalSets(items),short={};
 for(const g of Object.keys(lost)){const d=(before[g]||0)-(after[g]||0);if(d>0)short[g]=d}
 const {added,uncovered}=compensate(short,items,equipment,profile);
 return {items,changes,added,uncovered};
}

// ---------- Rep-range preference ----------
// Muscle grows about as well from heavy sets of 5–8 as from light sets of 15–30 when sets end close to failure
// (Schoenfeld 2017, Morton 2016, Lopez 2021, Currier 2023), so people may train in the range they like.
// Below about 30% of a one-rep max growth falls off (Lasevicius 2018), so the high range stops at 25–30 reps.
// Heavier loads still build maximal strength a little better, so heavy main lifts (marked !) keep their range.
export const REP_PREFS=[['balanced','Balanced · the program’s own ranges'],['lower','Lower reps · heavier weights'],['higher','Higher reps · lighter weights']];
export const REP_SOURCES=['schoenfeld2017load','morton2016','lopez2021','currier2023','lasevicius2018','schoenfeld2021','refalo2023'];
const PREFS=['balanced','lower','higher'];
// Small muscles and joints where very heavy isolation sets tend to turn into swinging: practice-based, not trial-based.
const SMALL=['side-delts','rear-delts','rotator-cuff','forearms','tibialis'];
// A setting for one exercise wins over the general one.
export function repPreference(profile,exerciseId){const own=profile?.repPrefs?.[exerciseId];return PREFS.includes(own)?own:PREFS.includes(profile?.repPreference)?profile.repPreference:'balanced'}
// Fixed ranges per kind of exercise, so applying a preference twice gives the same answer.
export function preferredReps(exercise,reps,pref,main=false){
 if(!exercise||exercise.tracking!=='reps-load'||main||(pref!=='lower'&&pref!=='higher'))return reps;
 const lower=pref==='lower',compound=isCompound(exercise)&&exercise.id!=='face-pull';
 // Bodyweight and band work can't simply be made heavier: "lower reps" means a harder variation or added load.
 if(!loadable(exercise))return exercise.pattern==='vertical-pull'?(lower?[3,6]:[8,15]):compound?(lower?[5,10]:[15,30]):(lower?[8,12]:[15,30]);
 if(compound)return lower?[5,8]:exercise.equipment.includes('barbell')&&['squat','hinge'].includes(exercise.pattern)?[10,15]:[12,20];
 return lower?(exercise.primary.some(g=>SMALL.includes(g))?[8,12]:[6,10]):[15,25];
}
// The range an exercise uses when nobody has stated a preference.
export function defaultReps(exercise){return !loadable(exercise)?[8,15]:isCompound(exercise)&&exercise.id!=='face-pull'?[8,12]:[10,15]}
// Apply the person's preference to one program or workout item. Heavier sets get a little more rest (Singer 2024).
export function applyRepPreference(item,profile){
 const e=exerciseById(item.exerciseId),pref=repPreference(profile,item.exerciseId);
 if(!e||!item.reps)return item;
 const reps=preferredReps(e,item.reps,pref,item.main);if(reps===item.reps)return item;
 const rest=pref==='lower'?Math.max(item.rest||0,isCompound(e)?180:120):item.rest;
 return {...item,reps,rest,pref};
}

// ---------- Recommended programs ----------
// Slot text: 'exercise-id SETSxLOW-HIGH'. A trailing ! marks a heavy main lift (lower reps, more rest, further from failure).
const slot=text=>{const [id,dose]=text.split(' '),main=id.endsWith('!'),exerciseId=main?id.slice(0,-1):id,[sets,range]=dose.split('x'),[lo,hi]=range.split('-').map(Number),e=exerciseById(exerciseId),compound=isCompound(e)&&exerciseId!=='face-pull';return {exerciseId,sets:Number(sets),reps:[lo,hi??lo],rir:main?3:compound?2:1,rest:main?210:compound?150:90,main}};
const day=(name,...slots)=>({name,slots:slots.map(slot)});
const UPPER_A=day('Upper A','bench-press 3x6-10','barbell-row 3x6-10','overhead-press 2x8-12','lat-pulldown 3x8-12','lateral-raise 3x12-20','overhead-triceps 2x10-15','dumbbell-curl 2x10-15');
const LOWER_A=day('Lower A','barbell-squat 3x6-10','romanian-deadlift 3x8-12','leg-extension 2x10-15','leg-curl 2x10-15','standing-calf-raise 3x10-15','cable-crunch 3x10-15');
const UPPER_B=day('Upper B','incline-dumbbell-press 3x8-12','pull-up 3x5-10','cable-row 3x8-12','dumbbell-shoulder-press 2x8-12','cable-fly 2x12-15','face-pull 2x12-20','triceps-pushdown 2x10-15','incline-dumbbell-curl 2x10-15');
const LOWER_B=day('Lower B','leg-press 3x8-12','hip-thrust 3x8-12','bulgarian-split-squat 2x8-12','leg-curl 3x10-15','seated-calf-raise 3x10-20','hanging-knee-raise 2x8-15');
const PUSH_A=day('Push A','bench-press 3x6-10','dumbbell-shoulder-press 3x8-12','incline-dumbbell-press 3x8-12','lateral-raise 3x12-20','overhead-triceps 3x10-15','triceps-pushdown 2x10-15');
const PULL_A=day('Pull A','pull-up 3x5-10','cable-row 3x8-12','lat-pulldown 2x10-15','face-pull 3x12-20','dumbbell-curl 3x10-15','hammer-curl 2x10-15');
const LEGS_A=day('Legs A','barbell-squat 3x6-10','romanian-deadlift 3x8-12','leg-press 2x10-15','leg-curl 3x10-15','standing-calf-raise 3x10-15','cable-crunch 3x10-15');
export const programs=[
 {id:'fb2',name:'Full body · 2 days',perWeek:2,goal:'general',level:'Any level',summary:'The least training that still builds muscle and strength. Each muscle is trained twice a week with about 4–6 sets.',days:[
  day('Full body A','barbell-squat 3x6-10','bench-press 3x6-10','cable-row 3x8-12','romanian-deadlift 2x8-12','lateral-raise 2x12-20','overhead-triceps 2x10-15','dumbbell-curl 2x10-15','standing-calf-raise 2x10-15'),
  day('Full body B','leg-press 3x8-12','overhead-press 3x6-10','lat-pulldown 3x8-12','incline-dumbbell-press 2x8-12','leg-curl 3x10-15','face-pull 2x12-20','standing-calf-raise 3x10-15','cable-crunch 2x10-15')]},
 {id:'fb3',name:'Full body · 3 days',perWeek:3,goal:'general',level:'Beginner to intermediate',summary:'Three different full-body sessions. The big muscle groups are trained two or three times a week.',days:[
  day('Full body A','barbell-squat 3x6-10','bench-press 3x6-10','lat-pulldown 3x8-12','leg-curl 2x10-15','lateral-raise 2x12-20','overhead-triceps 2x10-15','standing-calf-raise 2x10-15','cable-crunch 2x10-15'),
  day('Full body B','romanian-deadlift 3x8-12','overhead-press 3x6-10','cable-row 3x8-12','incline-dumbbell-press 2x8-12','leg-extension 2x10-15','dumbbell-curl 2x10-15','standing-calf-raise 3x10-15'),
  day('Full body C','leg-press 3x8-12','dumbbell-bench 3x8-12','pull-up 3x5-10','hip-thrust 2x8-12','face-pull 2x12-20','triceps-pushdown 2x10-15','incline-dumbbell-curl 2x10-15')]},
 {id:'ul4',name:'Upper / lower · 4 days',perWeek:4,goal:'muscle',level:'Intermediate',summary:'Two upper and two lower sessions. Each muscle is trained twice a week, most with 8–14 sets.',days:[UPPER_A,LOWER_A,UPPER_B,LOWER_B]},
 {id:'ulppl5',name:'Upper / lower + push / pull / legs · 5 days',perWeek:5,goal:'muscle',level:'Intermediate to advanced',summary:'Five sessions with higher weekly volume. Each muscle is still trained twice a week.',days:[UPPER_B,LOWER_A,PUSH_A,PULL_A,day('Legs','leg-press 3x8-12','hip-thrust 3x8-12','leg-extension 3x10-15','lying-leg-curl 3x10-15','seated-calf-raise 3x10-20','hanging-knee-raise 3x8-15')]},
 {id:'ppl6',name:'Push / pull / legs · 6 days',perWeek:6,goal:'muscle',level:'Advanced',summary:'The push, pull and legs rotation run twice a week. The highest volume here; only worth it if you recover well.',days:[PUSH_A,PULL_A,LEGS_A,
  day('Push B','overhead-press 3x6-10','incline-dumbbell-press 3x8-12','cable-fly 3x12-15','cable-lateral-raise 3x12-20','skull-crusher 3x8-12','triceps-pushdown 2x10-15'),
  day('Pull B','barbell-row 3x6-10','lat-pulldown 3x8-12','chest-supported-row 2x10-15','rear-delt-fly 3x12-20','incline-dumbbell-curl 3x10-15','shrug 2x10-15'),
  day('Legs B','leg-press 3x8-12','hip-thrust 3x8-12','leg-extension 3x10-15','lying-leg-curl 3x10-15','seated-calf-raise 3x10-20','hanging-knee-raise 3x8-15')]},
 {id:'str3',name:'Strength foundations · 3 days',perWeek:3,goal:'strength',level:'Beginner to intermediate',summary:'Heavy sets of 3–6 on the squat, bench press, deadlift and overhead press, alternating two sessions across three days. Accessory work is kept short on purpose.',days:[
  day('Strength A','barbell-squat! 3x3-6','bench-press! 3x3-6','barbell-row 3x6-10','leg-curl 2x10-15','face-pull 2x12-20','standing-calf-raise 2x10-15'),
  day('Strength B','deadlift! 2x3-6','overhead-press! 3x3-6','lat-pulldown 3x8-12','leg-press 2x8-12','lateral-raise 2x12-20','dumbbell-curl 2x10-15','cable-crunch 2x10-15')]},
 {id:'str4',name:'Strength · upper / lower · 4 days',perWeek:4,goal:'strength',level:'Intermediate to advanced',summary:'One heavy main lift per session, followed by moderate-rep work for the muscles that drive it.',days:[
  day('Upper · bench','bench-press! 4x3-6','barbell-row 3x6-10','overhead-press 3x6-10','pull-up 3x5-10','face-pull 2x12-20','overhead-triceps 2x10-15','dumbbell-curl 2x10-15'),
  day('Lower · squat','barbell-squat! 4x3-6','romanian-deadlift 3x6-10','leg-press 2x8-12','standing-calf-raise 3x10-15','cable-crunch 3x10-15'),
  day('Upper · press','overhead-press! 3x3-6','incline-dumbbell-press 3x8-12','cable-row 3x8-12','lat-pulldown 3x8-12','lateral-raise 3x12-20','triceps-pushdown 2x10-15','hammer-curl 2x10-15'),
  day('Lower · deadlift','deadlift! 3x3-6','bulgarian-split-squat 3x8-12','leg-curl 3x10-15','leg-extension 2x10-15','seated-calf-raise 3x10-20','hanging-knee-raise 2x8-15')]}
];
export const programById=id=>programs.find(p=>p.id===id);

// Which program fits this person. Splits perform alike when weekly volume matches, so the schedule decides.
export function recommend(profile){
 const d=profile.days,strength=profile.goal==='strength';
 let id=strength?(d<=3?'str3':'str4'):d<=2?'fb2':d===3?'fb3':d===4?'ul4':d===5?'ulppl5':'ppl6';
 let reason=strength?'Your goal is strength, so the main lifts are trained heavy.':'It fits the '+d+' day'+(d===1?'':'s')+' a week you said you can train.';
 if(profile.experience==='beginner'&&['ulppl5','ppl6'].includes(id)){id='ul4';reason='As a beginner you will grow well on four days. Extra days add little until progress slows.'}
 return {id,reason};
}

// A program as this person will actually train it: equipment swaps applied, sessions rebalanced, sets scaled to experience.
export function buildProgram(templateId,profile){
 const template=programById(templateId);if(!template)return null;
 const trim=profile.experience==='beginner';
 const days=template.days.map(d=>{
  const source=d.slots.map(s=>({...s,sets:trim&&!s.main&&s.sets>=3?s.sets-1:s.sets}));
  const adapted=adaptItems(source,profile.equipment,profile);
  return {name:d.name,...adapted,items:adapted.items.map(i=>applyRepPreference(i,profile))};
 });
 // Days repeat when a rotation is shorter than the week (A/B across three days averages to 1.5 times each).
 const share=template.perWeek/template.days.length,volume={};
 for(const d of days)for(const [g,n]of Object.entries(fractionalSets(d.items)))volume[g]=(volume[g]||0)+n*share;
 return {template,days,volume,target:volumeTargets[profile.experience]||volumeTargets.beginner};
}

// ---------- Load targets ----------
const LB=.45359237;
// Smallest sensible jump for the equipment, in kilograms. Practice-based: no trial has tested increment sizes.
export function loadStep(exercise,units='metric'){
 const lower=['squat','hinge','lunge'].includes(exercise.pattern),imperial=units==='imperial',eq=exercise.equipment;
 if(eq.includes('barbell'))return imperial?(lower?10:5)*LB:lower?5:2.5;
 if(eq.includes('kettlebell'))return 4;
 if(eq.includes('dumbbell'))return imperial?5*LB:2;
 return imperial?5*LB:2.5;
}
const roundTo=(kg,step)=>Math.round(kg/step)*step;
// Epley estimate with reps in reserve added back. Rougher than a 0 RIR set, so it is only used for targets and goals.
export function estimate1rm(load,reps,rir=0){const r=reps+(rir??0);if(!(load>0)||!(reps>=1)||r>12)return null;return r<=1?load:load*(1+r/30)}
export function bestEstimate(sets){const v=sets.map(s=>estimate1rm(s.load,s.reps,s.rir)).filter(x=>x!==null);return v.length?Math.max(...v):null}

// What to do today for one exercise, from what happened last time (double progression).
// Add reps inside the range; when every set reaches the top, add load and start again at the bottom.
// Logged reps in reserve (RIR) adjust the pace: sets that ended much further from failure than planned progress faster,
// and a short set that still had reps to spare is not treated as a failure (autoregulation: helms2018, graham2021).
export const EASY=3;
export function nextTarget(slot,sessions,{units='metric',deload=false}={}){
 const e=exerciseById(slot.exerciseId),[lo,hi]=slot.reps,history=performance(sessions,e.id).slice(-2),last=history.at(-1),base={sets:slot.sets,range:[lo,hi],rir:slot.rir,load:null,reps:lo};
 if(deload)return {...base,sets:Math.max(1,Math.ceil(slot.sets/2)),rir:Math.max(3,slot.rir),load:last?.load||null,reps:lo,reason:'deload',note:'Recovery week: half the sets at your usual load, stopping well short of failure.'};
 if(!last)return {...base,reason:'first',note:loadable(e)?'First time. Pick a load you could lift about '+(hi+slot.rir)+' times and stop at '+lo+'–'+hi+'.':'First time. Stop each set with about '+slot.rir+' reps left.'};
 const load=last.load>0?last.load:null,atLoad=last.sets.filter(s=>load===null||s.load===load),low=Math.min(...atLoad.map(s=>s.reps));
 // How many more reps than planned were left in the tank on the hardest set. Only used when every set was rated.
 const spareOf=sets=>sets.length&&sets.every(s=>Number.isFinite(s.rir))?Math.min(...sets.map(s=>s.rir))-slot.rir:0,spare=spareOf(atLoad),easy=spare>=EASY;
 const tip=easy?' Your sets ended with about '+(spare+slot.rir)+' reps in reserve; go closer to '+slot.rir+'.':'';
 if(load===null||!loadable(e)){const top=low>=hi,aim=Math.min(hi,low+(easy?2:1));return {...base,load,reps:top?hi:aim,reason:top?'harder':'build',note:top?'You reached '+hi+' reps on every set. Add a set, slow the lowering, or move to a harder variation.':'Last time your lowest set was '+low+'. Aim for '+aim+' or more.'+tip}}
 const step=loadStep(e,units),big=step/load>.1,need=hi+(big?2:0);
 if(low>=need){
  // Clearly too light: two steps instead of one, as long as that is still a modest jump.
  const jump=easy&&2*step/load<=.1?2*step:step,next=roundTo(load+jump,step);
  return {...base,load:next,reps:lo,reason:'progress',note:'You hit '+low+'+ reps on every set last time'+(jump>step?' with plenty to spare, so this is a bigger jump':'')+'. Add load and aim for '+lo+'–'+hi+'.'};
 }
 const previous=history.length>1?history[0]:null,previousSets=previous?previous.sets.filter(s=>s.load===previous.load):[];
 // Two short sessions in a row at this load, both near failure: the load is too heavy for now.
 if(low<lo&&!easy&&previous&&previous.load>=load&&Math.min(...previousSets.map(s=>s.reps))<lo&&spareOf(previousSets)<EASY){const next=Math.max(step,roundTo(load*.925,step));return {...base,load:next===load?load-step:next,reps:lo,reason:'reset',note:'Below '+lo+' reps two sessions running. Drop the load about 5–10% and build back up.'}}
 if(low<lo)return {...base,load,reps:lo,reason:'repeat',note:easy?'Last time fell short of '+lo+' reps but you had reps to spare. Keep this load and push each set closer to '+slot.rir+' in reserve.':'Last time fell short of '+lo+' reps. Repeat this load once before changing it.'};
 const aim=Math.min(need,low+(easy?2:1));
 return {...base,load,reps:Math.min(hi,aim),reason:'build',note:'Same load. Last time your lowest set was '+low+'; aim for '+aim+(big?'. The next jump is large, so reach '+need+' first':'')+'.'+tip};
}
// A lift has stalled when its best estimated max has not improved across three sessions.
export function stalled(sessions,exerciseId){const h=performance(sessions,exerciseId).slice(-3).map(p=>bestEstimate(p.sets.map(s=>({...s,rir:0}))));return h.length===3&&h.every(x=>x!==null)&&h[2]<=h[0]&&h[1]<=h[0]}
export function stalledLifts(built,sessions){return [...new Set(built.days.flatMap(d=>d.items.map(i=>i.exerciseId)))].filter(id=>loadable(exerciseById(id))&&stalled(sessions,id))}
export const programWeek=program=>Math.floor(program.completed/programById(program.templateId).perWeek)+1;
export const deloading=program=>program.deloadUntil!==null&&program.deloadUntil!==undefined&&program.completed<program.deloadUntil;

// Plates per side for a barbell load.
export function plates(kg,units='metric',bar=units==='imperial'?45:20){
 const total=units==='imperial'?kg/LB:kg,sizes=units==='imperial'?[45,35,25,10,5,2.5]:[25,20,15,10,5,2.5,1.25];
 let side=(total-bar)/2;if(side<-.01)return null;const out=[];
 for(const p of sizes)while(side>=p-.01){out.push(p);side-=p}
 return {bar,perSide:out,remainder:Math.abs(side)>.05?side*2:0};
}
// Regional gaps a week of training leaves, in plain words.
export function regionalGaps(items){
 const ids=items.map(i=>i.exerciseId),has=tag=>ids.some(id=>emphasis[id]===tag),trains=g=>ids.some(id=>exerciseById(id).primary.includes(g)),out=[];
 if(trains('triceps')&&!has('triceps-long-head'))out.push('No overhead triceps work: in one small trial the triceps grew more when trained overhead.');
 if(trains('calves')&&!has('gastrocnemius'))out.push('Calf work is seated only: in one small trial standing raises grew the gastrocnemius much more.');
 if(trains('hamstrings')&&!has('hamstrings-lengthened'))out.push('No hamstring work at long muscle length: in one small trial seated curls grew the hamstrings more than lying curls.');
 return out;
}
