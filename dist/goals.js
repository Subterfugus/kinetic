import {esc,btn,empty,field,select,modal,dateLabel,num,chart} from './ui.js';
import {TODAY,uid} from './store.js';
import {validDate} from './validation.js';
import {smoothWeight,regression,performance,addDays,dayNumber,within,resistanceMetricsEligible} from './science.js';
import {estimate1rm,bestEstimate} from './programs.js';
import {exercises,exerciseById} from './data.js';
const byDate=(a,b)=>a.date.localeCompare(b.date),CARDIO=['Running','Walking','Cycling','Rowing','Swimming','Hiking','Other'],WEEK=7,CAP=104,r2=v=>Math.round(v*100)/100;

export const repsOf=g=>Number.isInteger(g.reps)&&g.reps>=1&&g.reps<=10?g.reps:1;
export const target1rm=g=>estimate1rm(g.target,repsOf(g),0)??g.target;
export function liftSeries(goal,sessions){return performance(sessions,goal.exerciseId).map(p=>({date:p.date,value:bestEstimate(p.sets)})).filter(p=>p.value!==null&&Number.isFinite(p.value))}
export function runSeries(goal,cardio){const d=goal.distance;if(!(d>0))return [];return cardio.filter(c=>c.type===goal.activity&&c.duration>0&&c.distance>=d*.5&&c.distance<=d*2).sort(byDate).map(c=>({date:c.date,value:c.duration*(d/c.distance)**1.06}))}
export function habitWeeks(goal,sessions,today,weeks=8){return Array.from({length:weeks},(_,i)=>{const end=addDays(today,-WEEK*(weeks-1-i));return sessions.filter(s=>within(s.date,end,WEEK)).length})}
export function habitStreak(counts,target){let n=0;for(let i=counts.length-1;i>=0&&counts[i]>=target;i--)n++;return n}
export const enoughHistory=points=>points.length>=4&&dayNumber(points.at(-1).date)-dayNumber(points[0].date)>=21;

function logFit(points,today){const o=dayNumber(points[0].date),x=points.map(p=>Math.log(1+dayNumber(p.date)-o)),y=points.map(p=>p.value),n=x.length,mx=x.reduce((a,b)=>a+b)/n,my=y.reduce((a,b)=>a+b)/n,ss=x.reduce((a,v)=>a+(v-mx)**2,0);if(!ss)return null;const b=x.reduce((a,v,i)=>a+(v-mx)*(y[i]-my),0)/ss;return {a:my-b*mx,b,now:dayNumber(today)-o}}
export function project(points,target,today){
  const p=[...points].filter(x=>Number.isFinite(x.value)).sort(byDate);if(!enoughHistory(p))return null;
  const last=p.at(-1).value,gap=target-last;if(gap===0)return null;
  const r=regression(p.filter(x=>within(x.date,today,84)));if(!r||!r.slope||r.slope*gap<=0)return null;
  const steady=gap/r.slope/WEEK;let slow=null;const f=logFit(p,today);
  if(f&&f.b*gap>0){const d=Math.exp((target-f.a)/f.b)-1;if(Number.isFinite(d))slow=(d-f.now)/WEEK}
  if(!(slow>=steady))slow=steady*2;
  return {weeksSteady:Math.min(steady,CAP),weeksSlowing:Math.min(slow,CAP),weeklyRate:r.slope*WEEK,far:steady>=CAP||slow>=CAP}}
export function progressFraction(start,current,target){if(start===null||start===undefined||start===target||!Number.isFinite(current))return 0;return Math.max(0,Math.min(1,(current-start)/(target-start)))}

const CEILING={beginner:4,intermediate:1.5,advanced:.5},pctText=v=>v.toFixed(1).replace(/\.0$/,'')+'%';
export function paceCheck(goal,current,profile,today){
  if(!goal.deadline||!Number.isFinite(current)||goal.type==='run'||goal.type==='habit')return null;
  const weeks=(dayNumber(goal.deadline)-dayNumber(today))/WEEK;if(weeks<=0)return null;
  if(goal.type==='weight'){const gap=goal.target-current;if(!gap)return null;const pct=Math.abs(gap)/weeks/current*100,limit=gap<0?1:.5,label=pctText(pct);
    if(pct>limit)return {level:pct>limit*1.5?'fast':'ambitious',message:'That is about '+label+' of body weight a week. '+(gap<0?'Faster than about 1% of body weight a week makes it harder to keep muscle.':'Above about 0.5% a week, most of the extra is fat.')};
    return {level:'ok',message:'This deadline needs about '+label+' of body weight a week, a pace that is realistic to keep up.'}}
  const t=target1rm(goal);if(!(t>current))return null;
  const months=weeks/(365.25/12/WEEK),pct=((t/current)-1)*100/months,exp=profile?.experience in CEILING?profile.experience:'intermediate',cap=CEILING[exp],label=pctText(pct);
  if(pct>cap)return {level:pct>cap*2?'fast':'ambitious',message:'That is about '+label+' a month. As a rule of thumb, '+exp+' lifters gain up to about '+cap+'% a month, so this is ambitious.'};
  return {level:'ok',message:'This deadline needs about '+label+' a month, within the rule of thumb of about '+cap+'% for '+exp+' lifters.'}}

export function goalStatus(goal,state,today){
  const type=goal.type;let series=[],current=null,target=goal.target;
  if(type==='habit'){const counts=habitWeeks(goal,state.sessions||[],today),streak=habitStreak(counts,goal.target);return {title:type,current:counts.at(-1),target,fraction:goal.target>0?Math.min(1,counts.at(-1)/goal.target):0,series:[],counts,streak,projection:null,pace:null,reached:false}}
  if(type==='lift'){series=liftSeries(goal,state.sessions||[]).filter(p=>p.date<=today);target=target1rm(goal);current=series.at(-1)?.value??null}
  else if(type==='weight'){const w=(state.weights||[]).filter(x=>x.date<=today),recent=w.filter(x=>within(x.date,today,WEEK));series=smoothWeight(w).map(({date,value})=>({date,value}));current=recent.length?recent.reduce((a,x)=>a+x.kg,0)/recent.length:[...w].sort(byDate).at(-1)?.kg??null}
  else if(type==='run'){series=runSeries(goal,state.cardio||[]).filter(p=>p.date<=today);current=series.at(-1)?.value??null}
  // Lifts always rise and run times always fall; only body weight takes its direction from where it started.
  const start=goal.start??series[0]?.value??null,dir=type==='lift'?1:type==='run'?-1:start===null?0:Math.sign(target-start);
  const reached=!!goal.achieved||current!==null&&(dir===0?type==='weight':dir>0?current>=target:current<=target);
  const fraction=reached?1:current===null?0:start!==null&&dir*(target-start)>0?progressFraction(start,current,target):type==='lift'?Math.max(0,Math.min(1,current/target)):0;
  return {title:type,current,target,fraction,series,projection:reached||current===null?null:project(series,target,today),pace:reached?null:paceCheck(goal,current,state.profile,today),reached}}

export const parseTime=v=>{const s=String(v??'').trim().replace(',','.');if(!s)return NaN;if(!s.includes(':'))return Number(s);const p=s.split(':');if(p.length>3||p.some(x=>!x.trim()))return NaN;const q=p.map(Number);if(q.some((x,i)=>!Number.isFinite(x)||x<0||i>0&&x>=60))return NaN;return q.length===3?q[0]*60+q[1]+q[2]/60:q[0]+q[1]/60};
export function fmtTime(min){const t=Math.round(min*60),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60,p=n=>String(n).padStart(2,'0');return h?`${h}:${p(m)}:${p(s)}`:`${m}:${p(s)}`}
const weeksText=w=>w>=CAP?'more than 2 years':w<1.5?'about a week':'about '+Math.round(w)+' weeks';
function fmt(g,C,v){if(v===null||v===undefined||!Number.isFinite(v))return '—';if(g.type==='lift')return num(C.displayLoad(v),1)+' '+C.loadUnit();if(g.type==='weight')return num(C.displayWeight(v),1)+' '+C.weightUnit();if(g.type==='run')return fmtTime(v);return String(v)}
export function goalTitle(g,C){
  if(g.type==='lift')return `${exerciseById(g.exerciseId)?.name||'Lift'} · ${num(C.displayLoad(g.target),1)} ${C.loadUnit()} × ${repsOf(g)}`;
  if(g.type==='weight')return `Body weight · ${num(C.displayWeight(g.target),1)} ${C.weightUnit()}`;
  if(g.type==='run')return `${g.activity||'Running'} · ${num(C.displayDist(g.distance),2)} ${C.distUnit()} in ${fmtTime(g.target)}`;
  return `Train ${g.target} ${g.target===1?'time':'times'} a week`}
function projectionText(g,st,today){
  if(st.reached)return 'Target reached'+(g.achieved?' on '+dateLabel(g.achieved):'')+'.';
  if(st.projection)return `At your recent pace: ${weeksText(st.projection.weeksSteady)}. If progress slows, as it usually does: ${weeksText(st.projection.weeksSlowing)}.`;
  if(!enoughHistory(st.series))return 'Not enough history yet: a projection needs at least 4 data points spread over 3 weeks.';
  if(st.series.filter(p=>within(p.date,today,84)).length<3)return 'Not enough recent data to project. Log a few more entries.';
  return 'The recent trend is not moving toward this.'}
function deadlineText(g,st,C,today){
  if(!g.deadline||st.reached||st.current===null)return '';
  const weeks=(dayNumber(g.deadline)-dayNumber(today))/WEEK;if(weeks<=0)return 'Deadline passed ('+dateLabel(g.deadline)+').';
  const per=v=>g.type==='run'?fmtTime(v)+' faster each week':fmt(g,C,v)+' a week',gap=Math.abs(st.target-st.current)/weeks,p=st.projection,fits=w=>addDays(today,Math.round(w*WEEK))<=g.deadline,on='On track for '+dateLabel(g.deadline);
  if(!p)return 'Deadline '+dateLabel(g.deadline)+': you need about '+per(gap)+'.';
  // One line with both paces, so it never reads as a second, conflicting verdict.
  if(!fits(p.weeksSteady))return 'Behind. You need about '+per(gap)+'; your recent pace is about '+per(Math.abs(p.weeklyRate))+'.';
  return fits(p.weeksSlowing)?on+', even if progress slows.':on+' at your recent pace, but not if progress slows.'}

const bar=f=>`<div class="goal-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(f*100)}"><i style="width:${Math.round(f*100)}%"></i></div>`;
const ordered=goals=>[...goals].sort((a,b)=>(!!a.achieved-!!b.achieved)||a.date.localeCompare(b.date));
function card(g,C,today){
  const st=goalStatus(g,C.state,today),title=goalTitle(g,C),pct=Math.round(st.fraction*100);let body;
  if(g.type==='habit'){body=`${bar(st.fraction)}<p class="goal-line">Last 7 days: ${st.current} of ${g.target} · Streak: ${st.streak} ${st.streak===1?'week':'weeks'}</p><div class="goal-weeks" role="img" aria-label="Workouts in each of the last ${st.counts.length} weeks, oldest first: ${st.counts.join(', ')}">${st.counts.map(c=>`<span class="goal-sq ${c>=g.target?'on':c>0?'part':''}">${c}</span>`).join('')}</div>`}
  else{
    const now=st.current===null?'no data yet':(g.type==='lift'&&repsOf(g)>1?'estimated one-rep max ':'')+fmt(g,C,st.current)+' now';
    const disp=g.type==='lift'?v=>C.displayLoad(v):g.type==='weight'?v=>C.displayWeight(v):v=>v,unit=g.type==='lift'?C.loadUnit():g.type==='weight'?C.weightUnit():'min',s=st.series.map(p=>({date:p.date,value:disp(p.value)}));
    const dl=deadlineText(g,st,C,today),svg=s.length>=2?chart(s,{unit,secondary:[{date:s[0].date,value:disp(st.target)},{date:s.at(-1).date,value:disp(st.target)}],seriesLabel:'You',secondaryLabel:'Target',height:150}):'';
    body=`${bar(st.fraction)}<p class="goal-line"><strong>${pct}% of the way</strong> · ${esc(now)}</p><p class="goal-proj">${esc(projectionText(g,st,today))}</p>${dl?`<p class="goal-deadline">${esc(dl)}</p>`:''}${st.pace&&st.pace.level!=='ok'?`<p class="goal-pace ${st.pace.level}">${esc(st.pace.message)}</p>`:''}${svg?`<div class="goal-chart">${svg}</div>`:''}`}
  return `<article class="card goal-card ${g.achieved?'done':''}"><div class="goal-head"><h2>${esc(title)}</h2>${g.achieved?'<span class="goal-badge">Reached</span>':''}</div>${g.deadline&&!g.achieved?`<p class="meta">Deadline ${esc(dateLabel(g.deadline,{month:'short',day:'numeric',year:'numeric'}))}</p>`:''}${body}${g.note?`<p class="meta">${esc(g.note)}</p>`:''}<div class="goal-actions">${btn('Edit',`goal-edit:${g.id}`,'small')}${btn('Delete',`goal-delete:${g.id}`,'small ghost')}</div></article>`}

export function goalsView(C){
  const goals=ordered(C.state.goals||[]),today=TODAY();
  return `<div class="page-head"><div><h1>Goals</h1></div>${btn('Add a goal','goal-new','primary','plus')}</div>${goals.length?`<div class="goal-list">${goals.map(g=>card(g,C,today)).join('')}</div>`:empty('No goals yet','Pick a lift, a body weight, a run time or a weekly habit to work toward.','goal-new','Add a goal')}
<details class="fine"><summary>About this</summary><p>Writing a goal down and recording your progress makes it more likely you will reach it. A challenging goal paired with a weekly habit goal tends to work better than a goal that is only realistic. Projections are ranges, not promises: strength gains slow over time, and weight change slows as you approach a target. Run predictions use Riegel's formula and become unreliable beyond a half marathon. Pace warnings are rules of thumb, not limits.</p>${C.sourceLinks(['harkin2016','swann2023','steele2022','hall2011','helms2014','iraki2019','riegel1981'])}</details>`}

export function goalsSummary(C){
  const all=C.state.goals||[];if(!all.length)return '';
  const today=TODAY(),active=ordered(all).filter(g=>!g.achieved);
  return `<section class="card goal-summary"><div class="goal-summary-head"><h2>Goals</h2>${btn('Goals','go-goals','small')}</div>${active.slice(0,3).map(g=>`<div class="goal-mini"><span>${esc(goalTitle(g,C))}</span>${bar(goalStatus(g,C.state,today).fraction)}</div>`).join('')||'<p class="meta">All goals reached.</p>'}</section>`}

// Goals is the one place to set a goal weight. profile.targetWeight mirrors it for the calorie target:
// the newest open body-weight goal, else the newest reached one (so a reached goal means maintenance), else none.
// A target weight set in Settings before 1.12 becomes a body-weight goal once (profile.goalWeightMoved marks it done).
export function weightGoal(state){const w=(state.goals||[]).filter(g=>g.type==='weight'),newest=l=>[...l].sort(byDate).at(-1)||null;return newest(w.filter(g=>!g.achieved))||newest(w)}
export function syncTargetWeight(state,today){
  state.goals||=[];const p=state.profile;
  if(!p.goalWeightMoved&&!state.goals.some(g=>g.type==='weight')&&p.targetWeight>0){const g={id:uid(),date:today,type:'weight',target:r2(p.targetWeight),start:null,deadline:null,achieved:null,note:''};g.start=goalStatus(g,state,today).current;state.goals.push(g)}
  p.goalWeightMoved=true;const target=weightGoal(state)?.target??null,changed=target!==p.targetWeight;p.targetWeight=target;return changed}

// Marks goals achieved once the target is met (habit goals are never marked). Call after saves, never during render.
export async function syncGoals(C){const today=TODAY();let n=0;for(const g of C.state.goals||[]){if(g.achieved||g.type==='habit')continue;let r=false;try{r=goalStatus(g,C.state,today).reached}catch{}if(r){g.achieved=today;n++}}if(n)await C.save(n===1?'Goal reached':n+' goals reached');return n}

// Turns submitted form data into a goal record (or throws a readable Error). Edits keep id, date and start.
export function buildGoal(fd,old,C,today){
  const type=fd.get('type'),deadline=fd.get('deadline')||null,note=String(fd.get('note')||'').trim(),n=k=>Number(fd.get(k));
  if(!['lift','weight','run','habit'].includes(type))throw Error('Choose a goal type.');
  if(deadline&&!validDate(deadline))throw Error('Choose a valid deadline.');
  if(deadline&&deadline<today&&deadline!==old?.deadline)throw Error('Choose a deadline that is today or later.');
  if(note.length>300)throw Error('Keep the note under 300 characters.');
  const v={id:old?.id||uid(),date:old?.date||today,type,target:0,start:null,deadline,achieved:null,note};
  if(type==='lift'){const reps=n('reps'),t=C.parseLoad(n('liftTarget'));if(!exerciseById(fd.get('exerciseId')))throw Error('Choose an exercise.');if(!Number.isInteger(reps)||reps<1||reps>10)throw Error('Reps must be a whole number from 1 to 10.');if(!(t>=.1&&t<=1000))throw Error('Enter a target load.');Object.assign(v,{target:r2(t),exerciseId:fd.get('exerciseId'),reps})}
  else if(type==='weight'){const t=C.parseWeight(n('weightTarget'));if(!(t>=25&&t<=400))throw Error(C.weightUnit()==='lb'?'Enter a weight between 55 and 880 lb.':'Enter a weight between 25 and 400 kg.');v.target=r2(t)}
  else if(type==='run'){const raw=String(fd.get('runTarget')||'').trim(),m=old?.type==='run'&&raw===fmtTime(old.target)?old.target:parseTime(raw),d=C.parseDist(n('distance')),act=fd.get('activity');if(!CARDIO.includes(act))throw Error('Choose an activity.');if(!(d>=.1&&d<=1000))throw Error('Enter a distance of at least 0.1 km.');if(!(m>=.1&&m<=6000))throw Error('Enter a time as mm:ss or as minutes, for example 25:00.');Object.assign(v,{target:r2(m),activity:act,distance:r2(d)})}
  else{const p=n('perWeek');if(!Number.isInteger(p)||p<1||p>14)throw Error('Workouts per week must be a whole number from 1 to 14.');v.target=p}
  const same=!!old&&old.type===type&&({lift:['exerciseId'],run:['activity','distance']}[type]||[]).every(k=>old[k]===v[k]);
  v.start=same&&old.start!==undefined?old.start:type==='habit'?null:goalStatus(v,C.state,today).current;
  if(same&&old.achieved&&old.target===v.target&&old.reps===v.reps)v.achieved=old.achieved;
  return v}

function dialog(C,id='',type='lift'){
  const old=id?(C.state.goals||[]).find(x=>x.id===id):null;if(id&&!old)return;
  const g=old||{type,exerciseId:'',reps:1,target:'',deadline:'',note:'',activity:'Running',distance:5},today=TODAY();
  const lifts=exercises.filter(e=>resistanceMetricsEligible(e.id)).sort((a,b)=>a.name.localeCompare(b.name)).map(e=>[e.id,e.name]);
  const sec=(t,html)=>`<div class="wide form-grid goal-fields" data-for="${t}" ${g.type===t?'':'hidden'}>${html}</div>`,dist=g.type==='run'?C.displayDist(g.distance):C.displayDist(5);
  modal(id?'Edit goal':'Add a goal',`<div class="form-grid">${select('type','Goal type',g.type,[['lift','Lift'],['weight','Body weight'],['run','Run or other cardio time'],['habit','Weekly habit']])}
${sec('lift',select('exerciseId','Exercise',g.exerciseId||lifts[0]?.[0],lifts)+field('liftTarget','Target load ('+C.loadUnit()+')',g.type==='lift'?C.displayLoad(g.target):'','number','min="0" step="any"')+field('reps','For reps',repsOf(g),'number','min="1" max="10" step="1"'))}
${sec('weight',field('weightTarget','Target weight ('+C.weightUnit()+')',g.type==='weight'?C.displayWeight(g.target):'','number','min="1" step="any"'))}
${sec('run',select('activity','Activity',g.activity||'Running',CARDIO)+field('distance','Distance ('+C.distUnit()+')',dist,'number','min="0.1" step="any"')+field('runTarget','Target time (mm:ss or minutes)',g.type==='run'?fmtTime(g.target):'','text','placeholder="25:00" autocomplete="off"'))}
${sec('habit',field('perWeek','Workouts per week',g.type==='habit'?g.target:3,'number','min="1" max="14" step="1"'))}
<div class="wide">${field('deadline','Deadline · optional',g.deadline||'','date','min="'+(g.deadline&&g.deadline<today?g.deadline:today)+'"')}</div><div class="wide">${field('note','Note · optional',g.note||'','text','maxlength="300"')}</div></div>
<p class="meta">A challenging target plus a weekly habit goal works better than a target that is only realistic.</p>`,async fd=>{
    const v=buildGoal(fd,old,C,today);
    C.state.goals=old?C.state.goals.map(x=>x.id===id?v:x):[...(C.state.goals||[]),v];
    await C.save(old?'Goal updated':'Goal added')});
  const form=document.querySelector('#modal form'),sel=form?.querySelector('[name="type"]');
  // Hidden sections are disabled so their constraints (min/max) can never block submission.
  const show=()=>form.querySelectorAll('.goal-fields').forEach(el=>{const on=el.dataset.for===sel.value;el.hidden=!on;el.querySelectorAll('input,select').forEach(i=>{i.disabled=!on})});
  if(sel){show();sel.addEventListener('change',show)}}

export async function goalAction(a,id,C){
  if(a==='goal-new'){dialog(C,'',['lift','weight','run','habit'].includes(id)?id:'lift');return true}
  if(a==='goal-edit'){dialog(C,id);return true}
  if(a==='goal-delete'){C.confirm('Delete this goal?','Your logged workouts and weigh-ins are not affected.',async()=>{C.state.goals=C.state.goals.filter(x=>x.id!==id);await C.save('Goal deleted')});return true}
  return false}
