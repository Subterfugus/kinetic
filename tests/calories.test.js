import test from 'node:test';
import assert from 'node:assert/strict';
import {calorieGoal,syncCalorieTarget,currentWeight} from '../dist/science.js';
import {validateState} from '../dist/validation.js';
import {initialState} from '../dist/store.js';
const journal=(profile={},extra={})=>{const s=initialState();Object.assign(s.profile,{age:30,height:180,sex:'male',weight:80,activity:1.4},profile);return Object.assign(s,extra)};
// Mifflin–St Jeor for this profile: 1780 kcal resting, 2492 maintenance at activity 1.4.

test('automatic target follows profile changes',()=>{const s=journal();assert.equal(syncCalorieTarget(s),true);assert.equal(s.profile.calorieTarget,2490);s.profile.weight=90;syncCalorieTarget(s);assert.equal(s.profile.calorieTarget,2630);s.profile.activity=1.6;syncCalorieTarget(s);assert.equal(s.profile.calorieTarget,3010)});

test('goal adjustments use capped percentages and a resting floor',()=>{const loss=calorieGoal(journal({goal:'fat-loss'}));assert.equal(loss.value,1990);assert.equal(Math.round(loss.delta),-502);const small=calorieGoal(journal({goal:'fat-loss',activity:1.2}));assert.equal(small.value,1780);assert.equal(calorieGoal(journal({goal:'muscle-growth'})).value,2740);assert.equal(calorieGoal(journal({goal:'muscle-growth',experience:'advanced'})).value,2620);assert.equal(calorieGoal(journal({goal:'recomposition'})).value,2240);const floor=calorieGoal(journal({goal:'fat-loss',measuredTdee:1900}));assert.equal(floor.value,1780);assert.match(floor.label,/resting/)});

test('reaching the target weight returns to maintenance',()=>{assert.equal(calorieGoal(journal({goal:'fat-loss',targetWeight:80})).value,2490);assert.equal(calorieGoal(journal({goal:'muscle-growth',targetWeight:75})).value,2490)});

test('a custom target is never overwritten',()=>{const s=journal({calorieMode:'manual',calorieTarget:1800});assert.equal(syncCalorieTarget(s),false);assert.equal(s.profile.calorieTarget,1800)});

test('incomplete profile keeps the current number and says what is missing',()=>{const s=journal({age:null});const g=calorieGoal(s);assert.equal(g.ready,false);assert.match(g.reason,/age/);assert.equal(syncCalorieTarget(s),false);assert.equal(s.profile.calorieTarget,2000)});

test('weight comes from the newest of the Settings weight and the weigh-in trend',()=>{const weights=[{id:'a',date:'2026-10-01',kg:82},{id:'b',date:'2026-10-03',kg:84}];assert.deepEqual(currentWeight(journal({},{weights})),{kg:83,source:'trend',date:'2026-10-03'});assert.equal(currentWeight(journal({weightDate:'2026-10-04'},{weights})).kg,80);assert.equal(currentWeight(journal({weightDate:'2026-10-02'},{weights})).kg,83)});

test('older journals keep a typed target and automate the default',()=>{const base=initialState();delete base.profile.calorieMode;delete base.profile.weightDate;Object.assign(base.profile,{age:30,height:180,sex:'male',weight:80});assert.equal(validateState(structuredClone(base)).profile.calorieMode,'auto');assert.equal(validateState({...structuredClone(base),profile:{...base.profile,calorieTarget:2492}}).profile.calorieMode,'auto');assert.equal(validateState({...structuredClone(base),profile:{...base.profile,calorieTarget:1750}}).profile.calorieMode,'manual');assert.throws(()=>validateState({...structuredClone(base),profile:{...base.profile,calorieMode:'sometimes'}}))});
