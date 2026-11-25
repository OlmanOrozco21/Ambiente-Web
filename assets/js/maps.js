/* day3-extra-transfer-card-handlers */
(function(){
 const pairs=[['.transit-zoo-arrival','zooArrivalModal'],['.transit-sky-navy','skyNavyModal'],['.transit-navy-hotel','navyHotelModal']];
 pairs.forEach(([sel,id])=>{const card=document.querySelector(sel),m=document.getElementById(id);if(card&&m)card.addEventListener('click',e=>{if(e.target.closest('a,button'))return;m.classList.remove('hidden');m.setAttribute('aria-hidden','false')});});
})();

;

/* day3-extra-transfer-modals-script */
(function(){
  const configs={
    'zoo-arrival':{modal:'zooArrivalModal',close:'zaClose',prefix:'za',origin:'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605',stop:'Dearborn & Ida B Wells Drive, Chicago, IL',dest:'Lincoln Park Zoo, 2001 N Clark St, Chicago, IL 60614'},
    'sky-navy':{modal:'skyNavyModal',close:'snClose',prefix:'sn',origin:'Skydeck Chicago, 233 S Wacker Dr, Chicago, IL 60606',stop:'Washington & Franklin, Chicago, IL',dest:'Navy Pier, 600 E Grand Ave, Chicago, IL 60611'},
    'navy-hotel':{modal:'navyHotelModal',close:'nhClose',prefix:'nh',origin:'Navy Pier, 600 E Grand Ave, Chicago, IL 60611',stop:'Navy Pier Terminal, Chicago, IL',dest:'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605',end:'State & Van Buren, Chicago, IL'}
  };
  function enc(x){return encodeURIComponent(x)}
  function open(m){m.classList.remove('hidden');m.setAttribute('aria-hidden','false')}
  function shut(m){m.classList.add('hidden');m.setAttribute('aria-hidden','true')}
  function map(c,which){
    let o=c.origin,d=c.dest,mode='walking';
    if(c.prefix==='za'){
      if(which==='stop'){d=c.stop;mode='walking'}
      else if(which==='zoo'){o='Clark & Armitage, Chicago, IL';d=c.dest;mode='walking'}
      else {d=c.dest;mode='transit'}
    } else if(c.prefix==='sn'){
      if(which==='stop'){d=c.stop;mode='walking'}
      else if(which==='pier'){o='Navy Pier Terminal, Chicago, IL';d=c.dest;mode='walking'}
      else {d=c.dest;mode='transit'}
    } else {
      if(which==='walk-start'){d=c.stop;mode='walking'}
      else if(which==='walk-end'){o=c.end;d=c.dest;mode='walking'}
      else {d=c.dest;mode='transit'}
    }
    const u='https://www.google.com/maps/dir/?api=1&origin='+enc(o)+'&destination='+enc(d)+'&travelmode='+mode;
    const w=window.open(u,'chicagoMapsWindow');if(!w)window.location.assign(u);else{try{w.focus()}catch(e){}}
  }
  Object.values(configs).forEach(c=>{
    const m=document.getElementById(c.modal);if(!m)return;
    document.getElementById(c.close)?.addEventListener('click',()=>shut(m));
    m.addEventListener('click',e=>{if(e.target===m)shut(m)});
    m.querySelectorAll('[data-'+c.prefix+'-map]').forEach(b=>b.addEventListener('click',()=>map(c,b.dataset[c.prefix+'Map'])));
  });
  document.addEventListener('click',e=>{
    const s=e.target.closest('[data-special-route]');if(s){const c=configs[s.dataset.specialRoute];if(c){e.preventDefault();e.stopImmediatePropagation();open(document.getElementById(c.modal));return;}}
    for(const c of Object.values(configs)){
      if(e.target.closest('.transit-'+c.prefix.replace('zoo','zoo-arrival').replace('sky','sky-navy').replace('navy','navy-hotel'))){e.preventDefault();e.stopImmediatePropagation();open(document.getElementById(c.modal));return;}
    }
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')Object.values(configs).forEach(c=>{const m=document.getElementById(c.modal);if(m&&!m.classList.contains('hidden'))shut(m)})});
})();

;

/* transfer-modals-restored */
(function(){
  const arrival=document.getElementById('sheddArrivalModal');
  const united=document.getElementById('sheddUnitedModal');
  function open(m){if(!m)return;m.classList.remove('hidden');m.setAttribute('aria-hidden','false')}
  function close(m){if(!m)return;m.classList.add('hidden');m.setAttribute('aria-hidden','true')}
  document.addEventListener('click',function(e){
    const a=e.target.closest('[data-special-route="shedd-arrival"]');
    if(a){e.preventDefault();e.stopImmediatePropagation();open(arrival);return;}
    const u=e.target.closest('[data-special-route="shedd-united"]');
    if(u){e.preventDefault();e.stopImmediatePropagation();open(united);return;}
    const ca=e.target.closest('.transit-shedd-arrival');
    if(ca){e.preventDefault();e.stopImmediatePropagation();open(arrival);return;}
    const cu=e.target.closest('.transit-shedd-united');
    if(cu){e.preventDefault();e.stopImmediatePropagation();open(united);return;}
  },true);
  document.getElementById('saClose')?.addEventListener('click',()=>close(arrival));
  document.getElementById('suClose')?.addEventListener('click',()=>close(united));
  arrival?.addEventListener('click',e=>{if(e.target===arrival)close(arrival)});
  united?.addEventListener('click',e=>{if(e.target===united)close(united)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){close(arrival);close(united)}});
})();

;

/* generic-transfer-click-script */
(function(){
  function openGeneric(card){
    const key=card?.dataset.routeTargetKey; if(!key)return;
    const stop=document.querySelector('.stop[data-key="'+key+'"]');
    const btn=stop?.querySelector('.route-btn');
    if(btn)btn.click();
  }
  document.addEventListener('click',e=>{
    const card=e.target.closest('.transit-generic');
    if(card){e.preventDefault();e.stopImmediatePropagation();openGeneric(card);return;}
  },true);
  document.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ') && e.target.closest('.transit-generic')){e.preventDefault();openGeneric(e.target.closest('.transit-generic'));}
  });
})();

;

/* uc-hotel-modal-script */
(function(){
  const modal=document.getElementById('ucHotelModal'); if(!modal)return;
  const close=modal.querySelector('#uchClose');
  const origin='United Center, 1901 W Madison St, Chicago, IL 60612';
  const jackson='Jackson & Damen, Chicago, IL';
  const hotel='HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605';
  const michigan='Michigan & Van Buren/Ida B. Wells, Chicago, IL';
  const open=()=>{modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false')};
  const shut=()=>{modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')};
  function map(which){
    let u;
    if(which==='walk-start') u='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(jackson)+'&travelmode=walking';
    else if(which==='walk-end') u='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(michigan)+'&destination='+encodeURIComponent(hotel)+'&travelmode=walking';
    else u='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(hotel)+'&travelmode=transit';
    const w=window.open(u,'chicagoMapsWindow'); if(!w)window.location.assign(u); else{try{w.focus()}catch(e){}}
  }
  document.addEventListener('click',e=>{
    const special=e.target.closest('[data-special-route="uc-hotel"]');
    const card=e.target.closest('.transit-uc-hotel');
    if(special||card){e.preventDefault();e.stopImmediatePropagation();open();return;}
    const m=e.target.closest('[data-uch-map]'); if(m){e.preventDefault();map(m.dataset.uchMap);return;}
  },true);
  close?.addEventListener('click',shut); modal.addEventListener('click',e=>{if(e.target===modal)shut()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))shut()});
})();

;

/* zoo-sky-modal-script */
(function(){
  const modal=document.getElementById('zooSkyModal'); if(!modal)return;
  const close=modal.querySelector('#zooSkyClose');
  const origin='Nature Boardwalk at Lincoln Park Zoo, Chicago, IL 60614';
  const stops={armitage:'Stockton & Armitage, Chicago, IL 60614',webster:'Stockton & Webster, Chicago, IL 60614'};
  const open=()=>{modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false')};
  const shut=()=>{modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')};
  function map(which){
    let u;
    if(which==='full'){
      const destination='Skydeck Chicago, 233 S Wacker Dr, Chicago, IL 60606';
      u='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination)+'&travelmode=transit';
    }else{
      u='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(stops[which])+'&travelmode=walking';
    }
    const w=window.open(u,'chicagoMapsWindow'); if(!w)window.location.assign(u); else{try{w.focus()}catch(e){}}
  }
  document.addEventListener('click',e=>{
    const special=e.target.closest('[data-special-route="zoo-sky"]');
    if(special){e.preventDefault();e.stopImmediatePropagation();open();return;}
    const card=e.target.closest('.transit-zoo-sky');
    if(card&&!e.target.closest('a,button')){e.preventDefault();open();return;}
    const m=e.target.closest('[data-zs-map]'); if(m){e.preventDefault();map(m.dataset.zsMap);return;}
  },true);
  close?.addEventListener('click',shut); modal.addEventListener('click',e=>{if(e.target===modal)shut()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))shut()});
})();

;

(function(){
  const modal=document.getElementById('routeModal');
  const title=document.getElementById('routeTitle');
  const sub=document.getElementById('routeSub');
  const result=document.getElementById('routeResult');
  const walk=document.getElementById('routeWalk');
  const transit=document.getElementById('routeTransit');
  const transitApp=document.getElementById('routeTransitApp');
  const close=document.querySelector('#routeModal .route-close');
  const HOTEL='41.876000,-87.626757';
  let current=null;
  function safeGet(k,f){try{return localStorage.getItem(k)||f}catch(e){return f}}
  function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function provider(){return safeGet('chicago_maps_provider','google')}
  function originMode(){return safeGet('chicago_route_origin_mode','hotel')}
  function providerName(){return provider()==='apple'?'Apple Maps':'Google Maps'}
  function effectiveOrigin(forceCurrent){return forceCurrent?'':(originMode()==='hotel'?HOTEL:'')}
  function originLabel(forceCurrent){return forceCurrent?'📍 Ubicación actual':(originMode()==='hotel'?'🏨 Hospedaje':'📍 Ubicación actual')}
  function renderControls(){
    document.querySelectorAll('[data-map-provider]').forEach(b=>b.classList.toggle('active',b.dataset.mapProvider===provider()));
    document.querySelectorAll('[data-origin-mode]').forEach(b=>b.classList.toggle('active',b.dataset.originMode===originMode()));
    if(walk) walk.querySelector('strong').textContent='🚶 Caminar en '+providerName();
    if(transit) transit.querySelector('strong').textContent='🚌 Transporte en '+providerName();
  }
  function mapUrl(mode,destination,forceCurrent){
    const origin=effectiveOrigin(forceCurrent);
    if(provider()==='apple'){
      return 'https://maps.apple.com/?'+(origin?'saddr='+encodeURIComponent(origin)+'&':'')+'daddr='+encodeURIComponent(destination)+'&dirflg='+(mode==='walking'?'w':'r');
    }
    let u='https://www.google.com/maps/dir/?api=1';
    if(origin) u+='&origin='+encodeURIComponent(origin);
    u+='&destination='+encodeURIComponent(destination)+'&travelmode='+encodeURIComponent(mode);
    return u;
  }
  function transitUrl(destination,forceCurrent){
    const origin=effectiveOrigin(forceCurrent);
    let u='https://www.google.com/maps/dir/?api=1';
    if(origin) u+='&origin='+encodeURIComponent(origin);
    u+='&destination='+encodeURIComponent(destination)+'&travelmode=transit';
    return u;
  }
  function openExternal(url){
    // Abrir Maps en un contexto secundario para conservar el itinerario abierto.
    // Usamos un nombre fijo para reutilizar la misma pestaña/ventana de mapas
    // en lugar de crear una nueva cada vez. El navegador decide si será pestaña
    // o ventana independiente según su configuración.
    const mapWindow = window.open(url, 'chicagoMapsWindow');
    if(!mapWindow){
      // Si el navegador bloquea la ventana secundaria, dejamos la ruta en la
      // pestaña actual como respaldo.
      window.location.assign(url);
      return;
    }
    try{ mapWindow.focus(); }catch(e){}
    if(modal){ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); }
  }
  function openModal(btn){
    const isFood=btn.hasAttribute('data-food-route');
    const forceCurrent=isFood ? (originMode()==='current') : btn.dataset.forceCurrent==='1';
    current={destination:btn.dataset.destination||btn.dataset.accessPoint||'',destinationLabel:btn.dataset.destinationLabel||'Destino',forceCurrent};
    title.textContent=originLabel(forceCurrent)+' → '+current.destinationLabel;
    sub.textContent=forceCurrent?'La ruta parte de tu ubicación actual. Google Maps calculará la ruta y el tiempo reales.':'Elige cómo llegar. Puedes cambiar el origen en Preferencias de mapas.';
    if(isFood)sub.textContent=`Destino: ${current.destination}. Comprueba el número y la sucursal al abrir el mapa.`;
    result.style.display='none'; result.innerHTML='';
    renderControls(); modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
  }
  document.addEventListener('click',function(e){
    const route=e.target.closest('.route-btn');
    if(route){e.preventDefault();openModal(route);return}
    const p=e.target.closest('[data-map-provider]');
    if(p){safeSet('chicago_maps_provider',p.dataset.mapProvider);renderControls();if(current) title.textContent=originLabel(current.forceCurrent)+' → '+current.destinationLabel;return}
    const o=e.target.closest('[data-origin-mode]');
    if(o){safeSet('chicago_route_origin_mode',o.dataset.originMode);renderControls();if(current&&!current.forceCurrent) title.textContent=originLabel(false)+' → '+current.destinationLabel;return}
  },true);
  walk?.addEventListener('click',function(e){e.preventDefault();if(current)openExternal(mapUrl('walking',current.destination,current.forceCurrent));});
  transit?.addEventListener('click',function(e){e.preventDefault();if(current)openExternal(mapUrl('transit',current.destination,current.forceCurrent));});
  transitApp?.addEventListener('click',function(e){e.preventDefault();if(current)openExternal(transitUrl(current.destination,current.forceCurrent));});
  close?.addEventListener('click',()=>{modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')});
  modal?.addEventListener('click',e=>{if(e.target===modal){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal&&!modal.classList.contains('hidden')){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')}});
  renderControls();
})();
