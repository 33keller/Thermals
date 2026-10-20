/* Thermal Scout custom layers: import KMZ/KML/GeoJSON (e.g., Kansas WIHA tracts). Saved on the phone, works offline. */
(function(){
const COLORS=['#ff4fd8','#00e5ff','#ffd400','#7cff4f','#ff7a00'];
const rend=L.canvas({padding:.5}),group=L.layerGroup().addTo(map),loaded={};let feats=[];
const txt=(el,tag)=>{const x=el&&el.getElementsByTagName(tag)[0];return x?x.textContent.trim():''};
const coords=el=>{const c=el&&el.getElementsByTagName('coordinates')[0];if(!c)return[];return c.textContent.trim().split(/\s+/).map(s=>s.split(',').map(Number)).filter(a=>a.length>=2&&!isNaN(a[0])&&!isNaN(a[1])).map(a=>[a[0],a[1]])};
const strip=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('ts-layers',1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function tx(mode,fn){const db=await idb();return new Promise((res,rej)=>{const t=db.transaction('files',mode),q=fn(t.objectStore('files'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})}
const dbAll=()=>tx('readonly',s=>s.getAll()).then(r=>r||[]),dbPut=o=>tx('readwrite',s=>s.put(o)),dbDel=id=>tx('readwrite',s=>s.delete(id));

async function parse(buf){const b=new Uint8Array(buf);let zip=null,kml;
  if(b[0]===0x50&&b[1]===0x4B){if(!window.JSZip)throw new Error('zip reader not loaded (check the JSZip line in index.html)');
    zip=await JSZip.loadAsync(buf);const kf=Object.keys(zip.files).find(f=>f.toLowerCase().endsWith('.kml'));if(!kf)throw new Error('no KML inside the KMZ');kml=await zip.file(kf).async('string')}
  else{const t=new TextDecoder().decode(b).replace(/^\uFEFF/,'').trim();if(t[0]==='{')return{geo:JSON.parse(t)};kml=t}
  const doc=new DOMParser().parseFromString(kml,'text/xml');if(doc.getElementsByTagName('parsererror').length)throw new Error('file is not valid KML');
  const out={polys:[],lines:[],points:[],overlays:[]};
  for(const pm of doc.getElementsByTagName('Placemark')){const nm=txt(pm,'name'),ds=strip(txt(pm,'description'));
    for(const pg of pm.getElementsByTagName('Polygon')){const rings=[coords(pg.getElementsByTagName('outerBoundaryIs')[0])];for(const ib of pg.getElementsByTagName('innerBoundaryIs'))rings.push(coords(ib));if(rings[0].length>2)out.polys.push({nm,ds,rings})}
    for(const ls of pm.getElementsByTagName('LineString')){const p=coords(ls);if(p.length>1)out.lines.push({nm,pts:p})}
    for(const pt of pm.getElementsByTagName('Point')){const c=coords(pt);if(c.length)out.points.push({nm,ds,p:c[0]})}}
  for(const go of doc.getElementsByTagName('GroundOverlay')){const bx=go.getElementsByTagName('LatLonBox')[0],href=txt(go.getElementsByTagName('Icon')[0],'href');if(!bx||!href)continue;
    let url=href;if(zip){const key=Object.keys(zip.files).find(k=>k===href||k.endsWith(href.split('/').pop()));if(key)url=URL.createObjectURL(await zip.file(key).async('blob'))}
    out.overlays.push({url,b:[[+txt(bx,'south'),+txt(bx,'west')],[+txt(bx,'north'),+txt(bx,'east')]]})}
  return out}

function render(o,data){const st={renderer:rend,interactive:false,color:o.color,weight:2,fillColor:o.color,fillOpacity:.2},parts=[],fs=[];
  if(data.geo){parts.push(L.geoJSON(data.geo,{renderer:rend,interactive:false,style:()=>st,pointToLayer:(f,ll)=>L.circleMarker(ll,{...st,radius:5})}));
    (data.geo.features||[]).forEach(f=>{const g=f.geometry;if(!g)return;const p=f.properties||{},nm=p.name||p.Name||p.NAME||p.title||'';
      (g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[]).forEach(r=>fs.push({nm,ds:'',rings:r}))})}
  else{data.overlays.forEach(v=>parts.push(L.imageOverlay(v.url,v.b,{opacity:.85,interactive:false})));
    data.polys.forEach(p=>{parts.push(L.polygon(p.rings.map(r=>r.map(q=>[q[1],q[0]])),st));fs.push(p)});
    data.lines.forEach(l=>parts.push(L.polyline(l.pts.map(q=>[q[1],q[0]]),st)));
    data.points.forEach(p=>parts.push(L.circleMarker([p.p[1],p.p[0]],{...st,radius:5})))}
  const fg=L.featureGroup(parts);loaded[o.id]={fg,fs,name:o.name,color:o.color,on:o.on,n:parts.length};if(o.on)fg.addTo(group);rebuild()}
function rebuild(){feats=[];for(const k in loaded){const l=loaded[k];if(!l.on)continue;
  l.fs.forEach(f=>{const r=f.rings[0];let a=180,b=90,c=-180,d=-90;r.forEach(p=>{if(p[0]<a)a=p[0];if(p[0]>c)c=p[0];if(p[1]<b)b=p[1];if(p[1]>d)d=p[1]});feats.push({...f,layer:l.name,bb:[a,b,c,d]})})}
  dirty=true}

const orig=window.landText;
window.landText=function(lat,lng){const base=orig(lat,lng);
  for(const f of feats){if(lng<f.bb[0]||lng>f.bb[2]||lat<f.bb[1]||lat>f.bb[3])continue;
    if(inPoly(lng,lat,f.rings))return`<b>${esc(f.layer)}</b>: ${esc(f.nm||'Tract')}${f.ds?' · '+esc(f.ds.slice(0,160)):''}<br>${base}`}
  return base};

const det=document.createElement('details');
det.innerHTML='<summary>My map layers (WIHA, KML, KMZ)</summary><p class="fine">Import a Google Earth (KMZ or KML) or GeoJSON file, like the Kansas WIHA tracts file. It is saved on this phone and works offline. Long-press the map and pick Land info to see tract details.</p><div class="chips"><button id="clImport">Import file</button></div><div id="clMsg" class="fine" style="margin-top:6px"></div><div id="clList"></div>';
const more=document.querySelector('#sheet .more'),sets=[...more.querySelectorAll('details')].find(d=>/Settings/.test(d.querySelector('summary').textContent));
more.insertBefore(det,sets||null);
const inp=document.createElement('input');inp.type='file';inp.style.display='none';document.body.appendChild(inp);
const msg=t=>{document.getElementById('clMsg').textContent=t};
function list(){const el=document.getElementById('clList'),ids=Object.keys(loaded);
  el.innerHTML=ids.length?ids.map(id=>{const l=loaded[id];return`<div class="lg"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-cl="${id}" ${l.on?'checked':''}><span style="width:10px;height:10px;background:${l.color};display:inline-block"></span>${esc(l.name)}</label><button data-cldel="${id}" style="padding:2px 8px">✕</button></div>`}).join(''):'<p class="fine">No layers yet.</p>'}
document.getElementById('clImport').onclick=()=>inp.click();
inp.onchange=async()=>{const f=inp.files[0];inp.value='';if(!f)return;
  try{msg('Reading '+f.name+'…');const buf=await f.arrayBuffer(),data=await parse(buf);
    const n=data.geo?(data.geo.features||[]).length:data.polys.length+data.lines.length+data.points.length+data.overlays.length;if(!n)throw new Error('no shapes found');
    const o={id:Date.now().toString(36),name:f.name.replace(/\.[^.]+$/,''),buf,color:COLORS[Object.keys(loaded).length%COLORS.length],on:true};
    await dbPut(o);render(o,data);list();
    msg(data.overlays&&data.overlays.length&&!data.polys.length?`Loaded ${n} map image(s). This file is a picture of the tracts, so Land info can't name them.`:`Loaded ${n} shapes from ${f.name}.`);
    const bb=loaded[o.id].fg.getBounds();if(bb.isValid()&&!map.getBounds().intersects(bb))map.fitBounds(bb)}
  catch(e){msg('Could not read that file: '+(e.message||e))}};
document.getElementById('clList').addEventListener('change',async e=>{const id=e.target.dataset.cl;if(!id)return;const l=loaded[id];l.on=e.target.checked;
  if(l.on)l.fg.addTo(group);else group.removeLayer(l.fg);rebuild();const o=(await dbAll()).find(x=>x.id===id);if(o){o.on=l.on;await dbPut(o)}});
document.getElementById('clList').addEventListener('click',async e=>{const b=e.target.closest('[data-cldel]');if(!b)return;const id=b.dataset.cldel;if(!confirm('Remove this layer?'))return;
  group.removeLayer(loaded[id].fg);delete loaded[id];rebuild();list();await dbDel(id)});
dbAll().then(async all=>{for(const o of all){try{render(o,await parse(o.buf))}catch(e){}}list()}).catch(()=>{msg('Layer storage is not available in this browser.');list()});
})();
