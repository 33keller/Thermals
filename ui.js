/* Thermal Scout UI v2: long-press pin picker, snapping bottom sheet, FABs, modern styling, faster dots. Load LAST. */
(function(){
const css=`:root{--bg:#0f1214;--card:#181c20;--card2:#1f2429;--line:rgba(255,255,255,.08);--tx:#eceae4;--mut:#9a988f;--acc:#ff7a1a}
body{-webkit-tap-highlight-color:transparent}
#sheet{background:var(--bg);border-top:none;border-radius:22px 22px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.45);padding:0 14px calc(env(safe-area-inset-bottom) + 12px);max-height:none;overscroll-behavior:contain}
#grab{position:sticky;top:0;z-index:2;display:block;width:calc(100% + 28px);margin:0 -14px 4px;height:28px;padding:0;border:0;border-radius:22px 22px 0 0;background:var(--bg);touch-action:none}
#grab::after{content:"";display:block;width:42px;height:5px;border-radius:3px;background:rgba(255,255,255,.3);margin:11px auto 0}
button,.chip,select,input[type=date],input[type=number],input[type=text],input[type=tel],input[type=time]{background:var(--card2);border:1px solid var(--line);border-radius:12px;color:var(--tx);font-weight:500;transition:transform .08s,background .15s}
button:active{transform:scale(.95)}
#play{background:var(--acc);border-color:transparent;color:#111;font-weight:700}
.chip.on{background:var(--acc);color:#111;border-color:transparent}
.pill{border-radius:999px;padding:7px 12px;font-size:13px;font-weight:600;background:rgba(15,18,20,.85);border:1px solid var(--line);box-shadow:0 4px 14px rgba(0,0,0,.35)}
#badge.r{background:#c0392b;border-color:transparent}#badge.f{background:#1f6fc5;border-color:transparent}#badge.n{background:#5b5d60;border-color:transparent}
details{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:2px 14px;margin:10px 0}
summary{list-style:none;display:flex;justify-content:space-between;align-items:center}
summary::-webkit-details-marker{display:none}
summary::after{content:"›";font-size:22px;color:var(--mut);transition:transform .2s}
details[open] summary::after{transform:rotate(90deg)}
.cell{background:var(--card2);border-radius:12px}.grid{gap:8px}
#alert{font-size:14px;color:var(--tx)}#alert.bad{color:#ff8a80}
input[type=range]{accent-color:var(--acc)}
#time{-webkit-appearance:none;appearance:none;height:10px;border-radius:999px;outline:none;background:#333}
#time::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:3px solid var(--acc);box-shadow:0 2px 8px rgba(0,0,0,.5)}
#time::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--acc)}
#fab{position:absolute;right:12px;z-index:1001;display:flex;flex-direction:column;gap:10px;transition:bottom .28s cubic-bezier(.2,.8,.2,1),opacity .2s}
#fab button{width:48px;height:48px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:rgba(24,28,32,.94);box-shadow:0 6px 18px rgba(0,0,0,.45);font-size:12px;font-weight:700}
#fab svg{width:22px;height:22px;fill:none;stroke:#eceae4;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#toast{position:absolute;left:50%;top:calc(env(safe-area-inset-top) + 14px);transform:translate(-50%,-20px);opacity:0;z-index:4000;background:#eceae4;color:#111;font-weight:600;font-size:14px;padding:10px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:all .25s;pointer-events:none;max-width:86vw;text-align:center}
#toast.on{opacity:1;transform:translate(-50%,0)}
.pk{position:fixed;inset:0;z-index:3500;background:rgba(0,0,0,.35);display:flex;align-items:flex-end;opacity:0;transition:opacity .2s}
.pk.on{opacity:1}
.pk-card{width:100%;background:var(--bg);border-radius:22px 22px 0 0;padding:18px 14px calc(env(safe-area-inset-bottom) + 14px);transform:translateY(40px);transition:transform .25s cubic-bezier(.2,.8,.2,1);box-shadow:0 -10px 30px rgba(0,0,0,.5)}
.pk.on .pk-card{transform:none}
.pk-h{display:flex;flex-direction:column;gap:3px;margin-bottom:14px}.pk-h b{font-size:17px}.pk-h span{font-size:12px;color:var(--mut)}
.pk-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.pk-grid button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 2px;font-size:12px;border-radius:14px}
.pk-grid i{width:32px;height:32px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font:700 13px sans-serif;font-style:normal;color:#fff;box-shadow:0 3px 8px rgba(0,0,0,.4)}
.pk-wide{width:100%;margin-top:10px;padding:12px;font-weight:600}
.pk-x{width:100%;margin-top:8px;background:transparent;border-color:transparent;color:var(--mut)}
.ghost{animation:ghost 1s ease-out infinite}
@keyframes ghost{0%{stroke-opacity:1;stroke-width:3}100%{stroke-opacity:.15;stroke-width:14}}
.mk{box-shadow:0 3px 10px rgba(0,0,0,.55)}
.leaflet-control-layers,.leaflet-bar a{background:rgba(24,28,32,.94)!important;color:var(--tx)!important;border:1px solid var(--line)!important;border-radius:14px!important;box-shadow:0 6px 18px rgba(0,0,0,.4)!important}
.leaflet-control-layers-toggle{filter:invert(1);width:44px!important;height:44px!important}
.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:var(--card);color:var(--tx);border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.5)}
.leaflet-popup-content{font-size:14px;line-height:1.4}
.leaflet-control-attribution{background:rgba(0,0,0,.45)!important;color:#999!important;font-size:9px}
.leaflet-control-attribution a{color:#bbb!important}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const toastEl=document.createElement('div');toastEl.id='toast';document.body.appendChild(toastEl);
function toast(m,ms){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toastEl._h);toastEl._h=setTimeout(()=>toastEl.classList.remove('on'),ms||1800)}
window.toast=toast;
const buzzLite=()=>{try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}};

/* faster dots: pre-rendered sprites */
const SPR={};
function spr(c,r){const k=c+'|'+r;if(SPR[k])return SPR[k];const d=Math.ceil(r*2+2),s=window.devicePixelRatio||1,cv=document.createElement('canvas');cv.width=cv.height=Math.ceil(d*s);
  const g=cv.getContext('2d');g.scale(s,s);g.beginPath();g.arc(d/2,d/2,r,0,6.283);g.fillStyle=`rgb(${c})`;g.fill();g.lineWidth=.8;g.strokeStyle='rgba(0,0,0,.55)';g.stroke();return SPR[k]={cv,d}}
window.dot=function(p,r,a){const sp=spr(p.s>.2?'226,75,74':p.s<-.2?'55,138,221':'255,255,255',r);ctx.globalAlpha=a;ctx.drawImage(sp.cv,p.x-sp.d/2,p.y-sp.d/2,sp.d,sp.d);ctx.globalAlpha=1};

/* tap no longer adds pins; tap only adds route points while drawing */
map.off('click');
map.on('click',e=>{if(mode==='route'&&draft){draft.push([e.latlng.lat,e.latlng.lng]);draftLine.setLatLngs(draft);$('rCount').textContent=draft.length+' points · tap to add more';buzzLite()}});

/* long-press picker */
const TYPES=['stand','bed','food','rub','scrape','cam','note'];
const pk=document.createElement('div');pk.className='pk';pk.style.display='none';
pk.innerHTML=`<div class="pk-card"><div class="pk-h"><b>Drop a pin</b><span id="pkLand"></span></div><div class="pk-grid">${
  TYPES.map(t=>`<button data-pk="${t}"><i style="background:${MT[t][0]}">${MT[t][1]}</i>${MT[t][2]}</button>`).join('')
}<button data-pk="info"><i style="background:#3a3f45">?</i>Land info</button></div><button class="pk-wide" data-pk="route">Start a walk-in route here</button><button class="pk-x" data-pk="cancel">Cancel</button></div>`;
document.body.appendChild(pk);
let pkLL=null,ghost=null;
function openPicker(ll){pkLL=ll;if(ghost)ghost.remove();ghost=L.circleMarker(ll,{radius:9,color:'#ff7a1a',weight:3,fillColor:'#ff7a1a',fillOpacity:.5,className:'ghost',interactive:false}).addTo(map);
  $('pkLand').innerHTML=landText(ll.lat,ll.lng);pk.style.display='flex';requestAnimationFrame(()=>pk.classList.add('on'))}
function closePicker(){pk.classList.remove('on');setTimeout(()=>{pk.style.display='none'},200);if(ghost){ghost.remove();ghost=null}}
pk.addEventListener('click',e=>{if(e.target===pk){closePicker();return}const b=e.target.closest('[data-pk]');if(!b)return;const t=b.dataset.pk,ll=pkLL;closePicker();
  if(t==='cancel'||!ll)return;
  if(t==='info'){L.popup().setLatLng(ll).setContent(`<b>Land here</b><br>${landText(ll.lat,ll.lng)}`).openOn(map);return}
  if(t==='route'){setMode('route');draft.push([ll.lat,ll.lng]);draftLine.setLatLngs(draft);$('rCount').textContent='1 point · tap the map to add more';toast('Tap along your walk-in path, then Save route',2600);return}
  const m={id:Date.now().toString(36),type:t,lat:ll.lat,lng:ll.lng,date:new Date().toISOString()};
  if(t==='stand')m.name='Stand '+(markers.filter(x=>x.type==='stand').length+1);
  if(t==='note'){const n=prompt('Note');if(n===null)return;m.note=n}
  markers.push(m);if(t==='stand'){activeId=m.id;scent=[]}
  saveM();drawMarkers();scoreKey='';routeKey='';dirty=true;maybeWx();buzzLite();toast(MT[t][2]+' added')});
const box=map.getContainer();let lp=null,ptrs=0;
function fireLP(x,y){if(mode==='route')return;const r=box.getBoundingClientRect();buzzLite();openPicker(map.containerPointToLatLng([x-r.left,y-r.top]))}
box.addEventListener('pointerdown',e=>{ptrs++;if(lp){clearTimeout(lp.t);lp=null}if(ptrs>1||(e.pointerType==='mouse'&&e.button!==0))return;
  if(e.target.closest('.leaflet-marker-icon,.leaflet-control,.leaflet-popup'))return;
  const x=e.clientX,y=e.clientY;lp={x,y,fired:false,t:setTimeout(()=>{if(lp){lp.fired=true;fireLP(x,y)}},480)}},{passive:true});
box.addEventListener('pointermove',e=>{if(lp&&!lp.fired&&Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10){clearTimeout(lp.t);lp=null}},{passive:true});
['pointerup','pointercancel','pointerleave'].forEach(ev=>box.addEventListener(ev,()=>{ptrs=Math.max(0,ptrs-1);if(lp&&!lp.fired){clearTimeout(lp.t);lp=null}},{passive:true}));
box.addEventListener('contextmenu',e=>{e.preventDefault();if(lp){if(lp.fired)return;clearTimeout(lp.t);lp.fired=true}fireLP(e.clientX,e.clientY)});

/* old tap chips -> hint */
const tapDet=[...document.querySelectorAll('#sheet details')].find(d=>/Tap the map/.test(d.querySelector('summary').textContent));
if(tapDet){tapDet.querySelector('summary').textContent='Pins and routes';const ch=tapDet.querySelector('.chips');if(ch)ch.style.display='none';
  const p=tapDet.querySelector('p');if(p)p.textContent='Long-press anywhere on the map to drop a pin (stand, bedding, food, rub, scrape, trail cam, note), check who owns the land, or start a walk-in route. Tap a pin to rename it, add a note or photo, or delete it.'}
mode='stand';
const oldUI=window.updateUI;
window.updateUI=function(E,h){oldUI(E,h);const a=$('alert');if(a&&a.textContent.indexOf('Tap the map to drop')>=0)a.textContent=a.textContent.replace('Tap the map to drop your stand.','Long-press the map to drop your stand.')};

/* snapping bottom sheet */
const sh=$('sheet'),grab=$('grab');grab.textContent='';grab.onclick=null;
const fab=document.createElement('div');fab.id='fab';
const SV_LOC='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',SV_PLAY='<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill="#eceae4"/></svg>',SV_PAUSE='<svg viewBox="0 0 24 24"><path d="M7 4v16M17 4v16" stroke-width="3"/></svg>';
fab.innerHTML=`<button id="fLoc" aria-label="My location">${SV_LOC}</button><button id="fPlay" aria-label="Play">${SV_PLAY}</button><button id="fNow" aria-label="Jump to now">Now</button>`;
document.body.appendChild(fab);
const syncPlay=()=>{$('fPlay').innerHTML=playing?SV_PAUSE:SV_PLAY};
$('fLoc').onclick=()=>$('loc').click();$('fNow').onclick=()=>{$('now').click();toast('Jumped to now')};
$('fPlay').onclick=()=>{$('play').click();syncPlay()};$('play').addEventListener('click',()=>setTimeout(syncPlay,0));
function peekH(){const row=$('play').parentElement;return Math.min(Math.round(innerHeight*.45),row.offsetTop+row.offsetHeight+18)}
const snaps=()=>[peekH(),Math.round(innerHeight*.52),Math.round(innerHeight*.9)];
let cur=0,dragging=false;
function placeFab(h){fab.style.bottom=(h+12)+'px';fab.style.opacity=h>innerHeight*.75?'0':'1';fab.style.pointerEvents=h>innerHeight*.75?'none':'auto'}
function setSnap(i,anim){cur=i;const h=snaps()[i];sh.style.transition=anim===false?'none':'height .28s cubic-bezier(.2,.8,.2,1)';sh.style.height=h+'px';
  if(i===0){sh.classList.add('min');sh.scrollTop=0}else sh.classList.remove('min');placeFab(h);dirty=true;scoreKey=scoreKey}
new MutationObserver(()=>{if(dragging)return;const m=sh.classList.contains('min');if(m&&cur!==0)setSnap(0);else if(!m&&cur===0)setSnap(1)}).observe(sh,{attributes:true,attributeFilter:['class']});
let dr=null;
grab.addEventListener('pointerdown',e=>{dragging=true;dr={y:e.clientY,h:sh.getBoundingClientRect().height,moved:false};grab.setPointerCapture(e.pointerId);sh.style.transition='none'});
grab.addEventListener('pointermove',e=>{if(!dr)return;const dy=dr.y-e.clientY;if(Math.abs(dy)>5)dr.moved=true;if(!dr.moved)return;
  const h=clamp(dr.h+dy,snaps()[0]-30,innerHeight*.92);sh.style.height=h+'px';if(h>snaps()[0]+30)sh.classList.remove('min');placeFab(h)});
const endDrag=()=>{if(!dr)return;const h=sh.getBoundingClientRect().height;let i;
  if(!dr.moved)i=cur===0?1:0;else{const s=snaps();i=0;s.forEach((v,k)=>{if(Math.abs(v-h)<Math.abs(s[i]-h))i=k})}
  dr=null;dragging=false;setSnap(i)};
grab.addEventListener('pointerup',endDrag);grab.addEventListener('pointercancel',endDrag);
window.addEventListener('resize',()=>setSnap(cur,false));
setSnap(0,false);

/* color-coded time track */
let gk='';
function paintTrack(){const p=refPt(),k=selDate.toDateString()+p.lat.toFixed(2)+p.lng.toFixed(2)+(wx?1:0)+(manual?manual.dir+'/'+manual.spd:'');if(k===gk)return;gk=k;
  const stops=[];for(let i=0;i<=48;i++){const E=env(new Date(selDate.getTime()+i*30*6e4),p),s=E.s0;
    stops.push(`${s>.2?`rgba(226,75,74,${(.35+.5*s).toFixed(2)})`:s<-.2?`rgba(55,138,221,${(.35-.5*s).toFixed(2)})`:'rgba(255,255,255,.6)'} ${(i/48*100).toFixed(1)}%`)}
  $('time').style.background=`linear-gradient(90deg,${stops.join(',')})`}
setInterval(paintTrack,3000);paintTrack();

if(!localStorage.getItem('ts_lp_hint')){setTimeout(()=>toast('Tip: long-press the map to drop a pin',4000),1200);localStorage.setItem('ts_lp_hint','1')}
/* keep the app pinned to the screen (iOS keyboard, overscroll, rotation) */
const lock=document.createElement('style');
lock.textContent='html,body{position:fixed;inset:0;width:100%;height:100%;overscroll-behavior:none}input,select,textarea{font-size:16px!important}';
document.head.appendChild(lock);
function pin(){if(window.scrollX||window.scrollY)window.scrollTo(0,0);document.documentElement.scrollTop=document.body.scrollTop=0;map.invalidateSize({pan:false});resizeFx();dirty=true}
window.addEventListener('scroll',()=>{if(window.scrollX||window.scrollY)window.scrollTo(0,0)},{passive:true});
document.addEventListener('focusout',e=>{if(e.target.matches('input,select,textarea'))setTimeout(pin,100)});
if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(visualViewport.height>innerHeight*.85)setTimeout(pin,50)});
window.addEventListener('orientationchange',()=>setTimeout(()=>{pin();setSnap(cur,false)},300));
window.addEventListener('pageshow',pin);

/* "back to my stands" button, in case the map gets panned somewhere odd */
const fS=document.createElement('button');fS.setAttribute('aria-label','Back to my pins');
fS.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
fab.insertBefore(fS,fab.firstChild);
fS.onclick=()=>{const pts=markers.filter(m=>m.type!=='party').map(m=>[m.lat,m.lng]);
  if(!pts.length){toast('No pins yet');return}
  map.fitBounds(L.latLngBounds(pts).pad(.3),{maxZoom:16,paddingBottomRight:[0,sh.getBoundingClientRect().height]})};
syncPlay();dirty=true;
})();
