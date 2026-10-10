import {esc,btn,empty,field,select,modal,dateLabel} from './ui.js';
import {TODAY,uid} from './store.js';

const POSE_NAME={front:'Front',side:'Side',back:'Back'},poseName=p=>POSE_NAME[p?.pose]||'Photo',filters=[['all','All'],['front','Front'],['side','Side'],['back','Back']];
const fullDate=s=>dateLabel(s,{year:'numeric',month:'short',day:'numeric'});
const byDate=(a,b)=>a.date.localeCompare(b.date);
const days=(a,b)=>Math.abs(Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/864e5));
const poseFilter=C=>C.ui.photoPose||'';
const scope=C=>{const all=[...C.state.photos].sort(byDate),p=poseFilter(C),part=p?all.filter(x=>(x.pose||'')===p):all;return part.length>=2?part:all};
const label=p=>fullDate(p.date)+' · '+poseName(p);

export function studioView(C){
  const all=C.state.photos,p=poseFilter(C),list=[...all].filter(x=>!p||(x.pose||'')===p).sort((a,b)=>byDate(b,a));
  return `<section class="card"><div class="card-head"><h2>Progress photos</h2><div class="studio-tools">${btn('Take photo','photo-camera','primary')}${btn('Upload','add-photo','','plus')}${all.length>=2?btn('Compare','photo-compare'):''}${all.length>=3?btn('Time-lapse','photo-lapse'):''}</div></div>`+
  `<div class="studio-filter" role="group" aria-label="Filter by view">${filters.map(([v,l])=>`<button type="button" class="btn small studio-chip" data-action="photo-pose:${v}" aria-pressed="${(v==='all'?'':v)===p}">${l}</button>`).join('')}</div>`+
  (list.length?`<div class="photo-grid">${list.map(x=>`<figure><img src="${esc(x.data)}" alt="${esc(x.caption||poseName(x)+' progress photo from '+x.date)}" loading="lazy"><figcaption><strong>${esc(poseName(x))} · ${esc(dateLabel(x.date))}</strong><p>${esc(x.caption||'')}</p><button class="btn small danger" data-action="delete-photo:${esc(x.id)}" aria-label="${esc('Delete '+(x.pose?poseName(x).toLowerCase()+' photo':'photo')+' from '+fullDate(x.date))}">Delete</button></figcaption></figure>`).join('')}</div>`:empty('No photos yet','Take or upload a front, side or back photo. They stay on this device.'))+
  `<details class="fine"><summary>Getting comparable photos</summary><p>Use the same place, lighting, distance (about 2 m) and time of day, with the same pose and clothing. Every 2 to 4 weeks is enough: change is slow, and daily photos mostly show lighting and water. This is practical advice, since no study has standardised physique photos. Photos do not measure body fat.</p></details></section>`;
}

export async function photoAction(a,id,C){
  if(a==='photo-pose'){C.ui.photoPose=id==='all'?'':(id||'');C.render();return true}
  if(a==='photo-camera'){camera(C);return true}
  if(a==='photo-compare'){compare(C);return true}
  if(a==='photo-lapse'){lapse(C);return true}
  return false;
}

function camera(C){
  const photos=C.state.photos,pose0=POSE_NAME[C.ui.photoPose]?C.ui.photoPose:'front';
  const body=`<div class="studio-cam"><div class="studio-stage studio-mirror"><video class="studio-video" autoplay playsinline muted aria-label="Camera preview"></video><img class="studio-ghost" alt="" hidden><img class="studio-still" alt="Captured progress photo" hidden><div class="studio-count" aria-live="assertive"></div></div>`+
  `<div class="studio-actions"><button type="button" class="btn primary" data-cam="shoot">Capture</button><button type="button" class="btn" data-cam="retake" hidden>Retake</button><button type="button" class="btn" data-cam="flip">Switch camera</button></div>`+
  `<div class="studio-controls">${select('pose','View',pose0,[['front','Front'],['side','Side'],['back','Back']])}${select('timer','Timer','0',[['0','No timer'],['3','3 s'],['5','5 s'],['10','10 s']])}${field('date','Date',TODAY(),'date','required max="'+TODAY()+'"')}</div>`+
  `<div class="field studio-ghostctl" hidden><label for="f-ghost">Ghost overlay of your last photo: <output>35%</output></label><input id="f-ghost" name="ghost" type="range" min="0" max="80" value="35"></div>`+
  `${field('caption','Caption (optional)','','text','maxlength="300"')}</div>`;
  const d=modal('Take a progress photo',body,async fd=>{
    if(!data)throw Error('Capture a photo first.');
    const date=fd.get('date');if(!date||date>TODAY())throw Error('Choose a date that is not in the future.');
    const pose=fd.get('pose');C.state.photos.push({id:uid(),date,caption:String(fd.get('caption')||'').trim(),data,pose:POSE_NAME[pose]?pose:''});
    await C.save('Photo saved locally');
  });
  const q=s=>d.querySelector(s),stage=q('.studio-stage'),video=q('.studio-video'),ghost=q('.studio-ghost'),still=q('.studio-still'),count=q('.studio-count'),ctl=q('.studio-ghostctl'),slider=q('#f-ghost'),out=q('.studio-ghostctl output'),
    shoot=q('[data-cam="shoot"]'),retake=q('[data-cam="retake"]'),flip=q('[data-cam="flip"]'),submit=q('.modal-footer button[type="submit"]');
  let stream=null,facing='user',data='',tick=null,closed=false;
  submit.textContent='Save photo';submit.disabled=true;
  const stop=()=>{stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null};
  const cancelTimer=()=>{clearInterval(tick);tick=null;count.textContent='';shoot.disabled=false};
  d.addEventListener('close',()=>{closed=true;cancelTimer();stop()},{once:true});
  const unavailable=()=>{stop();cancelTimer();stage.classList.remove('studio-mirror');stage.innerHTML='<div class="studio-nocam"><p>The camera isn’t available. Upload a photo instead.</p><button type="button" class="btn primary" data-action="add-photo">Upload a photo</button></div>';d.querySelector('.studio-cam').classList.add('studio-off');submit.disabled=true};
  const start=async()=>{
    stop();stage.classList.toggle('studio-mirror',facing==='user');
    if(!navigator.mediaDevices?.getUserMedia)return unavailable();
    try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:1280}},audio:false});if(closed||!d.contains(video)){s.getTracks().forEach(t=>t.stop());return}stop();stream=s;video.srcObject=s;video.play?.().catch(()=>{})}
    catch{if(!closed&&d.contains(video))unavailable()}
  };
  const updateGhost=()=>{
    const pose=q('[name="pose"]').value,last=photos.filter(x=>(x.pose||'')===pose).sort((a,b)=>byDate(b,a))[0];
    ctl.hidden=!last;ghost.hidden=!last||!!data;if(last)ghost.src=last.data;
    ghost.style.opacity=(slider.value/100);out.textContent=slider.value+'%';
  };
  const capture=()=>{
    if(!video.videoWidth)throw Error('The camera is not ready yet.');
    const w=video.videoWidth,h=video.videoHeight;let sw=w,sh=h;
    if(w/h>3/4)sw=h*3/4;else sh=w*4/3;
    const sx=(w-sw)/2,sy=(h-sh)/2,scale=Math.min(1,1200/Math.max(sw,sh)),c=document.createElement('canvas');
    c.width=Math.round(sw*scale);c.height=Math.round(sh*scale);
    const cx=c.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,c.width,c.height);
    if(facing==='user'){cx.translate(c.width,0);cx.scale(-1,1)}
    cx.drawImage(video,sx,sy,sw,sh,0,0,c.width,c.height);
    data=c.toDataURL('image/jpeg',.85);
    if(data.length>=6e6||!/^data:image\/jpeg;base64,/.test(data)){data='';throw Error('The photo could not be captured.')}
    still.src=data;still.hidden=false;video.hidden=true;ghost.hidden=true;shoot.hidden=true;flip.hidden=true;retake.hidden=false;submit.disabled=false;stop();
  };
  const tryCapture=()=>{try{capture()}catch(e){q('.error').textContent=e.message}};
  shoot.onclick=()=>{
    q('.error').textContent='';
    const secs=Number(q('[name="timer"]').value)||0;
    if(!secs)return tryCapture();
    let n=secs;shoot.disabled=true;count.textContent=n;
    tick=setInterval(()=>{n--;if(n>0){count.textContent=n;return}cancelTimer();tryCapture()},1000);
  };
  retake.onclick=()=>{data='';still.hidden=true;video.hidden=false;shoot.hidden=false;flip.hidden=false;retake.hidden=true;submit.disabled=true;updateGhost();start()};
  flip.onclick=()=>{cancelTimer();facing=facing==='user'?'environment':'user';start()};
  q('[name="pose"]').onchange=updateGhost;slider.oninput=updateGhost;
  updateGhost();start();
}

function compare(C){
  const list=scope(C);if(list.length<2)return;
  const opts=list.map(p=>[p.id,label(p)]);
  let mode='slider',pos=50;
  const d=modal('Compare photos',`<div class="studio-controls">${select('before','Before',list[0].id,opts)}${select('after','After',list.at(-1).id,opts)}</div><div class="studio-compare" aria-live="polite"></div><div class="studio-actions"><button type="button" class="btn" data-cmp="mode">Show side by side</button></div>`,async()=>{});
  d.querySelector('.modal-footer')?.remove();
  const box=d.querySelector('.studio-compare'),toggle=d.querySelector('[data-cmp="mode"]'),get=n=>list.find(p=>p.id===d.querySelector('[name="'+n+'"]').value)||list[0];
  const draw=()=>{
    const b=get('before'),a=get('after'),n=days(b.date,a.date),span=`<p class="studio-days">${n} ${n===1?'day':'days'} between these photos</p>`;
    box.innerHTML=mode==='slider'
      ?`<div class="studio-frame"><img class="studio-img" src="${esc(a.data)}" alt="After photo, ${esc(label(a))}"><img class="studio-img studio-top" src="${esc(b.data)}" alt="Before photo, ${esc(label(b))}" style="clip-path:inset(0 ${100-pos}% 0 0)"><span class="studio-divider" style="left:${pos}%"></span><span class="studio-tag studio-l">${esc(fullDate(b.date))}</span><span class="studio-tag studio-r">${esc(fullDate(a.date))}</span></div><input class="studio-range" type="range" min="0" max="100" value="${pos}" aria-label="Comparison position, before on the left, after on the right">${span}`
      :`<div class="studio-side"><figure><img src="${esc(b.data)}" alt="Before photo, ${esc(label(b))}"><figcaption>Before · ${esc(fullDate(b.date))}</figcaption></figure><figure><img src="${esc(a.data)}" alt="After photo, ${esc(label(a))}"><figcaption>After · ${esc(fullDate(a.date))}</figcaption></figure></div>${span}`;
    toggle.textContent=mode==='slider'?'Show side by side':'Show slider';
    const r=box.querySelector('.studio-range');
    if(r)r.oninput=()=>{pos=Number(r.value);box.querySelector('.studio-top').style.clipPath=`inset(0 ${100-pos}% 0 0)`;box.querySelector('.studio-divider').style.left=pos+'%'};
  };
  d.querySelectorAll('select').forEach(s=>s.onchange=draw);
  toggle.onclick=()=>{mode=mode==='slider'?'side':'slider';draw()};
  draw();
}

function lapse(C){
  const list=scope(C);if(!list.length)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,last=list.length-1;
  let i=0,timer=null;
  const d=modal('Time-lapse',`<div class="studio-frame"><img class="studio-img" alt=""><span class="studio-tag studio-l"></span><span class="studio-tag studio-r"></span></div><input class="studio-range" type="range" min="0" max="${last}" value="0" aria-label="Scrub through photos">`+
    `<div class="studio-actions"><button type="button" class="btn primary" data-lapse="play">Play</button>${select('speed','Speed','700',[['1200','Slow'],['700','Normal'],['350','Fast']])}</div>`,async()=>{});
  d.querySelector('.modal-footer')?.remove();
  const q=s=>d.querySelector(s),img=q('.studio-img'),tl=q('.studio-l'),tr=q('.studio-r'),range=q('.studio-range'),play=q('[data-lapse="play"]'),speed=q('[name="speed"]');
  const show=n=>{i=n;const p=list[i];img.src=p.data;img.alt=poseName(p)+' photo from '+p.date;tl.textContent=fullDate(p.date)+' · '+poseName(p);tr.textContent=(i+1)+' of '+list.length;range.value=i};
  const pause=()=>{clearInterval(timer);timer=null;play.textContent='Play'};
  const run=()=>{clearInterval(timer);play.textContent='Pause';timer=setInterval(()=>{if(!d.contains(img))return pause();show(i>=last?0:i+1)},Number(speed.value)||700)};
  d.addEventListener('close',pause,{once:true});
  play.onclick=()=>timer?pause():run();
  speed.onchange=()=>{if(timer)run()};
  range.oninput=()=>show(Number(range.value));
  show(0);if(!reduce&&list.length>1)run();
}
