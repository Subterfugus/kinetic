// Progress: long-range charts of bodyweight, weight lifted, each exercise and weekly sets per muscle.
// Charts are plain SVG drawn here; tap or drag across one to read the values for that date.
import {exercises,exerciseById,groups} from './data.js';
import {addDays,dayNumber,muscleStats,smoothWeight,regression,workSets} from './science.js';
import {TODAY} from './store.js';
import {estimate1rm} from './programs.js';
import {esc,btn,empty,select,num,metric} from './ui.js';

export const RANGES=[[28,'4 weeks'],[91,'3 months'],[182,'6 months'],[365,'1 year'],[0,'All time']];

// Estimated one-rep max: the app's shared estimate (Epley, counting reps in reserve) so it matches Goals.
export const estimateMax=(load,reps,rir)=>estimate1rm(load,reps,rir);

const loadSets=item=>exerciseById(item.exerciseId)?.tracking==='reps-load'?workSets(item).filter(s=>Number.isFinite(s.load)&&s.load>0&&s.reps>0):[];
export const sessionVolume=session=>session.exercises.reduce((a,item)=>a+loadSets(item).reduce((b,s)=>b+s.load*s.reps,0),0);
export const sessionSets=session=>session.exercises.reduce((a,item)=>a+(exerciseById(item.exerciseId)?.category==='strength'?workSets(item).length:0),0);

// First day of the selected range. "All time" starts at the earliest record (or today with no records).
export function rangeStart(state,days,end=TODAY()){
 if(days)return addDays(end,-days+1);
 const dates=[...state.sessions.map(s=>s.date),...state.weights.map(w=>w.date)].filter(d=>d<=end).sort();
 return dates[0]||end;
}

// Consecutive bins ending on `end`: weeks, or calendar months when the range is longer than about 14 months.
export function bins(start,end){
 const span=dayNumber(end)-dayNumber(start)+1;
 if(span>430){const out=[];let y=+start.slice(0,4),m=+start.slice(5,7);for(;;){const from=`${y}-${String(m).padStart(2,'0')}-01`;if(from>end)break;m++;if(m>12){m=1;y++}const next=`${y}-${String(m).padStart(2,'0')}-01`;const last=addDays(next,-1)<end?addDays(next,-1):end;out.push({from,to:last,days:dayNumber(last)-dayNumber(from)+1})}return {unit:'month',list:out}}
 const n=Math.max(1,Math.ceil(span/7));
 return {unit:'week',list:Array.from({length:n},(_,i)=>{const to=addDays(end,-7*(n-1-i));return {from:addDays(to,-6),to,days:7}})};
}

export function exerciseHistory(sessions,id){
 return sessions.filter(s=>s.exercises.some(e=>e.exerciseId===id)).sort((a,b)=>a.date.localeCompare(b.date)).flatMap(s=>{
  const sets=s.exercises.filter(e=>e.exerciseId===id).flatMap(loadSets);if(!sets.length)return [];
  const estimates=sets.map(x=>estimateMax(x.load,x.reps,x.rir)).filter(x=>x!==null);
  return [{date:s.date,top:Math.max(...sets.map(x=>x.load)),max:estimates.length?Math.max(...estimates):null,volume:sets.reduce((a,x)=>a+x.load*x.reps,0),sets:sets.length}];
 }).reduce((days,x)=>{const d=days.at(-1);if(d?.date!==x.date)days.push(x);else Object.assign(d,{top:Math.max(d.top,x.top),max:d.max===null?x.max:x.max===null?d.max:Math.max(d.max,x.max),volume:d.volume+x.volume,sets:d.sets+x.sets});return days},[]);
}

// Strength exercises with weighted sets in the journal, most-logged first.
export function loggedExercises(sessions){
 const count={};for(const s of sessions)for(const item of s.exercises)if(loadSets(item).length)count[item.exerciseId]=(count[item.exerciseId]||0)+1;
 return Object.keys(count).filter(id=>exerciseById(id)).sort((a,b)=>count[b]-count[a]||exerciseById(a).name.localeCompare(exerciseById(b).name));
}

// Weekly hard sets for a muscle: a full set when it is a main target, half a set when it only assists.
export function muscleSets(sessions,id,from,to){const s=muscleStats(sessions,exercises,groups,to,dayNumber(to)-dayNumber(from)+1)[id];return s?s.primary+s.secondary/2:0}

const compact=v=>Math.abs(v)>=10000?num(v/1000,1)+'k':num(v,Math.abs(v)<10?1:0);
function niceTicks(lo,hi,count=4){
 if(lo===hi){lo-=1;hi+=1}
 const raw=(hi-lo)/count,mag=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(x=>x*mag).find(x=>x>=raw);
 const first=Math.floor(lo/step)*step,ticks=[];for(let v=first;v<=hi+step*.001;v+=step)ticks.push(+v.toFixed(6));
 if(ticks.at(-1)<hi)ticks.push(+(ticks.at(-1)+step).toFixed(6));return ticks;
}
const shortDate=(d,long)=>new Date(d+'T12:00:00Z').toLocaleDateString(undefined,long?{month:'short',year:'2-digit',timeZone:'UTC'}:{month:'short',day:'numeric',timeZone:'UTC'});
const fullDate=d=>new Date(d+'T12:00:00Z').toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});

let chartCount=0;
// series: [{label, kind:'line'|'dots'|'bar', cls, points:[{date,value,to?}], digits}]
export function timeChart(series,{from,to,unit='',zero=false,band=null,height=null,title='Progress'}={}){
 const live=series.filter(s=>s.points.some(p=>Number.isFinite(p.value)));
 if(!live.length)return empty('Nothing to chart yet','Log a few entries in this period and they will appear here.');
 const narrow=typeof window!=='undefined'&&window.innerWidth<600,w=narrow?360:640,h=height||(narrow?240:250),p={l:narrow?44:54,r:12,t:14,b:30};
 const values=live.flatMap(s=>s.points.map(x=>x.value)).filter(Number.isFinite);if(band)values.push(...band.range);
 let lo=Math.min(...values),hi=Math.max(...values);if(zero||live.some(s=>s.kind==='bar'))lo=0;else{const pad=(hi-lo||Math.abs(hi)*.05||1)*.12;lo-=pad;hi+=pad}
 const ticks=niceTicks(lo,hi,narrow?3:4);lo=ticks[0];hi=ticks.at(-1);
 const x0=dayNumber(from),x1=Math.max(dayNumber(to)+1,x0+1),xx=d=>p.l+(dayNumber(d)-x0)/(x1-x0)*(w-p.l-p.r),yy=v=>h-p.b-(v-lo)/(hi-lo||1)*(h-p.t-p.b);
 const mid=d=>xx(d)+(w-p.l-p.r)/(x1-x0)/2,id='pchart-'+(++chartCount);
 const long=x1-x0>200,tickCount=narrow?3:5,xticks=Array.from({length:tickCount},(_,i)=>addDays(from,Math.round((x1-x0-1)*i/(tickCount-1))));
 let out=ticks.map(v=>`<path class="gridline" d="M${p.l} ${yy(v)}H${w-p.r}"/><text x="${p.l-6}" y="${yy(v)+4}" text-anchor="end">${compact(v)}</text>`).join('');
 out+=xticks.map((d,i)=>`<text x="${mid(d)}" y="${h-8}" text-anchor="${i===0?'start':i===tickCount-1?'end':'middle'}">${esc(shortDate(d,long))}</text>`).join('');
 if(band)out+=`<rect class="band" x="${p.l}" y="${yy(band.range[1])}" width="${w-p.l-p.r}" height="${Math.max(0,yy(band.range[0])-yy(band.range[1]))}"/>`;
 const bars=live.filter(s=>s.kind==='bar');
 bars.forEach((s,k)=>{for(const x of s.points){if(!Number.isFinite(x.value))continue;const left=xx(x.date),right=xx(addDays(x.to||x.date,1)),slot=(right-left)/bars.length,bw=Math.max(1.5,slot*.72);out+=`<rect class="bar ${s.cls||''}" x="${left+slot*k+(slot-bw)/2}" y="${yy(x.value)}" width="${bw}" height="${Math.max(0,yy(0)-yy(x.value))}"/>`}});
 for(const s of live.filter(s=>s.kind!=='bar')){
  const pts=s.points.filter(x=>Number.isFinite(x.value));
  if(s.kind==='line'&&pts.length>1)out+=`<path class="line ${s.cls||''}" d="${pts.map((x,i)=>(i?'L':'M')+mid(x.date).toFixed(1)+','+yy(x.value).toFixed(1)).join('')}"/>`;
  if(s.kind==='dots'||pts.length<40||pts.length===1)out+=pts.map(x=>`<circle class="dot ${s.cls||''}" cx="${mid(x.date).toFixed(1)}" cy="${yy(x.value).toFixed(1)}" r="${s.kind==='dots'?2.6:3.2}"/>`).join('');
 }
 // One readout stop per date that has a value, used for tap, drag and arrow keys.
 const dates=[...new Set(live.flatMap(s=>s.points.filter(x=>Number.isFinite(x.value)).map(x=>x.date)))].sort();
 const stops=dates.map(d=>{const parts=live.map(s=>{const pt=s.points.find(x=>x.date===d);return pt&&Number.isFinite(pt.value)?s.label+' '+num(pt.value,s.digits??1)+(unit?' '+unit:''):null}).filter(Boolean),pt=live.flatMap(s=>s.points).find(x=>x.date===d&&x.to);return {x:+(bars.length?xx(d)+(xx(addDays(pt?.to||d,1))-xx(d))/2:mid(d)).toFixed(1),t:(pt?.to?'Week of '+shortDate(d)+' to '+shortDate(pt.to):fullDate(d))+' · '+parts.join(' · ')}});
 const legend=live.length>1||band?`<div class="chart-legend">${live.map(s=>`<span><i class="swatch ${s.cls||''} ${s.kind}"></i>${esc(s.label)}</span>`).join('')}${band?`<span><i class="swatch band"></i>${esc(band.label)}</span>`:''}</div>`:'';
 const rows=dates.map(d=>`<tr><td>${d}</td>${live.map(s=>`<td>${num(s.points.find(x=>x.date===d)?.value,s.digits??1)}</td>`).join('')}</tr>`).join('');
 return `<div class="chart-block pchart">${legend}<svg id="${id}" viewBox="0 0 ${w} ${h}" style="aspect-ratio:${w}/${h}" class="chart progress-chart" role="img" tabindex="0" aria-label="${esc(title)} from ${esc(fullDate(from))} to ${esc(fullDate(to))}. Use the arrow keys to read values, or open the data table." data-stops="${esc(JSON.stringify(stops))}" data-y="${p.t} ${h-p.b}">${out}<line class="cursor" visibility="hidden" x1="0" x2="0" y1="${p.t}" y2="${h-p.b}"/></svg><div class="chart-readout" aria-live="polite">${narrow?'Tap or drag across the chart to read values.':'Point at the chart to read values.'}</div><details class="chart-details"><summary>Data table</summary><div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th>${live.map(s=>`<th>${esc(s.label)}${unit?' · '+esc(unit):''}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></details></div>`;
}

if(typeof document!=='undefined'){
 const show=(svg,i)=>{const stops=JSON.parse(svg.dataset.stops||'[]');if(!stops.length)return;i=Math.max(0,Math.min(stops.length-1,i));svg.dataset.at=i;const c=svg.querySelector('.cursor');c.removeAttribute('visibility');c.setAttribute('x1',stops[i].x);c.setAttribute('x2',stops[i].x);const r=svg.closest('.chart-block').querySelector('.chart-readout');r.textContent=stops[i].t;r.classList.add('active')};
 const near=(svg,e)=>{const stops=JSON.parse(svg.dataset.stops||'[]'),box=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal,x=(e.clientX-box.left)/box.width*vb.width;let best=0;stops.forEach((s,i)=>{if(Math.abs(s.x-x)<Math.abs(stops[best].x-x))best=i});show(svg,best)};
 const pointer=e=>{const svg=e.target.closest?.('.progress-chart');if(svg)near(svg,e)};
 document.addEventListener('pointermove',pointer);document.addEventListener('pointerdown',pointer);
 document.addEventListener('keydown',e=>{const svg=e.target.closest?.('.progress-chart');if(!svg||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=JSON.parse(svg.dataset.stops||'[]').length,at=svg.dataset.at===undefined?n:+svg.dataset.at;show(svg,e.key==='Home'?0:e.key==='End'?n-1:at+(e.key==='ArrowLeft'?-1:1))});
}

const change=(now,before,digits=0)=>before?((now-before>=0?'+':'')+num((now-before)/before*100,digits)+'% vs the previous period'):'';
const sum=(arr,f)=>arr.reduce((a,x)=>a+f(x),0);

export function progressView(C){
 const {state}=C,end=TODAY(),days=C.ui.progressDays??91,from=rangeStart(state,days,end),inRange=d=>d>=from&&d<=end;
 const sessions=state.sessions.filter(s=>inRange(s.date)),span=dayNumber(end)-dayNumber(from)+1,prevFrom=addDays(from,-span),previous=days?state.sessions.filter(s=>s.date>=prevFrom&&s.date<from):[];
 const {unit:binUnit,list}=bins(from,end),per=binUnit==='week'?'per week':'per month',L=C.loadUnit(),W=C.weightUnit(),lift=v=>C.displayLoad(v);
 const volume=sum(sessions,sessionVolume),sets=sum(sessions,sessionSets);
 // Bodyweight: every weigh-in plus a 7-day average, and a straight-line rate across the range.
 const weights=[...state.weights].filter(w=>inRange(w.date)).sort((a,b)=>a.date.localeCompare(b.date)),smooth=smoothWeight(state.weights.filter(w=>w.date<=end)).filter(x=>inRange(x.date));
 const rate=weights.length>=5&&dayNumber(weights.at(-1).date)-dayNumber(weights[0].date)>=14?regression(weights.map(w=>({date:w.date,value:w.kg}))):null;
 const weightChange=smooth.length>1?smooth.at(-1).value-smooth[0].value:null;
 // Exercises
 const logged=loggedExercises(state.sessions),exId=logged.includes(C.ui.progressExercise)?C.ui.progressExercise:logged[0],history=exId?exerciseHistory(sessions,exId):[];
 const best=history.length?{top:Math.max(...history.map(x=>x.top)),max:Math.max(...history.map(x=>x.max??0))}:null,firstMax=history.find(x=>x.max!==null)?.max,lastMax=[...history].reverse().find(x=>x.max!==null)?.max;
 // Muscles
 const muscle=groups.some(g=>g.id===C.ui.progressMuscle)?C.ui.progressMuscle:'chest',beginner=state.profile.experience==='beginner',band={range:beginner?[6,10]:[10,16],label:beginner?'6–10 sets, a common beginner range':'10–16 sets, a common range for trained lifters'};
 const weekly=binUnit==='week'?list:bins(addDays(end,-363),end).list;
 return `<div class="page-head"><div><h1>Progress</h1><p class="meta">Your training and body over time.</p></div><div class="button-group" role="group" aria-label="Time range">${RANGES.map(([n,label])=>btn(label,'progress-range:'+n,'small '+(days===n?'primary':''))).join('')}</div></div>
<div class="metrics">${metric('Workouts',sessions.length,'',days?(sessions.length-previous.length>=0?'+':'')+(sessions.length-previous.length)+' vs the previous period':num(sessions.length/Math.max(1,span/7),1)+' a week on average','training')}${metric('Weight lifted',num(lift(volume)),L,days?change(volume,sum(previous,sessionVolume)):'every weighted set added up','insights')}${metric('Hard sets',num(sets),'',days?change(sets,sum(previous,sessionSets)):'warm-ups not counted','plan')}${metric('Bodyweight change',weightChange===null?'—':(weightChange>=0?'+':'')+num(C.displayWeight(weightChange),1),weightChange===null?'':W,weightChange===null?'Log weigh-ins to see this':'7-day average, start to end of range','body')}</div>
<section class="card"><div class="card-head"><h2>Bodyweight</h2>${rate?`<span class="badge">${(rate.slope>=0?'+':'')+num(C.displayWeight(rate.slope*7),2)} ${W} a week</span>`:''}</div>${timeChart([{label:'Weigh-in',kind:'dots',cls:'raw',points:weights.map(w=>({date:w.date,value:C.displayWeight(w.kg)}))},{label:'7-day average',kind:'line',points:smooth.map(x=>({date:x.date,value:C.displayWeight(x.value)}))}],{from,to:end,unit:W,title:'Bodyweight'})}<details class="fine"><summary>About this</summary><p>Daily weight swings with water, salt and food in the gut, so the 7-day average shows the real direction better than any single weigh-in. The weekly rate is a straight line through every weigh-in in the range and needs at least 5 weigh-ins over 2 weeks.</p></details></section>
<section class="card subsection"><h2>Weight lifted</h2><p class="meta">Load × reps for every completed working set, added up ${per}.</p>${timeChart([{label:'Weight lifted',kind:'bar',digits:0,points:list.map(b=>({date:b.from,to:b.to,value:lift(sum(sessions.filter(s=>s.date>=b.from&&s.date<=b.to),sessionVolume))}))}],{from:list[0].from,to:end,unit:L,title:'Weight lifted '+per})}<details class="fine"><summary>About this</summary><p>Total weight lifted is a rough measure of how much work you did. It favours high-rep sets and leg exercises, and bodyweight moves without added weight count as zero, so compare it with itself over time rather than between programs.</p></details></section>
<section class="card subsection"><h2>Workouts and sets</h2><p class="meta">Workouts ${per}.</p>${timeChart([{label:'Workouts',kind:'bar',cls:'alt',digits:0,points:list.map(b=>({date:b.from,to:b.to,value:sessions.filter(s=>s.date>=b.from&&s.date<=b.to).length}))}],{from:list[0].from,to:end,height:170,title:'Workouts '+per})}<h3 class="subsection">Hard sets ${per}</h3>${timeChart([{label:'Hard sets',kind:'bar',digits:0,points:list.map(b=>({date:b.from,to:b.to,value:sum(sessions.filter(s=>s.date>=b.from&&s.date<=b.to),sessionSets)}))}],{from:list[0].from,to:end,height:170,title:'Hard sets '+per})}</section>
<section class="card subsection"><div class="card-head"><h2>Each exercise</h2></div>${logged.length?`${select('progress-exercise','Exercise',exId,logged.map(id=>[id,exerciseById(id).name]))}<div class="row-stats"><div><small>Heaviest set</small><strong>${best?num(lift(best.top),1)+' '+L:'—'}</strong></div><div><small>Best estimated max</small><strong>${best?.max?num(lift(best.max),1)+' '+L:'—'}</strong></div><div><small>Estimated max change</small><strong>${firstMax&&lastMax&&history.length>1?(lastMax>=firstMax?'+':'')+num(lift(lastMax-firstMax),1)+' '+L:'—'}</strong></div><div><small>Workouts</small><strong>${history.length}</strong></div></div>${timeChart([{label:'Heaviest set',kind:'line',points:history.map(x=>({date:x.date,value:lift(x.top)}))},{label:'Estimated 1-rep max',kind:'line',cls:'alt',points:history.map(x=>({date:x.date,value:x.max===null?null:lift(x.max)}))}],{from,to:end,unit:L,title:exerciseById(exId).name})}<h3 class="subsection">Weight lifted each day</h3>${timeChart([{label:'Weight lifted',kind:'line',digits:0,points:history.map(x=>({date:x.date,value:lift(x.volume)}))}],{from,to:end,unit:L,zero:true,height:180,title:exerciseById(exId).name+' weight lifted'})}<details class="fine"><summary>About this</summary><p>The estimated 1-rep max uses the Epley formula, weight × (1 + reps ÷ 30), on your best set, counting the reps you said you had left in the tank. Sets with more than 12 reps (including those left) are not used. It is an estimate for spotting a trend, not a tested max, and it reads high or low for some people and exercises.</p>${C.sourceLinks?C.sourceLinks(['acsm2026']):''}</details>`:empty('No weighted sets yet','Finish a workout with weights and each exercise gets its own chart here.')}</section>
<section class="card subsection"><div class="card-head"><h2>Sets per muscle</h2>${binUnit==='week'?'':'<span class="badge">Last 52 weeks</span>'}</div>${select('progress-muscle','Muscle group',muscle,groups.map(g=>[g.id,g.name]))}${timeChart([{label:'Weekly sets',kind:'bar',points:weekly.map(b=>({date:b.from,to:b.to,value:muscleSets(state.sessions,muscle,b.from<from?from:b.from,b.to)}))}],{from:weekly[0].from,to:end,band,title:'Weekly sets for '+(groups.find(g=>g.id===muscle)?.name||muscle)})}<details class="fine"><summary>About this</summary><p>Hard sets each week. A set counts in full for the muscles an exercise mainly trains and as half for muscles that only assist. The shaded band is a common starting range for your experience level, not a target you must hit. ${C.sourceLinks?C.sourceLinks(['pelland2026','schoenfeld2017']):''}</p></details></section>`;
}

export function progressAction(a,id,C){if(a==='progress-range'){C.ui.progressDays=Number(id);return true}return false}
