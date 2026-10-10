// Progress page: graphs over time of bodyweight, weight lifted, each exercise and weekly sets per muscle.
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../dist/store.js';
import {estimateMax,sessionVolume,sessionSets,exerciseHistory,loggedExercises,bins,rangeStart,muscleSets,progressView,progressAction,timeChart} from '../dist/progress.js';
import {tourSteps} from '../dist/tour.js';

const set=(load,reps,o={})=>({id:'x',done:true,warmup:false,load,reps,rir:2,...o});
const session=(date,items)=>({id:date,name:'W',date,exercises:items.map(([exerciseId,sets])=>({id:exerciseId,exerciseId,sets}))});
const sessions=[
 session('2026-09-01',[['bench-press',[set(60,8),set(60,8),set(40,10,{warmup:true})]],['plank',[{id:'p',done:true,warmup:false,duration:60}]]]),
 session('2026-09-08',[['bench-press',[set(65,6),set(70,3,{done:false})]],['barbell-squat',[set(100,5)]]]),
];
const fakeC=(o={})=>{const state={...initialState(),sessions,weights:[{id:'a',date:'2026-09-01',kg:80},{id:'b',date:'2026-09-05',kg:79.5},{id:'c',date:'2026-09-09',kg:79}],...o};return {state,ui:{progressDays:0},loadUnit:()=>state.profile.units==='imperial'?'lb':'kg',weightUnit:()=>state.profile.units==='imperial'?'lb':'kg',displayLoad:v=>state.profile.units==='imperial'?v/0.45359237:v,displayWeight:v=>v===null?null:state.profile.units==='imperial'?v/0.45359237:v}};

test('Estimated max uses the shared Epley estimate, counting reps in reserve',()=>{
 assert.equal(estimateMax(100,1),100);
 assert.equal(estimateMax(100,10),100*(1+10/30));
 assert.equal(estimateMax(100,8,2),100*(1+10/30));
 assert.equal(estimateMax(100,12,1),null);
 assert.equal(estimateMax(0,5),null);
});

test('Weight lifted counts completed working sets only,, and hard sets skip warm-ups and unfinished sets',()=>{
 assert.equal(sessionVolume(sessions[0]),960);
 assert.equal(sessionSets(sessions[0]),3);assert.equal(sessionSets(sessions[1]),2);
 assert.equal(sessionVolume(sessions[1]),390+500);
});

test('Each exercise gets its heaviest set, best estimated max and weight lifted per workout',()=>{
 const h=exerciseHistory(sessions,'bench-press');
 assert.deepEqual(h.map(x=>x.date),['2026-09-01','2026-09-08']);
 assert.equal(h[0].top,60);assert.equal(h[1].top,65);
 assert.equal(h[1].max,65*(1+8/30));
 assert.deepEqual(loggedExercises(sessions),['bench-press','barbell-squat']);
});

test('Ranges bin by week, and by month when longer than about 14 months',()=>{
 const w=bins('2026-08-14','2026-10-10');assert.equal(w.unit,'week');assert.equal(w.list.at(-1).to,'2026-10-10');assert.equal(w.list.length,9);
 const m=bins('2024-01-15','2026-10-10');assert.equal(m.unit,'month');assert.equal(m.list[0].from,'2024-01-01');assert.equal(m.list.at(-1).from,'2026-10-01');assert.equal(m.list.at(-1).to,'2026-10-10');
 assert.equal(rangeStart(fakeC().state,0,'2026-10-10'),'2026-09-01');
 assert.equal(rangeStart(fakeC().state,28,'2026-10-10'),'2026-09-13');
});

test('Two workouts on one day make one point with the day\'s best and total',()=>{
 const h=exerciseHistory([...sessions,{...session('2026-09-08',[['bench-press',[set(72,2)]]]),id:'later'}],'bench-press');
 assert.equal(h.length,2);assert.equal(h[1].top,72);assert.equal(h[1].volume,390+144);
});

test('Weekly muscle sets count main targets in full and assisting muscles as half',()=>{
 assert.equal(muscleSets(sessions,'chest','2026-09-01','2026-09-07'),2);
 assert.ok(muscleSets(sessions,'triceps','2026-09-01','2026-09-07')>0);
});

test('The Progress page renders in both unit systems and with an empty journal',()=>{
 const metric=progressView(fakeC());
 for(const title of ['Bodyweight','Weight lifted','Workouts and sets','Each exercise','Sets per muscle'])assert.ok(metric.includes(title),title);
 assert.match(metric,/Heaviest set/);assert.match(metric,/ kg/);
 const C=fakeC();C.state.profile={...C.state.profile,units:'imperial'};
 const imperial=progressView(C);assert.match(imperial,/ lb/);assert.doesNotMatch(imperial.replace(/<[^>]+>/g,''),/\d kg/);
 const empty=progressView({...fakeC({sessions:[],weights:[]}),ui:{}});assert.match(empty,/Nothing to chart yet|No weighted sets yet/);
 const C2=fakeC();assert.ok(progressAction('progress-range','365',C2));assert.equal(C2.ui.progressDays,365);
});

test('Charts carry a readout for each date and a data table',()=>{
 const html=timeChart([{label:'Weight',kind:'line',points:[{date:'2026-09-01',value:80},{date:'2026-09-03',value:79}]}],{from:'2026-09-01',to:'2026-09-10',unit:'kg'});
 const stops=JSON.parse(html.match(/data-stops="([^"]+)"/)[1].replaceAll('&quot;','"'));
 assert.equal(stops.length,2);assert.match(stops[0].t,/Weight 80 kg/);
 assert.match(html,/<table class="data-table">/);
});

test('The welcome tour mentions the Progress page',()=>{
 assert.ok(tourSteps.some(s=>s.points.some(p=>p.startsWith('Progress:'))));
});
