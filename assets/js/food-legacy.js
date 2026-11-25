(function(){
  const modal=document.getElementById('foodModal');
  const picker=document.getElementById('foodDayPicker');
  const title=document.getElementById('foodModalTitle');
  const sub=document.getElementById('foodModalSub');
  const close=document.getElementById('foodClose');
  const floatBtn=document.getElementById('foodFloat');
  const locBtn=document.getElementById('foodUseLocation');
  if(!modal||!picker||!floatBtn)return;
  let userLat=null,userLon=null;
  window.__foodLocationUpdateInternal=(lat,lon)=>{userLat=lat;userLon=lon};
  window.__foodUpdateDistances=(day)=>updateDistances(day);
  const HOTEL_LAT=41.876000, HOTEL_LON=-87.626757;
  let foodOriginMode=localStorage.getItem('chicago_route_origin_mode')||'hotel';
  let foodWatchId=null;
  const cacheKey='chicago_food_geocode_v42';
  function cache(){try{return JSON.parse(localStorage.getItem(cacheKey)||'{}')}catch(e){return {}}}
  function saveCache(x){try{localStorage.setItem(cacheKey,JSON.stringify(x))}catch(e){}}
  function showPicker(){picker.style.display='block';modal.querySelectorAll('.food-panel').forEach(p=>p.classList.remove('active'));title.textContent='¿Qué día quieres ver?';sub.textContent='Selecciona el día y te muestro comida, supermercados y tiendas.'}
  function openDay(day){
    picker.style.display='none';
    modal.querySelectorAll('.food-panel').forEach(p=>p.classList.toggle('active',p.dataset.foodPanel===day));
    title.textContent='Opciones del día '+day;
    sub.textContent='';
    if(userLat!==null) updateDistances(day);
  }
  function open(){showPicker();modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false')}
  function closeModal(){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')}
  function distanceKm(a,b,c,d){const R=6371,p=Math.PI/180,dl=(c-a)*p,dn=(d-b)*p,x=Math.sin(dl/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(dn/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
  function addressOf(card){
    if(card.dataset.address)return card.dataset.address;
    const meta=card.querySelector('.meta');
    if(!meta)return '';
    const m=(meta.innerText||'').match(/📍\s*([^\n]+)/);
    card.dataset.address=m?m[1].trim():'';
    return card.dataset.address;
  }
  async function geocode(address){
    const c=cache();
    if(c[address])return c[address];
    const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q='+encodeURIComponent(address);
    try{const r=await fetch(url,{headers:{'Accept-Language':'en-US,en;q=0.8'}});if(!r.ok)return null;const j=await r.json();if(!j[0])return null;const v={lat:parseFloat(j[0].lat),lon:parseFloat(j[0].lon)};c[address]=v;saveCache(c);return v}catch(e){return null}
  }
  async function updateDistances(day){
    if(userLat===null)return;
    const panel=modal.querySelector('.food-panel.active'); if(!panel)return;
    const cards=[...panel.querySelectorAll('.option-card')];
    let done=0;
    for(const card of cards){
      let el=card.querySelector('.live-distance');
      if(!el){el=document.createElement('span');el.className='live-distance';const meta=card.querySelector('.meta');(meta||card.firstChild).after(el)}
      const addr=addressOf(card);
      if(!addr){el.textContent='📍 Distancia no disponible';continue}
      el.textContent='📍 Calculando distancia…';
      const g=await geocode(addr+', Chicago, IL');
      if(g){el.innerHTML='📍 '+distanceKm(userLat,userLon,g.lat,g.lon).toFixed(1)+' km en línea recta <small>· '+(foodOriginMode==='hotel'?'desde el hospedaje':'desde tu ubicación')+'</small>'}
      else el.innerHTML='📍 Distancia no disponible <small>· usa “Cómo llegar”</small>';
      done++;
      if(done<cards.length) await new Promise(r=>setTimeout(r,1050));
    }
  }
  locBtn?.addEventListener('click',()=>{
    if(!navigator.geolocation){alert('Este navegador no permite obtener la ubicación.');return}
    locBtn.textContent='📍 Obteniendo…';
    navigator.geolocation.getCurrentPosition(pos=>{
      userLat=pos.coords.latitude;userLon=pos.coords.longitude;
      locBtn.textContent='📍 Ubicación activada';
      let status=modal.querySelector('.food-location-status');
      if(!status){status=document.createElement('div');status.className='food-location-status';picker.parentNode.insertBefore(status,picker)}
      status.textContent='📍 Ubicación actual activada · las distancias son aproximadas en línea recta.';
      const active=modal.querySelector('.food-panel.active');
      if(active) updateDistances(active.dataset.foodPanel);
    },()=>{locBtn.textContent='📍 Usar mi ubicación';alert('No se pudo obtener la ubicación. Revisa el permiso de ubicación del navegador.')},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
  });
  floatBtn.addEventListener('click',open);
  close?.addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{if(e.target===modal)closeModal();const day=e.target.closest('[data-food-day]');if(day)openDay(day.dataset.foodDay);if(e.target.closest('[data-food-back]'))showPicker()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))closeModal()});
})();

;

/* v43-fixes-js */
(function(){
  const HOTEL = '24 E Ida B Wells Dr, Chicago, IL 60605';
  let foodOrigin = 'current';

  function getFoodButtons(){
    return [...document.querySelectorAll('[data-food-origin]')];
  }

  function setFoodOrigin(mode){
    foodOrigin = mode;
    getFoodButtons().forEach(b => b.classList.toggle('active', b.dataset.foodOrigin === mode));
    document.querySelectorAll('[data-food-route-btn], .foodtools .route-btn, .option-card .route-btn').forEach(btn => {
      btn.dataset.originMode = mode;
      if(mode === 'hotel'){
        btn.dataset.origin = HOTEL;
        btn.dataset.originLabel = 'Hospedaje';
      }else{
        btn.dataset.origin = '';
        btn.dataset.originLabel = 'Ubicación actual';
      }
    });
  }

  document.addEventListener('click', function(e){
    const b = e.target.closest('[data-food-origin]');
    if(b){
      e.preventDefault();
      e.stopPropagation();
      setFoodOrigin(b.dataset.foodOrigin);
      return;
    }

    const routeBtn = e.target.closest('.foodtools .route-btn, .option-card .route-btn, [data-food-route-btn]');
    if(routeBtn && window.openRouteModal){
      routeBtn.dataset.originMode = foodOrigin;
      routeBtn.dataset.origin = foodOrigin === 'hotel' ? HOTEL : '';
      routeBtn.dataset.originLabel = foodOrigin === 'hotel' ? 'Hospedaje' : 'Ubicación actual';
    }
  }, true);

  /* v48: no inicializar GPS aquí; v45 es el único controlador de ubicación. */
})();

;

/* v44-location-controller-disabled */
/* Desactivado en v48: evita doble geolocalización y conflictos de origen. */

;

/* v45-location-authority */
(function(){
  const HOTEL={lat:41.876000,lon:-87.626757,label:'🏨 desde el hospedaje'};
  const STORAGE='chicago_route_origin_mode';
  const GEO_CACHE='chicago_food_geocode_v45';
  let mode=localStorage.getItem(STORAGE)||'hotel';
  let current=null;
  let watchId=null;
  let activeDay=null;
  let updating=false;

  const modal=()=>document.getElementById('foodModal');
  const panel=()=>modal()?.querySelector('.food-panel.active');
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function cacheGet(){try{return JSON.parse(localStorage.getItem(GEO_CACHE)||'{}')}catch(e){return {}}}
  function cacheSet(x){try{localStorage.setItem(GEO_CACHE,JSON.stringify(x))}catch(e){}}

  function haversine(a,b,c,d){
    const R=6371, p=Math.PI/180, dLat=(c-a)*p, dLon=(d-b)*p;
    const x=Math.sin(dLat/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
  }

  function ensureStatus(){
    const m=modal(); if(!m)return null;
    let st=m.querySelector('.v45-food-status');
    if(!st){
      st=document.createElement('div'); st.className='v45-food-status';
      const picker=document.getElementById('foodDayPicker');
      if(picker) picker.parentNode.insertBefore(st,picker);
    }
    st.textContent=mode==='hotel'
      ? '🏨 Distancias desde el hospedaje · línea recta'
      : current
        ? '📍 Distancias desde tu ubicación actual · línea recta'
        : '📍 Esperando tu ubicación actual…';
    return st;
  }

  function setActiveOriginButtons(){
    document.querySelectorAll('[data-origin-mode]').forEach(b=>b.classList.toggle('active',b.dataset.originMode===mode));
  }

  function addressFor(card){
    const btn=card.querySelector('.food-route-btn, .route-btn');
    if(btn?.dataset.destination) return btn.dataset.destination;
    const meta=card.querySelector('.meta');
    const text=meta?.textContent||'';
    const m=text.match(/📍\s*([^\n]+?)(?:\n|$)/);
    return m?m[1].trim():'';
  }

  async function geocode(address){
    if(!address)return null;
    const cache=cacheGet();
    if(cache[address])return cache[address];
    try{
      const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q='+encodeURIComponent(address);
      const r=await fetch(url,{headers:{'Accept':'application/json'}});
      if(!r.ok)return null;
      const j=await r.json();
      if(!j[0])return null;
      const v={lat:Number(j[0].lat),lon:Number(j[0].lon)};
      cache[address]=v; cacheSet(cache); return v;
    }catch(e){return null}
  }

  function cardDistance(card,coords){
    let el=card.querySelector('.v45-live-distance');
    if(!el){
      el=document.createElement('div'); el.className='v45-live-distance';
      const meta=card.querySelector('.meta');
      if(meta) meta.insertAdjacentElement('afterend',el); else card.insertBefore(el,card.firstChild);
    }
    const target=card.__v45coords;
    if(!coords){el.textContent='📍 Esperando ubicación…';return;}
    if(!target){el.textContent='📍 Calculando…';return;}
    const km=haversine(coords.lat,coords.lon,target.lat,target.lon);
    el.innerHTML='📍 <strong>'+km.toFixed(1)+' km</strong> <span>en línea recta · '+esc(mode==='hotel'?'desde el hospedaje':'desde tu ubicación')+'</span>';
  }

  async function updateDay(day){
    activeDay=String(day);
    const p=modal()?.querySelector('.food-panel[data-food-panel="'+day+'"]');
    if(!p)return;
    const cards=[...p.querySelectorAll('.option-card')];
    const coords=mode==='hotel'?HOTEL:current;
    cards.forEach(c=>cardDistance(c,coords));
    // Fill uncached coordinates sequentially to respect the public geocoder's rate limit.
    for(const card of cards){
      const addr=addressFor(card);
      if(!addr)continue;
      if(!card.__v45coords) card.__v45coords=await geocode(addr);
      cardDistance(card,coords);
      await new Promise(r=>setTimeout(r,1050));
    }
  }

  function refreshVisible(){ if(activeDay) updateDay(activeDay); }

  function stopWatch(){
    if(watchId!==null && navigator.geolocation){navigator.geolocation.clearWatch(watchId);watchId=null;}
  }

  function startWatch(){
    if(!navigator.geolocation){current=null;ensureStatus();refreshVisible();return;}
    stopWatch();
    const apply=pos=>{
      current={lat:pos.coords.latitude,lon:pos.coords.longitude};
      ensureStatus(); refreshVisible();
    };
    navigator.geolocation.getCurrentPosition(apply,err=>{
      current=null; ensureStatus(); refreshVisible();
    },{enableHighAccuracy:true,maximumAge:0,timeout:15000});
    watchId=navigator.geolocation.watchPosition(apply,()=>{}, {enableHighAccuracy:true,maximumAge:10000,timeout:20000});
  }

  function setMode(next){
    mode=next==='current'?'current':'hotel';
    localStorage.setItem(STORAGE,mode);
    setActiveOriginButtons();
    if(mode==='hotel'){
      stopWatch(); current=null; ensureStatus(); refreshVisible();
    }else{
      ensureStatus(); startWatch();
    }
    // Route buttons now follow the same single origin selector.
    document.querySelectorAll('.option-card .route-btn').forEach(b=>{
      b.removeAttribute('data-force-current');
      b.dataset.origin=mode==='hotel'?'24 E Ida B Wells Dr, Chicago, IL 60605':'';
      b.dataset.originLabel=mode==='hotel'?'Hospedaje':'Ubicación actual';
    });
  }

  // Capture the existing top selector and make it the sole source of truth.
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-origin-mode]');
    if(!b)return;
    e.preventDefault(); e.stopImmediatePropagation();
    setMode(b.dataset.originMode);
  },true);

  // Whenever a food day opens, update its distances.
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-food-day]');
    if(b){setTimeout(()=>{activeDay=b.dataset.foodDay;ensureStatus();updateDay(activeDay)},80);}
  },true);

  // Keep the top selector active immediately and fix the route buttons.
  setMode(mode);
  window.__v45SetFoodDay=day=>{activeDay=String(day);updateDay(activeDay)};
})();
