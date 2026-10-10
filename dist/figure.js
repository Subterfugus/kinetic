// Muscle figures: front and back body maps that colour muscle groups, used on Today, workouts, programs and exercises.
// The two licensed SVGs are parsed once into hidden <defs>. Each figure is two light <use> clones; colours come from
// CSS custom properties (--g-<group id>) that inherit into the clones, so a page can show many figures cheaply.
import {groups,groupById,groupForMuscle,exerciseById} from './data.js';
import {esc,num} from './ui.js';

const NS='http://www.w3.org/2000/svg',boxes={front:'0 0 587 1137',back:'0 0 587 1137'};

// Call once after the SVG and muscle-map assets load. Safe to call again.
export function buildFigureDefs(C){
 if(typeof document==='undefined'||document.querySelector('#kfig-defs'))return;
 const holder=document.createElementNS(NS,'svg'),defs=document.createElementNS(NS,'defs');
 holder.id='kfig-defs';holder.setAttribute('aria-hidden','true');holder.setAttribute('focusable','false');holder.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
 for(const view of ['front','back']){
  const svg=new DOMParser().parseFromString(C.svg[view],'image/svg+xml').documentElement,g=document.createElementNS(NS,'g'),byPath=new Map(C.anatomyMap.views[view].muscles.map(m=>[m.pathId,m.muscleId]));
  boxes[view]=svg.getAttribute('viewBox')||boxes[view];g.id='kfig-'+view;
  for(const a of ['fill','stroke','stroke-width'])if(svg.hasAttribute(a))g.setAttribute(a,svg.getAttribute(a));
  for(const el of svg.querySelectorAll('[id]')){const group=byPath.has(el.id)?groupForMuscle(byPath.get(el.id)):null;if(group){el.removeAttribute('fill');el.setAttribute('style',`fill:var(--g-${group.id},var(--fig-none))`)}el.removeAttribute('id')}
  for(const el of svg.querySelectorAll('[fill]')){const f=el.getAttribute('fill').trim().toUpperCase();if(f==='#BDBDBD'||f==='#E0E0E0'){el.removeAttribute('fill');el.setAttribute('style',`fill:var(${f==='#BDBDBD'?'--fig-base':'--fig-skin'})`)}}
  for(const child of [...svg.childNodes])g.append(document.importNode(child,true));
  defs.append(g);
 }
 holder.append(defs);document.body.prepend(holder);
}

// Fractional sets per muscle group: a set counts once for each primary group and half for each secondary group.
export function muscleLoad(items){
 const load={};
 for(const {exerciseId,sets} of items){const e=exerciseById(exerciseId);if(!e||e.category!=='strength'||!(sets>0))continue;for(const g of e.primary)load[g]=(load[g]||0)+sets;for(const g of e.secondary)load[g]=(load[g]||0)+sets*.5}
 return load;
}
export const exerciseLoad=e=>Object.fromEntries([...e.secondary.map(g=>[g,.5]),...e.primary.map(g=>[g,1])]);

// Heat: any work shows at least a light tint; the most-worked group is full accent colour.
const shade=(x,max)=>x>0?Math.round(28+72*Math.min(1,x/max)):0;
const styleFor=(load,max)=>Object.entries(load).filter(([,v])=>v>0).map(([g,v])=>`--g-${g}:color-mix(in srgb,var(--blue) ${shade(v,max)}%,var(--fig-none))`).join(';');

// The biggest groups first, for captions and screen readers.
export function topGroups(load,limit=6){return Object.entries(load).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([id,v])=>({id,name:groupById(id)?.name||id,sets:v}))}

// load: {groupId: amount}. options: caption (string), unit ('sets' | 'role'), size ('small' | 'medium' | 'large'), max (scale cap).
export function figure(load,{caption='',unit='sets',size='medium',max=null,action=''}={}){
 const top=topGroups(load,20),scale=max||Math.max(1,...top.map(t=>t.sets)),style=styleFor(load,scale);
 const describe=top.length?top.map(t=>t.name+(unit==='sets'?' '+num(t.sets,1)+' sets':t.sets>=1?' (main)':' (assists)')).join(', '):'No muscles yet';
 const svg=view=>`<svg viewBox="${boxes[view]}" aria-hidden="true" focusable="false"><use href="#kfig-${view}" style="${style}"/></svg>`;
 const body=`<div class="figs">${svg('front')}${svg('back')}</div>`;
 return `<figure class="muscle-figure ${size}"${action?'':` role="img" aria-label="${esc('Muscle map: '+describe)}"`}>${action?`<button type="button" class="figure-link" data-action="${esc(action)}" aria-label="${esc('Muscle map: '+describe+'. Open in the muscle atlas')}">${body}</button>`:body}${caption?`<figcaption>${caption}</figcaption>`:''}</figure>`;
}

// Chips naming the main groups, for under a figure.
export function groupChips(load,{limit=6,unit='sets'}={}){
 const top=topGroups(load,limit);
 return top.length?`<div class="pills figure-chips">${top.map(t=>`<button type="button" class="pill" data-action="atlas-group:${t.id}">${esc(t.name)}${unit==='sets'?' · '+num(t.sets,1):''}</button>`).join('')}</div>`:'';
}
export const allGroupIds=()=>groups.map(g=>g.id);
