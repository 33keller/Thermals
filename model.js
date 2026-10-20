/* Thermal Scout model v2: research-based slope-flow physics. Loads after index.html's main script and replaces its flow model. */
(function(){
const G=8,MS=0.447,K=0.7,cache=new Map();let ST=null;
const canKey=()=>markers.filter(m=>m.canopy).map(m=>m.id).join(',');

function buildStatic(){
  const cols=Math.ceil(W/G)+1,rows=Math.ceil(H/G)+1,N=cols*rows,cellM=G*screenMpp();
  const z0=new Float32Array(N).fill(NaN),z=new Float32Array(N).fill(NaN);
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const v=elevAt(c*G,r*G);if(v!=null&&v>-1000)z0[r*cols+c]=v}
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){let s=0,n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=rows||cc>=cols)continue;const v=z0[rr*cols+cc];if(!isNaN(v)){s+=v;n++}}if(n)z[r*cols+c]=s/n}
  const at=(r,c)=>(r<0||c<0||r>=rows||c>=cols)?NaN:z[r*cols+c];
  const grad=(r,c,k)=>{const e=at(r,c+k),w=at(r,c-k),n=at(r-k,c),s=at(r+k,c);if(isNaN(e)||isNaN(w)||isNaN(n)||isNaN(s))return null;return[(e-w)/(2*k*cellM),(n-s)/(2*k*cellM)]};
  const kL=Math.max(1,Math.round(30/cellM)),kR=Math.max(2,Math.round(250/cellM)),kT=Math.max(2,Math.round(300/cellM));
  const gxL=new Float32Array(N),gyL=new Float32Array(N),gxR=new Float32Array(N),gyR=new Float32Array(N),tpi=new Float32Array(N),ok=new Uint8Array(N);
  const D8=[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=r*cols+c;if(isNaN(z[i]))continue;
    const gl=grad(r,c,kL)||grad(r,c,1);if(!gl)continue;const gr=grad(r,c,kR)||gl;
    gxL[i]=gl[0];gyL[i]=gl[1];gxR[i]=gr[0];gyR[i]=gr[1];
    let s=0,n=0;for(const[dr,dc]of D8){const v=at(r+dr*kT,c+dc*kT);if(!isNaN(v)){s+=v;n++}}tpi[i]=n?z[i]-s/n:0;ok[i]=1}
  return{cols,rows,cellM,z,gxL,gyL,gxR,gyR,tpi,ok,at,ver:elevBuilt,W,H}}
function getStatic(){if(!elev)return null;if(!ST||ST.ver!==elevBuilt||ST.W!==W||ST.H!==H){ST=buildStatic();cache.clear()}return ST}

function buildField(E,S0){
  const{cols,rows,cellM,z,gxL,gyL,gxR,gyR,tpi,ok,at}=S0,N=cols*rows;
  const vx=new Float32Array(N),vy=new Float32Array(N),sv=new Float32Array(N),shade=new Uint8Array(N);
  const alt=E.sun.alt,az=E.sun.az,cloud=(E.w.cloud||0)/100,cf=1-.7*cloud,cool=1-.6*cloud,night=alt<=0;
  const ca=Math.cos(alt),sx=-Math.sin(az)*ca,sy=-Math.cos(az)*ca,sz=Math.sin(alt),tanA=Math.tan(Math.max(alt,0)),sunE=-Math.sin(az),sunN=-Math.cos(az);
  const U10=(E.w.spd||0)*MS,rad=(E.w.dir||0)*Math.PI/180,toE=-Math.sin(rad),toN=-Math.cos(rad);
  const Ug=U10*(U10>6?.6:night?.3:.5),wT=clamp(1-(U10-2)/6,.1,1);
  const t=E.d.getTime(),hSR=(t-E.st.sunrise.getTime())/36e5,hSS=(t-E.st.sunset.getTime())/36e5;
  const hAfter=hSS>0?hSS:hSS+24,nightAmp=hAfter<2?1:Math.max(.5,1-(hAfter-2)*.06),erode=clamp((hSR-.5)/2.5,0,1);
  const nSh=Math.min(80,Math.ceil(1500/cellM)),nWd=Math.min(40,Math.ceil(300/cellM));
  const cs=markers.filter(m=>m.type==='stand'&&m.canopy).map(m=>map.latLngToContainerPoint([m.lat,m.lng])),canPx=120/screenMpp();
  for(let i=0;i<N;i++){if(!ok[i])continue;const r=(i/cols)|0,c=i%cols,z0=z[i],ge=gxL[i],gn=gyL[i];
    let lit=!night;
    if(lit&&alt<.45){for(let k=1;k<=nSh;k++){const zz=at(Math.round(r-sunN*k),Math.round(c+sunE*k));if(isNaN(zz))break;if((zz-z0)/(k*cellM)>tanA){lit=false;break}}}
    if(!lit&&!night)shade[i]=1;
    let s;
    if(night)s=-cool*nightAmp;
    else if(!lit)s=-cool*.8;
    else{const nz=1/Math.sqrt(ge*ge+gn*gn+1),il=Math.max(0,(-ge*sx-gn*sy+sz)*nz);s=clamp((il*cf-.15)/.15,-1,1)}
    const pool=clamp(-tpi[i]/15,0,1);
    if(lit&&hSR>0&&hSR<4&&pool>0){const keep=pool*(1-erode);s=s*(1-keep)-.4*keep}
    for(const p of cs){if(Math.hypot(c*G-p.x,r*G-p.y)<canPx){s=night?.3*cool:-.5*Math.abs(s)-.1;break}}
    const wR=night||s<0?(.4+.4*pool):.3,bx=(1-wR)*ge+wR*gxR[i],by=(1-wR)*gn+wR*gyR[i],bm=Math.hypot(bx,by);
    const slopeF=clamp(Math.sqrt(Math.max(Math.hypot(ge,gn),Math.hypot(gxR[i],gyR[i]))/.1),.12,1);
    let vt=(s>0?2:1.6)*s*slopeF*wT;if(s<0)vt*=(1-.5*pool);
    const ux=bm>1e-5?bx/bm:0,uy=bm>1e-5?by/bm:0;
    let rise=0;if(Ug>.3){for(let k=1;k<=nWd;k++){const zz=at(Math.round(r+toN*k),Math.round(c-toE*k));if(isNaN(zz))break;const d=zz-z0;if(d>rise)rise=d}}
    const sh=clamp(1-rise/40,.3,1),e=vt*ux+toE*Ug*sh,n=vt*uy+toN*Ug*sh;
    vx[i]=e*K;vy[i]=-n*K;sv[i]=s}
  return{vx,vy,sv,shade,cols,rows,ok,gxL,gyL}}
function getField(E){const S0=getStatic();if(!S0)return null;
  const k=[Math.floor(E.d.getTime()/3e5),Math.round(E.w.dir||0),Math.round(E.w.spd||0),Math.round(E.w.cloud||0),S0.ver,canKey()].join('|');
  let F=cache.get(k);if(!F){F=buildField(E,S0);cache.set(k,F);if(cache.size>80)cache.delete(cache.keys().next().value)}return F}
function sample(F,x,y){const fc=x/G,fr=y/G,c0=Math.floor(fc),r0=Math.floor(fr);if(c0<0||r0<0||c0>=F.cols-1||r0>=F.rows-1)return null;
  const tx=fc-c0,ty=fr-r0,i00=r0*F.cols+c0,idx=[i00,i00+1,i00+F.cols,i00+F.cols+1],wt=[(1-tx)*(1-ty),tx*(1-ty),(1-tx)*ty,tx*ty];
  let vx=0,vy=0,s=0,ws=0;for(let q=0;q<4;q++){const i=idx[q];if(!F.ok[i])continue;vx+=F.vx[i]*wt[q];vy+=F.vy[i]*wt[q];s+=F.sv[i]*wt[q];ws+=wt[q]}
  if(ws<=0)return null;const ni=Math.round(fr)*F.cols+Math.round(fc);return{vx:vx/ws,vy:vy/ws,s:s/ws,g:F.ok[ni]?{e:F.gxL[ni],n:F.gyL[ni]}:null}}

const oldFlow=window.flow;
window.flow=function(x,y,E){const F=getField(E);if(F){const r=sample(F,x,y);if(r)return r}return oldFlow(x,y,E)};
window.sAt=function(ge,gn,E){return E.sun.alt<=0?-1:clamp((Math.sin(E.sun.alt)*E.cf-.15)/.15,-1,1)};
window.switchTimes=function(p){const k='v2'+selDate.toDateString()+p.lat.toFixed(2)+p.lng.toFixed(2)+(wx?'w':'');if(swCache.k===k)return swCache.v;
  let am=null,pm=null,prev=null;
  for(let m=0;m<1440;m+=5){const d=new Date(selDate.getTime()+m*6e4),sp=SunCalc.getPosition(d,p.lat,p.lng),h=hourData(d),cf=1-.7*((h&&h.cloud)||0)/100;
    const v=sp.altitude>0?Math.sin(sp.altitude)*cf-.15:-1;if(prev!==null){if(prev<0&&v>=0&&!am)am=d;if(prev>=0&&v<0)pm=d}prev=v}
  swCache={k,v:{am,pm}};return swCache.v};

const mf=document.createElement('canvas');mf.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:445';document.body.insertBefore(mf,document.getElementById('fx'));
const mctx=mf.getContext('2d');
function sizeMf(){const d=window.devicePixelRatio||1;mf.width=W*d;mf.height=H*d;mctx.setTransform(d,0,0,d,0,0)}
const oldResize=window.resizeFx;window.resizeFx=function(){oldResize();sizeMf()};sizeMf();
map.on('movestart',()=>mctx.clearRect(0,0,W,H));
function drawArrows(){mctx.clearRect(0,0,W,H);if(moving||!(S.arrows||S.shadeOn))return;const E=env(),F=getField(E);if(!F)return;
  if(S.shadeOn){mctx.fillStyle='rgba(0,0,40,.4)';for(let i=0;i<F.shade.length;i++)if(F.shade[i]){const r=(i/F.cols)|0,c=i%F.cols;mctx.fillRect(c*G-G/2,r*G-G/2,G,G)}}
  if(S.arrows){mctx.lineWidth=2;for(let r=2;r<F.rows-2;r+=5)for(let c=2;c<F.cols-2;c+=5){const i=r*F.cols+c;if(!F.ok[i])continue;
    const vx=F.vx[i],vy=F.vy[i],m=Math.hypot(vx,vy);if(m<.02)continue;const L=Math.min(28,m*30),ux=vx/m,uy=vy/m,x=c*G,y=r*G,s=F.sv[i],hx=x+ux*L/2,hy=y+uy*L/2;
    mctx.strokeStyle=s>.2?'#ff6b6b':s<-.2?'#5fb0ff':'#ffffff';mctx.beginPath();mctx.moveTo(x-ux*L/2,y-uy*L/2);mctx.lineTo(hx,hy);
    mctx.moveTo(hx,hy);mctx.lineTo(hx-ux*6-uy*4,hy-uy*6+ux*4);mctx.moveTo(hx,hy);mctx.lineTo(hx-ux*6+uy*4,hy-uy*6-ux*4);mctx.stroke()}}}
setInterval(drawArrows,400);

const oldUI=window.updateUI;
window.updateUI=function(E,hits){oldUI(E,hits);if(document.getElementById('sheet').classList.contains('min'))return;const info=document.getElementById('info');if(!info)return;
  const st=activeStand();let txt=st?'Not loaded (zoom in or check signal)':'Drop a stand';
  if(st&&elev){const p=map.latLngToContainerPoint([st.lat,st.lng]),S0=getStatic(),F=getField(E);
    if(S0&&F){const c=Math.round(p.x/G),r=Math.round(p.y/G),i=r*S0.cols+c;
      if(c>=0&&r>=0&&c<S0.cols&&r<S0.rows&&S0.ok[i]){const ge=S0.gxL[i],gn=S0.gyL[i],pct=Math.round(Math.hypot(ge,gn)*100),face=compass((Math.atan2(-ge,-gn)*180/Math.PI+360)%360),tp=S0.tpi[i];
        txt=(pct<1?'Flat':`${pct}% slope facing ${face}`)+(tp<-4?` · low spot, ${Math.round(-tp*3.28)} ft below surroundings (cold air pools)`:tp>6?' · up high (ridge or knob)':'')+(F.shade[i]?' · in terrain shadow':'')}
      else txt='Stand is off screen'}}
  info.insertAdjacentHTML('afterbegin',`<div class="cell wide"><small>Terrain at stand</small><b>${esc(txt)}</b></div>`)};

const det=document.createElement('details');
det.innerHTML=`<summary>Thermal model</summary>
<label class="tog"><input type="checkbox" id="mArrows">Show flow arrows (what the air is doing everywhere)</label>
<label class="tog"><input type="checkbox" id="mShade">Show terrain shadows (ridges blocking the sun)</label>
<div class="fine" style="margin:8px 0 4px">Thick canopy over a stand (leaves on, pines, cedars). Research found dense canopy can reverse thermals underneath it. Experimental.</div><div id="mCan"></div>
<p class="fine">How it works: each spot on the map checks whether the sun is hitting it (including shadows cast by ridges) and at what angle. Sunlit slopes push air uphill within minutes; shaded ground and nights drain cold air downhill, strongest right after sunset and fading later at night. Low spots hold cold air into the morning. At night drainage follows the larger valley. Thermals run up to about 2 m/s, rule under about 5 mph of forecast wind, and are mostly gone above about 16 mph. Ground-level wind is reduced, more at night, and sheltered behind higher ground.</p>`;
const more=document.querySelector('#sheet .more'),cond=[...more.querySelectorAll('details')].find(d=>/Conditions/.test(d.querySelector('summary').textContent));
more.insertBefore(det,cond?cond.nextSibling:null);
const ma=document.getElementById('mArrows'),ms=document.getElementById('mShade');
ma.checked=!!S.arrows;ms.checked=!!S.shadeOn;
ma.onchange=()=>{S.arrows=ma.checked;saveS();drawArrows()};ms.onchange=()=>{S.shadeOn=ms.checked;saveS();drawArrows()};
function canList(){const el=document.getElementById('mCan'),st=markers.filter(m=>m.type==='stand');
  el.innerHTML=st.length?st.map(m=>`<label class="tog"><input type="checkbox" data-can="${m.id}" ${m.canopy?'checked':''}>${esc(mName(m))}</label>`).join(''):'<p class="fine">No stands yet.</p>'}
document.getElementById('mCan').addEventListener('change',e=>{const id=e.target.dataset.can;if(!id)return;const m=markers.find(x=>x.id===id);if(m){m.canopy=e.target.checked;saveM();scoreKey='';routeKey='';dirty=true;drawArrows()}});
det.addEventListener('toggle',()=>{if(det.open)canList()});
setInterval(()=>{if(det.open&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#mCan')))canList()},3000);
cache.clear();ST=null;dirty=true;scoreKey='';routeKey='';
})();
