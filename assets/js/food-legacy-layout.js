/* v49-food-redesign */
(function(){
  const HOTEL={lat:41.876000,lon:-87.626757};
  const STORAGE='chicago_route_origin_mode';
  const GEO_CACHE='chicago_food_geocode_v45';
  const ROUTE_CACHE='chicago_food_route_v49';
  const VALHALLA='https://valhalla1.openstreetmap.de/route';
  const CAT_ORDER=[
    ['breakfast','☕ Café / desayuno'],
    ['fast','🍔 Comida rápida'],
    ['chicago','🌭 Chicago clásico'],
    ['pizza','🍕 Pizza'],
    ['chinatown','🥟 Chinatown'],
    ['snacks','🍿 Snacks'],
    ['market','🛒 Supermercado / mercado'],
    ['shops','🛍️ Tiendas / souvenirs']
  ];
  let mode=localStorage.getItem(STORAGE)||'hotel';
  let activeDay=null, activeCat='';
  let current=null, watchId=null;
  let busy=false;

  const $=s=>document.querySelector(s);
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const geoGet=()=>{try{return JSON.parse(localStorage.getItem(GEO_CACHE)||'{}')}catch(e){return {}}};
  const routeGet=()=>{try{return JSON.parse(localStorage.getItem(ROUTE_CACHE)||'{}')}catch(e){return {}}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

  function normalizeText(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
  function classify(card){
    const name=normalizeText(card.querySelector('b')?.textContent||'');
    const meta=normalizeText(card.querySelector('.meta')?.textContent||'');
    const tag=normalizeText(card.querySelector('.tag')?.textContent||'');
    const all=name+' '+meta+' '+tag;
    if(/trader joe|jewel-osco|whole foods|mariano|go grocer|park to shop|88 marketplace|h mart|north loop market|south loop market|urban pantry|totto.?s market|supermarket|grocery|market\b/.test(all)) return 'market';
    if(/harry potter|nike\b|adidas|uniqlo|h&m|macy|burlington|ross dress|nordstrom|marshalls|target\b|my chicago|souvenir|shop|shopping|novelty|discount|tienda|retail|outlet/.test(all)) return 'shops';
    if(/chinatown|minghin|lao sze|claypot|sichuan|dim sum|chinese|chinatown square|ping tom|dumpling|asian/.test(all)) return 'chinatown';
    if(/pizza|giordano|gino.?s east|lou malnati|pequod/.test(all)) return 'pizza';
    if(/garrett|popcorn|snack|sweet bean|dessert|ice cream/.test(all)) return 'snacks';
    if(/cafe|coffee|breakfast|desayuno|yolk|beatrix|bagel|cafecito|momentum|happy monday|holy bagels|tary/.test(all)) return 'breakfast';
    if(/italian beef|portillo|hot dog|devil dawgs|billy goat|chicago classic|chicago \/ rapido|chicago \/ rapido|chicago clasico/.test(all)) return 'chicago';
    return 'fast';
  }

  function addressFor(card){
    const b=card.querySelector('.route-btn');
    if(b?.dataset.destination) return b.dataset.destination;
    const m=card.querySelector('.meta')?.textContent||'';
    const x=m.match(/📍\s*([^\n]+)/); return x?x[1].trim():'';
  }
  function nameFor(card){return (card.querySelector('b')?.textContent||'Lugar').trim()}

  function routeKey(origin,dest){
    const a=origin===HOTEL?`hotel:HOTEL.lat,{HOTEL.lon}`:`gps:origin.lat.toFixed(4),{origin.lon.toFixed(4)}`;
    const d=`dest.lat.toFixed(5),{dest.lon.toFixed(5)}`;
    return a+'|'+d;
  }
  async function geocode(address){
    const c=geoGet(); if(c[address]) return c[address];
    try{
      const u='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q='+encodeURIComponent(address);
      const r=await fetch(u,{headers:{Accept:'application/json'}}); if(!r.ok)return null;
      const j=await r.json(); if(!j[0])return null;
      const v={lat:+j[0].lat,lon:+j[0].lon}; c[address]=v; save(GEO_CACHE,c); return v;
    }catch(e){return null}
  }
  async function walkingRoute(origin,dest){
    const key=routeKey(origin,dest), c=routeGet(); if(c[key]) return c[key];
    try{
      const payload={locations:[{lat:origin.lat,lon:origin.lon},{lat:dest.lat,lon:dest.lon}],costing:'pedestrian',directions_options:{units:'kilometers'}};
      const u=VALHALLA+'?json='+encodeURIComponent(JSON.stringify(payload));
      const r=await fetch(u); if(!r.ok)return null;
      const j=await r.json(); const sum=j?.trip?.summary; if(!sum)return null;
      const v={km:Number(sum.length),minutes:Math.round(Number(sum.time)/60)};
      if(Number.isFinite(v.km)&&Number.isFinite(v.minutes)){c[key]=v; save(ROUTE_CACHE,c); return v;}
    }catch(e){}
    return null;
  }

  function injectUI(panel){
    if(panel.querySelector('.v49-food-ui')) return panel.querySelector('.v49-food-ui');
    const cards=[...panel.querySelectorAll('.option-card')];
    const unique=[]; const seen=new Set();
    cards.forEach(card=>{
      const key=normalizeText(nameFor(card))+'|'+normalizeText(addressFor(card));
      if(!seen.has(key)){seen.add(key); unique.push(card)} else card.remove();
    });
    const ui=document.createElement('div'); ui.className='v49-food-ui';
    const tabs=document.createElement('div'); tabs.className='v49-cat-tabs';
    const body=document.createElement('div'); body.className='v49-cat-body';
    const groups={}; CAT_ORDER.forEach(([k])=>groups[k]=[]);
    unique.forEach(card=>{const k=classify(card); (groups[k]||(groups.fast=groups.fast||[],groups.fast)).push(card)});
    CAT_ORDER.forEach(([k,label])=>{
      if(!groups[k]?.length)return;
      const b=document.createElement('button'); b.type='button'; b.className='v49-cat-btn'; b.dataset.cat=k; b.innerHTML=label+' <span>'+groups[k].length+'</span>';
      tabs.appendChild(b);
    });
    // Move cards into category containers, preserving their existing order.
    Object.entries(groups).forEach(([k,list])=>{
      if(!list.length)return;
      const grid=document.createElement('div'); grid.className='v49-grid'; grid.dataset.catGrid=k;
      list.forEach(card=>{
        card.classList.add('v49-card');
        const tag=card.querySelector('.tag'); if(tag) tag.remove();
        card.querySelectorAll('.food-distance,.live-distance,.v45-live-distance').forEach(x=>x.remove());
        const meta=card.querySelector('.meta'); if(meta){meta.innerHTML=meta.innerHTML.replace(/<br\s*\/?>\s*Categoría original:[^<]*/i,'').replace(/Categoría original:[^<]*/i,'').trim();}
        grid.appendChild(card);
      });
      body.appendChild(grid);
    });
    ui.appendChild(tabs); ui.appendChild(body);
    // Hide the old category headings/grids but keep their cards now moved into our UI.
    panel.querySelectorAll('.category-title,.foodHint').forEach(x=>x.style.display='none');
    panel.querySelectorAll(':scope > .option-grid').forEach(x=>x.style.display='none');
    const oldMeta=[...panel.children].filter(x=>x.classList?.contains('meta') && !x.closest('.v49-food-ui')); oldMeta.forEach(x=>x.style.display='none');
    panel.appendChild(ui);
    return ui;
  }

  function renderCat(panel,cat){
    const ui=injectUI(panel); const buttons=[...ui.querySelectorAll('.v49-cat-btn')];
    if(!cat || !ui.querySelector(`[data-cat-grid="${cat}"]`)) cat=buttons[0]?.dataset.cat||'';
    activeCat=cat;
    buttons.forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));
    ui.querySelectorAll('.v49-grid').forEach(g=>g.classList.toggle('active',g.dataset.catGrid===cat));
    updateDistances(panel,cat);
  }

  async function updateDistances(panel,cat){
    const grid=panel.querySelector(`.v49-grid[data-cat-grid="${cat}"]`); if(!grid)return;
    const cards=[...grid.querySelectorAll('.option-card')];
    const origin=mode==='hotel'?HOTEL:current;
    for(const card of cards){
      let el=card.querySelector('.v49-route-distance');
      if(!el){el=document.createElement('div');el.className='v49-route-distance';const meta=card.querySelector('.meta');if(meta)meta.after(el);}
      if(!origin){el.innerHTML='📍 <span>Esperando ubicación…</span>';continue;}
      const addr=addressFor(card); let target=card.__v49coords;
      if(!target){el.innerHTML='📍 <span>Calculando ruta caminando…</span>'; target=await geocode(addr); card.__v49coords=target;}
      if(!target){el.innerHTML='📍 <span>Ruta no disponible · usa “Cómo llegar”</span>';continue;}
      const r=await walkingRoute(origin,target);
      if(r) el.innerHTML='🚶 <strong>≈ '+r.km.toFixed(1)+' km</strong> <span>· '+r.minutes+' min caminando</span>';
      else el.innerHTML='🚶 <span>Distancia de ruta no disponible · usa “Cómo llegar”</span>';
      await new Promise(res=>setTimeout(res,250));
    }
  }

  function setMode(next){
    mode=next==='current'?'current':'hotel'; localStorage.setItem(STORAGE,mode);
    if(mode==='hotel'){
      if(watchId!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watchId); watchId=null; current=null;
    }else if(navigator.geolocation){
      const apply=p=>{current={lat:p.coords.latitude,lon:p.coords.longitude}; if(activeDay) updateDistances($('#foodModal .food-panel.active'),activeCat)};
      navigator.geolocation.getCurrentPosition(apply,()=>{}, {enableHighAccuracy:true,maximumAge:0,timeout:15000});
      if(watchId!==null)navigator.geolocation.clearWatch(watchId);
      watchId=navigator.geolocation.watchPosition(apply,()=>{}, {enableHighAccuracy:true,maximumAge:10000,timeout:20000});
    }
    document.querySelectorAll('[data-origin-mode]').forEach(b=>b.classList.toggle('active',b.dataset.originMode===mode));
    document.querySelectorAll('.option-card .route-btn').forEach(b=>{b.dataset.origin=mode==='hotel'?'24 E Ida B Wells Dr, Chicago, IL 60605':'';b.dataset.originLabel=mode==='hotel'?'Hospedaje':'Ubicación actual';b.dataset.originMode=mode});
    const st=$('#foodModal .v49-food-status'); if(st)st.remove();
    if(activeDay) updateDistances($('#foodModal .food-panel.active'),activeCat);
  }

  function openDay(day){
    activeDay=String(day); const panel=document.querySelector(`#foodModal .food-panel[data-food-panel="${day}"]`); if(!panel)return;
    injectUI(panel);
    const ui=panel.querySelector('.v49-food-ui');
    let st=panel.querySelector('.v49-food-status');
    if(st) st.remove();
    const first=ui.querySelector('.v49-cat-btn'); renderCat(panel,first?.dataset.cat||'');
  }

  document.addEventListener('click',e=>{
    const origin=e.target.closest('[data-origin-mode]');
    if(origin){e.preventDefault();e.stopImmediatePropagation();setMode(origin.dataset.originMode);return;}
    const day=e.target.closest('[data-food-day]'); if(day){setTimeout(()=>openDay(day.dataset.foodDay),100);return;}
    const cat=e.target.closest('.v49-cat-btn'); if(cat){const p=e.target.closest('.food-panel'); if(p)renderCat(p,cat.dataset.cat);}
  },true);

  // Clean legacy distance/status elements so only v49 is visible.
  document.querySelectorAll('.food-panel .v45-food-status,.food-panel .v45-live-distance,.food-panel .live-distance,.food-panel .food-distance').forEach(x=>x.style.display='none');
  setMode(mode);
})();
