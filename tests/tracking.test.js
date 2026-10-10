import test from 'node:test';import assert from 'node:assert/strict';
import {syncTargetWeight,weightGoal} from '../dist/goals.js';
import {studioView} from '../dist/photos.js';
import {initialState} from '../dist/store.js';
import {validateState} from '../dist/validation.js';

const T='2026-10-10';
test('a Settings target weight becomes a body-weight goal once, and Goals stays the one source',()=>{
 const s=initialState();s.profile.targetWeight=78;s.profile.goalWeightMoved=false;s.weights=[{id:'w',date:T,kg:85,note:''}];
 syncTargetWeight(s,T);assert.equal(s.goals.length,1);assert.equal(s.goals[0].type,'weight');assert.equal(s.goals[0].target,78);assert.equal(s.goals[0].start,85);validateState(structuredClone(s));
 syncTargetWeight(s,T);assert.equal(s.goals.length,1,'not duplicated');assert.equal(s.profile.goalWeightMoved,true);
 s.goals[0].target=75;syncTargetWeight(s,T);assert.equal(s.profile.targetWeight,75,'the calorie target follows the goal');
 s.goals=[];syncTargetWeight(s,T);assert.equal(s.profile.targetWeight,null,'deleting the goal clears it');syncTargetWeight(s,T);assert.equal(s.goals.length,0,'and it is not recreated');
});
test('older journals are marked for the one-time move',()=>{const old=initialState();delete old.profile.goalWeightMoved;old.profile.targetWeight=70;assert.equal(validateState(old).profile.goalWeightMoved,false);assert.equal(validateState(initialState()).profile.goalWeightMoved,true)});
test('the open body-weight goal wins over a reached one',()=>{
 const s=initialState(),g=(id,date,target,achieved=null)=>({id,date,type:'weight',target,start:90,deadline:null,achieved,note:''});
 s.goals=[g('a','2026-01-01',80,'2026-05-01')];syncTargetWeight(s,T);assert.equal(s.profile.targetWeight,80);
 s.goals.push(g('b','2026-06-01',75));assert.equal(weightGoal(s).id,'b');syncTargetWeight(s,T);assert.equal(s.profile.targetWeight,75);
});
test('the photo filter decides what Compare and Time-lapse can use',()=>{
 const p=(id,pose)=>({id,date:T,caption:'',data:'data:image/jpeg;base64,AA',pose}),C={state:{photos:[p('1','front'),p('2','front'),p('3','front'),p('4','side')]},ui:{}};
 let h=studioView(C);assert.match(h,/photo-compare/);assert.match(h,/photo-lapse/);
 C.ui.photoPose='side';h=studioView(C);assert.ok(!/photo-compare|photo-lapse/.test(h));assert.match(h,/Add one more side photo to compare, or two more side photos for a time-lapse/);
 C.ui.photoPose='back';h=studioView(C);assert.match(h,/No back photos yet/);
});
