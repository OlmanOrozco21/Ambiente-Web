/* food-v2-premium-js */
(function(){
  'use strict';

  const modal=document.getElementById('foodModal');
  if(!modal) return;

  const HOTEL_LABEL='Hospedaje';
  const HOTEL_ADDR='24 E Ida B Wells Dr, Chicago, IL 60605';
  const GEO_KEY='food_v2_geo_cache';
  const ROUTE_KEY='food_v2_route_cache';
  const HOTEL={lat:41.876000,lon:-87.626757};
  let mode=localStorage.getItem('chicago_route_origin_mode')||'hotel';
  let current=null;
  let activeCategory='';
  let activeDay='all';
  let watchId=null;
  let cards=[];
  let places=[];

  const CATEGORY={
    breakfast:{
      key:'breakfast',icon:'☕',title:'Desayuno & café',
      desc:'Café, bagels, brunch y opciones para empezar el día.',
      image:'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=82'
    },
    fast:{
      key:'fast',icon:'🍔',title:'Comida rápida',
      desc:'Opciones rápidas, económicas y casuales para el camino.',
      image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=82'
    },
    chicago:{
      key:'chicago',icon:'🌭',title:'Chicago clásico',
      desc:'Italian beef, hot dogs, pizza y los sabores más típicos.',
      image:'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=82'
    },
    market:{
      key:'market',icon:'🛒',title:'Supermercados',
      desc:'Mercados y supermercados para snacks, comida y compras.',
      image:'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=82'
    },
    shops:{
      key:'shops',icon:'🛍️',title:'Tiendas',
      desc:'Souvenirs, descuentos, centros comerciales y compras.',
      image:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=82'
    }
  };

  const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function classify(card){
    const all=normalize(
      (card.querySelector('b')?.textContent||'')+' '+
      (card.querySelector('.meta')?.textContent||'')+' '+
      (card.querySelector('.tag')?.textContent||'')
    );
    if(/trader joe|jewel[- ]?osco|whole foods|mariano|go grocer|park to shop|88 marketplace|h mart|north loop market|south loop market|urban pantry|totto.?s market|supermarket|grocery|market\b/.test(all)) return 'market';
    if(/harry potter|nike\b|adidas|uniqlo|h&m|macy|burlington|ross dress|nordstrom|marshalls|target\b|my chicago|souvenir|shop|shopping|novelty|discount|tienda|retail|outlet/.test(all)) return 'shops';
    if(/cafe|coffee|breakfast|desayuno|yolk|beatrix|bagel|cafecito|holy bagels/.test(all)) return 'breakfast';
    if(/italian beef|portillo|hot dog|devil dawgs|billy goat|pizza|giordano|gino.?s east|lou malnati|pequod|chicago classic|chicago \/ rapido|chicago clasico/.test(all)) return 'chicago';
    return 'fast';
  }

  function getCache(key){
    try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(e){return {}}
  }
  function saveCache(key,val){
    try{localStorage.setItem(key,JSON.stringify(val))}catch(e){}
  }

  function addressFor(card){
    const b=card.querySelector('.route-btn,[data-destination]');
    if(b?.dataset.destination)return b.dataset.destination;
    const m=card.querySelector('.meta')?.textContent||'';
    const x=m.match(/📍\s*([^\n]+)/);
    return x?x[1].trim():'';
  }

  function nameFor(card){return (card.querySelector('b')?.textContent||'Lugar').trim()}

  function priceFor(card){
    return card.querySelector('.price')?.textContent?.trim()||'Precio aprox. no indicado';
  }

  function dayFor(panel){
    const btn=document.querySelector(`[data-food-day="${panel.dataset.foodPanel}"] strong`);
    if(btn){
      const raw=btn.textContent.trim();
      return raw.replace(/^Día\s+\d+\s*[·•-]\s*/i,'').trim();
    }
    return 'Recorrido';
  }

  function collectPlaces(){
    const all=[];
    document.querySelectorAll('#foodModal .food-panel').forEach(panel=>{
      const dayId=String(panel.dataset.foodPanel||'');
      const dayLabel=`Día ${dayId}`;
      const dayName=dayFor(panel);
      panel.querySelectorAll('.option-card').forEach(card=>{
        const name=nameFor(card), address=addressFor(card);
        if(!name || !address)return;
        const signature=normalize(name)+'|'+normalize(address);
        const existing=all.find(x=>x.signature===signature);
        if(existing){
          if(!existing.days.some(d=>d.id===dayId)) existing.days.push({id:dayId,label:dayLabel,name:dayName});
          return;
        }
        const clone=card.cloneNode(true);
        all.push({
          signature,name,address,price:priceFor(card),category:classify(card),
          dayIds:[dayId],
          days:[{id:dayId,label:dayLabel,name:dayName}],
          meta:card.querySelector('.meta')?.innerHTML||'',
          clone
        });
      });
    });
    return all;
  }

  function stripCategoryText(meta){
    return String(meta||'')
      .replace(/<br\s*\/?>\s*Categoría original:[^<]*/ig,'')
      .replace(/Categoría original:[^<]*/ig,'')
      .replace(/^📍\s*/,'📍 ')
      .trim();
  }

  function buildShell(){
    modal.classList.add('food-v2-modal');
    const old=[...modal.children].filter(x=>!x.classList.contains('food-v2-shell'));
    old.forEach(x=>x.style.display='none');

    const shell=document.createElement('div');
    shell.className='food-v2-shell';
    shell.innerHTML=`
      <div class="food-v2-head">
        <div>
          <div class="food-v2-kicker">Chicago · Food Guide</div>
          <h3 class="food-v2-title">¿Qué te apetece?</h3>
          <p class="food-v2-sub">Cinco categorías claras. Menos repetición y más fácil encontrar algo cerca de tu recorrido.</p>
        </div>
        <button class="food-v2-close" type="button" aria-label="Cerrar">×</button>
      </div>

      <div class="food-v2-origin">
        <div class="food-v2-origin-copy">
          <b>📍 Distancias y rutas</b>
          <span class="food-v2-origin-label">Calculando desde el hospedaje</span>
        </div>
        <div class="food-v2-origin-actions">
          <button type="button" class="food-v2-origin-btn" data-v2-origin="hotel">🏨 Hospedaje</button>
          <button type="button" class="food-v2-origin-btn" data-v2-origin="current">📍 Mi ubicación</button>
        </div>
      </div>

      <div class="food-v2-home">
        <div class="food-v2-category-grid"></div>
        <div class="food-v2-note">Toca una categoría para ver los lugares. Dentro puedes filtrar por día y cada opción conserva <strong>Cómo llegar</strong>, fotos y menú cuando existen.</div>
      </div>

      <section class="food-v2-results">
        <button class="food-v2-back" type="button">← Volver a categorías</button>
        <div class="food-v2-results-head">
          <div>
            <div class="food-v2-results-kicker"></div>
            <div class="food-v2-results-title"></div>
            <div class="food-v2-results-desc"></div>
          </div>
        </div>
        <div class="food-v2-daybar"></div>
        <div class="food-v2-list"></div>
        <div class="food-v2-footer-tip">💡 La distancia se muestra en kilómetros. Cambia el origen arriba para comparar desde el hospedaje o desde tu ubicación actual.</div>
      </section>
    `;
    modal.appendChild(shell);

    shell.querySelector('.food-v2-close').addEventListener('click',()=>document.getElementById('foodClose')?.click());
    shell.querySelector('.food-v2-back').addEventListener('click',showHome);
    shell.querySelectorAll('[data-v2-origin]').forEach(btn=>{
      btn.addEventListener('click',()=>setOrigin(btn.dataset.v2Origin));
    });
    return shell;
  }

  function buildCategoryCards(shell){
    const grid=shell.querySelector('.food-v2-category-grid');
    grid.innerHTML='';
    Object.values(CATEGORY).forEach(c=>{
      const count=places.filter(p=>p.category===c.key).length;
      if(!count)return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='food-v2-category';
      btn.dataset.category=c.key;
      btn.innerHTML=`
        <div class="food-v2-category-bg" style="background-image:url('${c.image}')"></div>
        <div class="food-v2-arrow">›</div>
        <div class="food-v2-category-content">
          <div class="food-v2-category-icon">${c.icon}</div>
          <div class="food-v2-category-title">${c.title}</div>
          <div class="food-v2-category-desc">${c.desc}</div>
          <div class="food-v2-count">${count} opciones</div>
        </div>`;
      btn.addEventListener('click',()=>showCategory(c.key));
      grid.appendChild(btn);
    });
  }

  function setOriginButtons(){
    document.querySelectorAll('#foodModal [data-v2-origin]').forEach(b=>b.classList.toggle('active',b.dataset.v2Origin===mode));
    const label=document.querySelector('#foodModal .food-v2-origin-label');
    if(label) label.textContent=mode==='hotel'?'Calculando desde el hospedaje':'Calculando desde tu ubicación actual';
  }

  function showHome(){
    activeCategory='';
    activeDay='all';
    const shell=document.querySelector('#foodModal .food-v2-shell');
    if(!shell)return;
    shell.querySelector('.food-v2-home').style.display='block';
    shell.querySelector('.food-v2-results').classList.remove('active');
    shell.querySelector('.food-v2-title').textContent='¿Qué te apetece?';
    shell.querySelector('.food-v2-sub').textContent='Cinco categorías claras. Menos repetición y más fácil encontrar algo cerca de tu recorrido.';
    setOriginButtons();
  }

  function dayNamesForCategory(cat){
    const set=new Map();
    places.filter(p=>p.category===cat).forEach(p=>{
      p.days.forEach(d=>{if(!set.has(d.id))set.set(d.id,d)})
    });
    return [...set.values()].sort((a,b)=>+a.id-+b.id);
  }

  function showCategory(cat){
    activeCategory=cat; activeDay='all';
    const shell=document.querySelector('#foodModal .food-v2-shell');
    if(!shell)return;
    const c=CATEGORY[cat];
    shell.querySelector('.food-v2-home').style.display='none';
    shell.querySelector('.food-v2-results').classList.add('active');
    shell.querySelector('.food-v2-results-kicker').textContent='Categoría';
    shell.querySelector('.food-v2-results-title').textContent=c.icon+' '+c.title;
    shell.querySelector('.food-v2-results-desc').textContent=c.desc;

    const daybar=shell.querySelector('.food-v2-daybar');
    daybar.innerHTML='';
    const allBtn=document.createElement('button');
    allBtn.className='food-v2-daybtn active'; allBtn.dataset.day='all'; allBtn.textContent='Todos';
    daybar.appendChild(allBtn);
    dayNamesForCategory(cat).forEach(d=>{
      const b=document.createElement('button');
      b.className='food-v2-daybtn'; b.dataset.day=d.id; b.textContent=d.label;
      daybar.appendChild(b);
    });
    daybar.querySelectorAll('.food-v2-daybtn').forEach(b=>b.addEventListener('click',()=>{
      activeDay=b.dataset.day;
      daybar.querySelectorAll('.food-v2-daybtn').forEach(x=>x.classList.toggle('active',x===b));
      renderCards();
    }));
    renderCards();
  }

  function renderCards(){
    const shell=document.querySelector('#foodModal .food-v2-shell');
    const list=shell.querySelector('.food-v2-list');
    list.innerHTML='';
    const filtered=places.filter(p=>p.category===activeCategory && (activeDay==='all'||p.dayIds.includes(activeDay)));
    if(!filtered.length){
      list.innerHTML='<div class="food-v2-empty">No hay opciones para ese día.</div>';
      return;
    }
    filtered.forEach((p)=>{
      const el=document.createElement('article');
      el.className='food-v2-card';
      const dayText=p.days.map(d=>d.label).join(' · ');
      const meta=stripCategoryText(p.meta);
      const route= p.clone.querySelector('.route-btn');
      const photo=p.clone.querySelector('.photo-link');
      const menu=p.clone.querySelector('.menu-link');
      const routeBtn=route?.cloneNode(true);
      if(routeBtn){
        routeBtn.classList.add('v2-route-btn');
        routeBtn.textContent='🗺️ Cómo llegar';
        routeBtn.removeAttribute('style');
      }
      const photoHtml=photo?`<a href="${photo.getAttribute('href')}" target="_blank" rel="noopener">📷 Fotos</a>`:'<span></span>';
      const menuHtml=menu?`<a href="${menu.getAttribute('href')}" target="_blank" rel="noopener">🍽️ Menú</a>`:'<span></span>';
      el.innerHTML=`
        <div class="food-v2-card-top">
          <div class="food-v2-card-day">${dayText}</div>
          <div class="food-v2-card-name">${escapeHtml(p.name)}</div>
          <div class="food-v2-card-meta">${meta}</div>
          <div class="food-v2-card-price">${escapeHtml(p.price)}</div>
        </div>
        <div class="food-v2-distance" data-v2-distance="${escapeHtmlAttr(p.signature)}">📍 Calculando distancia…</div>
        <div class="food-v2-actions"></div>
      `;
      const actions=el.querySelector('.food-v2-actions');
      if(routeBtn){
        actions.appendChild(routeBtn);
        routeBtn.addEventListener('click',e=>{
          routeBtn.dataset.originMode=mode;
          routeBtn.dataset.origin=mode==='hotel'?HOTEL_ADDR:'';
          routeBtn.dataset.originLabel=mode==='hotel'?HOTEL_LABEL:'Ubicación actual';
        });
      } else {
        const s=document.createElement('span'); actions.appendChild(s);
      }
      actions.insertAdjacentHTML('beforeend',photoHtml);
      actions.insertAdjacentHTML('beforeend',menuHtml);
      list.appendChild(el);
      p.__view=el;
      p.__distance=el.querySelector('.food-v2-distance');
    });
    updateVisibleDistances(filtered);
  }

  function escapeHtml(v){
    return String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function escapeHtmlAttr(v){return escapeHtml(v).replace(/\s/g,' ');}

  function haversine(a,b){
    const R=6371, rad=Math.PI/180, dLat=(b.lat-a.lat)*rad, dLon=(b.lon-a.lon)*rad;
    const x=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
    return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
  }

  async function geocode(address){
    const cache=getCache(GEO_KEY);
    if(cache[address])return cache[address];
    try{
      const u='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q='+encodeURIComponent(address);
      const r=await fetch(u,{headers:{Accept:'application/json'}});
      if(!r.ok)return null;
      const j=await r.json();
      if(!j[0])return null;
      const v={lat:+j[0].lat,lon:+j[0].lon};
      cache[address]=v; saveCache(GEO_KEY,cache); return v;
    }catch(e){return null}
  }

  async function updateVisibleDistances(list){
    const origin=mode==='hotel'?HOTEL:current;
    for(const p of list){
      const el=p.__distance;if(!el)continue;
      if(!origin){
        el.innerHTML='📍 <small>Activa “Mi ubicación” para calcular desde donde estás.</small>';
        continue;
      }
      const target=await geocode(p.address);
      if(!target){
        el.innerHTML='📍 <small>Distancia no disponible · usa Cómo llegar.</small>';
        continue;
      }
      const km=haversine(origin,{lat:target.lat,lon:target.lon});
      el.innerHTML=`📍 <strong>≈ ${km.toFixed(1)} km</strong> <small>· ${mode==='hotel'?'desde el hospedaje':'desde tu ubicación'}</small>`;
      await new Promise(r=>setTimeout(r,180));
    }
  }

  function applyCurrent(p){
    current={lat:p.coords.latitude,lon:p.coords.longitude};
    if(activeCategory) renderCards();
  }

  function setOrigin(next){
    mode=next==='current'?'current':'hotel';
    localStorage.setItem('chicago_route_origin_mode',mode);
    setOriginButtons();
    document.querySelectorAll('#foodModal .v2-route-btn').forEach(btn=>{
      btn.dataset.originMode=mode;
      btn.dataset.origin=mode==='hotel'?HOTEL_ADDR:'';
      btn.dataset.originLabel=mode==='hotel'?HOTEL_LABEL:'Ubicación actual';
    });
    if(mode==='current' && navigator.geolocation){
      navigator.geolocation.getCurrentPosition(applyCurrent,()=>{},{
        enableHighAccuracy:true,maximumAge:60000,timeout:12000
      });
      if(watchId!==null)navigator.geolocation.clearWatch(watchId);
      watchId=navigator.geolocation.watchPosition(applyCurrent,()=>{},{
        enableHighAccuracy:true,maximumAge:10000,timeout:20000
      });
    }else if(watchId!==null && navigator.geolocation){
      navigator.geolocation.clearWatch(watchId);watchId=null;current=null;
      if(activeCategory)renderCards();
    }else if(activeCategory){renderCards();}
  }

  function init(){
    places=collectPlaces();
    if(!places.length)return;
    const shell=buildShell();
    buildCategoryCards(shell);
    setOriginButtons();
    showHome();

    // Sync with the existing modal open/close system.
    const observer=new MutationObserver(()=>{
      if(!modal.classList.contains('hidden')){
        setOriginButtons();
      }
    });
    observer.observe(modal,{attributes:true,attributeFilter:['class']});

    // Ensure the original food trigger opens our redesigned UI.
    document.addEventListener('click',e=>{
      if(e.target.closest('.food-float')){
        setTimeout(()=>showHome(),20);
      }
    },true);

    // Clicking outside closes the redesigned modal.
    modal.addEventListener('click',e=>{
      if(e.target===modal) document.getElementById('foodClose')?.click();
    },true);

    setOrigin(mode);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();

;

/* v143-food-categories-by-day */
(function(){
  const modal=document.getElementById('foodModal'); if(!modal)return;
  const box=modal.querySelector('.food-box'); if(!box)return;
  const panels=[...modal.querySelectorAll('.food-panel')];
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  const dayInfo={};
  panels.forEach(p=>{
    const day=String(p.dataset.foodPanel||'');
    const title=clean(p.querySelector('.food-selected-title')?.textContent||('Día '+day));
    dayInfo[day]=title;
  });

  const raw=[];
  panels.forEach(panel=>{
    const day=String(panel.dataset.foodPanel||'');
    panel.querySelectorAll('.option-card').forEach(card=>{
      const route=card.querySelector('.route-btn'), photos=card.querySelector('.photo-link'), menu=card.querySelector('.menu-link');
      const name=clean(card.querySelector('b')?.textContent||'Lugar'); if(!name)return;
      const meta=clean(card.querySelector('.meta')?.textContent||'');
      const address=route?.dataset.destination||((meta.match(/📍\s*([^·]+?)(?:\s{2,}|$)/)||[])[1]||'').trim();
      raw.push({day,name,meta,address,price:clean(card.querySelector('.price')?.textContent),tag:clean(card.querySelector('.tag')?.textContent),routeAttrs:route?Object.fromEntries([...route.attributes].map(a=>[a.name,a.value])):null,photo:photos?.href||'',menu:menu?.href||''});
    });
  });

  function category(x){
    const all=normalize([x.name,x.meta,x.tag].join(' '));
    if(/trader joe|jewel[- ]?osco|whole foods|mariano|go grocer|park to shop|88 marketplace|h mart|north loop market|south loop market|urban pantry|totto.?s market|supermarket|grocery|grocer\b/.test(all))return 'market';
    if(/harry potter|nike\b|adidas|uniqlo|h&m|macy|burlington|ross dress|nordstrom|marshalls|target\b|my chicago|souvenir|novelty|shopping|discount|shop\b|retail|outlet|store\b/.test(all))return 'shops';
    if(/breakfast|desayuno|coffee|cafe\b|café|cafecito|yolk|beatrix|bagel|brunch/.test(all))return 'breakfast';
    if(/italian beef|portillo|hot dog|devil dawgs|billy goat|giordano|gino.?s east|lou malnati|pequod|deep dish|chicago classic|chicago clasico|pizza/.test(all))return 'classic';
    return 'fast';
  }
  const cats={
    nearby:{label:'Cerca de tu ruta',emoji:'◎',desc:'Sucursales revisadas, junto a las paradas del día'},
    breakfast:{label:'Desayunos',emoji:'☕',desc:'Café · brunch · bagels',image:'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1400&q=88'},
    fast:{label:'Comida rápida',emoji:'🍔',desc:'Rápido · casual · económico',image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=88'},
    classic:{label:'Chicago clásico',emoji:'🌭',desc:'Pizza · hot dogs · sabores locales',image:'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1400&q=88'},
    market:{label:'Supermercados',emoji:'🛒',desc:'Agua · snacks · provisiones',image:'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=88'},
    shops:{label:'Tiendas',emoji:'🛍️',desc:'Compras · souvenirs · ropa',image:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=88'}
  };

  // Deduplicate places, but keep every itinerary day where the place appears.
  const map=new Map();
  raw.forEach(x=>{
    x.cat=category(x);
    const key=normalize(x.name)+'|'+normalize(x.address);
    if(!map.has(key)) map.set(key,{...x,days:[x.day]});
    else {const y=map.get(key); if(!y.days.includes(x.day))y.days.push(x.day);}
  });
  for(const pick of guideFoodPicks){
    const key=normalize(pick.legacyName||pick.name)+'|'+normalize(pick.legacyAddress||pick.address);
    const saved=map.get(key);
    for(const alias of pick.aliases||[])map.delete(normalize(alias)+'|'+normalize(pick.address));
    map.set(key,{...saved,...pick,days:[...new Set([...(saved?.days||[]),pick.day])]});
  }
  const items=[...map.values()].sort((a,b)=>Number(!!b.source)-Number(!!a.source)||Number(a.days[0])-Number(b.days[0])||a.name.localeCompare(b.name));
  const inCategory=(place,cat)=>cat==='nearby'?!!place.source:place.cat===cat;
  const icons={breakfast:'☕',fast:'🍔',classic:'🌭',market:'🛒',shops:'🛍️'};
  const stopOrigins={
    1:[['d1s02','Chicago Cultural Center'],['d1s01','Millennium Park · The Bean'],['d1s03','Daley Plaza']],
    2:[['d2s01','Shedd Aquarium'],['d2s03','Field Museum'],['d2s06','United Center']],
    3:[['d3s01','Lincoln Park Zoo'],['d3s05','Skydeck'],['d3s07','Navy Pier']],
    4:[['d4s01','Riverwalk · rampa de State','N State St & E Wacker Dr, Chicago, IL'],['d4s06','Chinatown Square','2133 S China Pl, Chicago, IL 60616'],['d4s06','Ping Tom Memorial Park'],['d4s08-fireworks','Navy Pier']],
    5:[['d5s02','Harry Potter Shop'],['d5s04','Lincoln Park Zoo · West Gate','Stockton Dr & Webster Ave, Chicago, IL',{lat:41.921850,lon:-87.635539}]],
    7:[['d6s03','Milwaukee Public Market'],['d6s07','Crystal Ridge']],
    8:[['d8-town-square','Town Square'],['d8-hedberg','Hedberg Public Library']]
  };
  let originMode='hotel', activeCat=null, dayStops=[], selectedStop=null;
  const HOTEL={lat:41.876000,lon:-87.626757};
  const GEO_KEY='v143_food_geo_exact', ROUTE_KEY='v143_food_walk_km';
  const getStore=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return {}}};
  const putStore=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  const geoStore=getStore(GEO_KEY),routeStore=getStore(ROUTE_KEY);

  function build(){
    box.classList.add('v143-box','guide-food');
    box.setAttribute('aria-labelledby','guideFoodTitle');
    box.innerHTML=`<div class="v143-shell">
      <header class="v143-head">
        <div class="v143-eyebrow">GUÍA DE INVIERNO / COMER Y COMPRAR</div><h2 id="guideFoodTitle">Comida</h2>
        <p>Elige una categoría para ver los lugares cerca de cada día.</p>
        <button type="button" class="v143-close" id="v143Close" aria-label="Cerrar comida">×</button>
      </header>
      <div class="v143-main">
        <section id="v143Home"><div class="v143-grid" id="v143Cats"></div></section>
        <section id="v143Results" hidden>
          <div class="v143-results-top"><button id="v143Back" type="button" aria-label="Volver a categorías">‹</button><div><h3 id="v143ListTitle" tabindex="-1"></h3><span id="v143ListSub" aria-live="polite"></span></div></div>
          <label class="guide-food-search">Buscar en esta categoría<input id="guideFoodSearch" type="search" placeholder="Nombre o dirección" autocomplete="off"></label>
          <div class="v143-origin" role="group" aria-label="Punto de salida a pie"><button type="button" data-v143-origin="hotel"><b>HI Chicago</b></button><button type="button" data-v143-origin="current"><b>Mi ubicación</b></button><button type="button" data-v143-origin="stop" hidden><b>Desde esta parada</b></button></div>
          <label class="guide-food-stop" hidden>Parada de salida<select id="guideFoodStop"></select></label>
          <p class="guide-walk-hint" hidden></p>
          <div id="v143List"></div>
          <p class="guide-empty" id="guideFoodEmpty" hidden>No hay lugares que coincidan con la búsqueda.</p>
        </section>
      </div>
    </div>`;
  }
  function loadDayStops(day){
    const section=document.getElementById('day'+day);
    dayStops=(stopOrigins[day]||[]).flatMap(([key,name,override,point])=>{
      const stop=section?.querySelector(`[data-key="${key}"]`);
      const address=override||clean(stop?.querySelector('.address .value')?.textContent).split(' — ')[0];
      return stop&&address?[{name,address,point}]:[];
    });
    selectedStop=dayStops[0]||null;
    box.querySelector('#guideFoodStop').replaceChildren(...dayStops.map(({name},i)=>new Option(name,String(i))));
    box.querySelector('[data-v143-origin="stop"]').hidden=!selectedStop;
  }
  function setOriginButtons(){
    box.querySelectorAll('[data-v143-origin]').forEach(b=>{
      const selected=b.dataset.v143Origin===originMode;
      b.classList.toggle('active',selected);
      b.setAttribute('aria-pressed',String(selected));
    });
    box.querySelector('.guide-food-stop').hidden=originMode!=='stop';
    box.querySelector('.guide-walk-hint').textContent=originMode==='stop'
      ?`Ruta a pie desde ${selectedStop.name} · ${selectedStop.address}.`
      :originMode==='hotel'?'Ruta a pie desde HI Chicago, 24 E Ida B. Wells Dr.'
      :'Abre Mapa a pie para ver la distancia y el tiempo desde tu ubicación.';
    box.querySelectorAll('.guide-walk-calc').forEach(button=>button.hidden=originMode==='current');
    box.querySelectorAll('.guide-walking-link').forEach(a=>a.href=walkingUrl(a.closest('.v143-row').__food));
  }
  function renderHome(){
    activeCat=null;
    const ctx=String(window.__foodContextDay||'');
    box.querySelector('#v143Home').hidden=false;
    box.querySelector('#v143Results').hidden=true;
    const categories=Object.entries(cats).map(([k,c],i)=>{
      const n=items.filter(x=>inCategory(x,k)&&(!ctx||x.days.includes(ctx))).length;
      return n?`<button class="v143-cat" type="button" data-v143-cat="${k}" style="--food-enter:${i}">
        <span class="v143-bg"></span><span class="v143-shade"></span>
        <span class="v143-cat-icon" aria-hidden="true">${c.emoji}</span>
        <span class="v143-cat-copy"><b>${c.label}</b><small>${c.desc}</small><em>${n} ${n===1?'lugar':'lugares'}</em></span>
        <span class="v143-arrow" aria-hidden="true">›</span></button>`:'';
    }).join('');
    box.querySelector('#v143Cats').innerHTML=categories||'<p class="guide-empty">No hay lugares guardados para este día. Cambia de día en el itinerario para ver otras opciones.</p>';
    box.querySelector('.v143-main').scrollTop=0;
  }
  function placeQuery(x){return [x.name,x.address].filter(Boolean).join(', ');}
  function menuUrl(x){return x.menu||('https://www.google.com/search?q='+encodeURIComponent(placeQuery(x)+' menú'));}
  function walkingUrl(x){
    const params=new URLSearchParams({api:'1',travelmode:'walking',destination:x.venue?`${x.venue}, ${x.address}`:placeQuery(x)});
    if(originMode==='hotel')params.set('origin','HI Chicago, 24 E Ida B. Wells Dr, Chicago, IL 60605');
    if(originMode==='stop'){
      const {name,address,point}=selectedStop;
      params.set('origin',point?`${point.lat},${point.lon}`:`${name}, ${address}`);
    }
    return 'https://www.google.com/maps/dir/?'+params;
  }
  function addLink(parent,href,text,title,cls){const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener';a.textContent=text;a.title=title;a.className=cls||'';parent.appendChild(a);return a;}
  function dayLabel(day){return dayInfo[day]||('Día '+day);}
  function filterResults(){
    const terms=normalize(box.querySelector('#guideFoodSearch').value).split(' ');
    const visiblePlaces=new Set();
    box.querySelectorAll('.v143-day-group').forEach(group=>{
      let visible=0;
      group.querySelectorAll('.v143-row').forEach(row=>{
        const x=row.__food, text=normalize(`${x.name} ${x.address} ${x.meta} ${x.near||''}`);
        row.hidden=!terms.every(term=>text.includes(term));
        if(!row.hidden){visible++;visiblePlaces.add(x);}
      });
      group.hidden=!visible;
    });
    const total=visiblePlaces.size;
    box.querySelector('#v143ListSub').textContent=`${total} ${total===1?'lugar':'lugares'}`;
    box.querySelector('#guideFoodEmpty').hidden=total!==0;
  }
  function renderResults(cat){
    if(activeCat!==cat)box.querySelector('#guideFoodSearch').value='';
    activeCat=cat;const ctx=window.__foodContextDay?String(window.__foodContextDay):'';const c=cats[cat],list=items.filter(x=>inCategory(x,cat)&&(!ctx||x.days.includes(ctx)));
    box.querySelector('#v143Home').hidden=true;box.querySelector('#v143Results').hidden=false;
    box.querySelector('#v143ListTitle').textContent=c.label;
    const hasAddresses=list.some(x=>x.address);
    box.querySelector('.v143-origin').hidden=!hasAddresses;
    box.querySelector('.guide-walk-hint').hidden=!hasAddresses;
    const el=box.querySelector('#v143List');el.innerHTML='';
    const groups=ctx?[ctx]:[...new Set(list.flatMap(x=>x.days))].sort((a,b)=>Number(a)-Number(b));
    groups.forEach(day=>{
      const group=document.createElement('section');group.className='v143-day-group';
      group.innerHTML=`<div class="v143-day-head"><span>Día ${esc(day)}</span><b>${esc(dayLabel(day).replace(/^Día\s*\d+\s*[·-]?\s*/i,''))}</b></div><div class="v143-day-list"></div>`;
      const gl=group.querySelector('.v143-day-list');
      list.filter(x=>x.days.includes(String(day))).forEach((x,i)=>{
        const row=document.createElement('article');row.className='v143-row';row.dataset.address=x.address;
        if(i<5){row.classList.add('guide-food-arrival');row.style.setProperty('--food-enter',i);}
        const also=x.days.filter(d=>d!==day).sort((a,b)=>Number(a)-Number(b));
        const location=x.source?'Dirección contrastada':x.address?'Dirección de tu lista · sin verificar':'Dirección pendiente';
        const meta=clean(x.meta.replace(/^📍\s*/u,''));
        row.innerHTML=`<div class="v143-thumb" aria-hidden="true"><span>${icons[x.cat]}</span></div>
          <div class="v143-info"><b>${esc(x.name)}</b>
          ${x.near?`<p class="guide-food-near">${esc(x.near)}</p>`:''}
          <small>${esc(x.address&&meta.startsWith(x.address)?meta.slice(x.address.length).trim():meta)}</small>
          ${x.address?`<address class="guide-food-address">${esc(x.address)}</address>`:''}
          <span class="guide-food-location${x.source?' checked':''}">${location}</span>
          ${x.venue?`<small>El mapa puede señalar la entrada de ${esc(x.venue)}, no el local interior.</small>`:''}
          ${x.price?`<span class="guide-food-price">${esc(x.price)}</span>`:''}
          ${x.address?'<div class="v143-distance" role="status"></div>':''}
          ${also.length?`<div class="v143-also">También en el día ${also.join(', ')}</div>`:''}</div>
          <div class="v143-actions"></div>`;
        const a=row.querySelector('.v143-actions');
        if(x.address){
          addLink(a,walkingUrl(x),'Mapa a pie','Abrir ruta peatonal en Google Maps','guide-walking-link');
          const calculate=document.createElement('button');
          calculate.type='button';calculate.className='guide-walk-calc';calculate.textContent='Calcular a pie';
          a.appendChild(calculate);
        }
        if(x.source)addLink(a,x.source,'Ver fuente','Comprobar sucursal y horarios en la fuente','menu-link');
        else if(['breakfast','fast','classic'].includes(x.cat))addLink(a,menuUrl(x),'Menú','Ver menú','menu-link');
        if(x.photo){addLink(a,x.photo,'Fotos','Ver fotos','photo-link')}
        row.__food=x;gl.appendChild(row);
      });
      el.appendChild(group);
    });
    filterResults();setOriginButtons();
  }
  async function getDistanceJson(url,signal){
    const controller=new AbortController();
    const cancel=()=>controller.abort();
    signal.addEventListener('abort',cancel,{once:true});
    const timer=setTimeout(cancel,5000);
    try{
      const response=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal});
      return response.ok?await response.json():null;
    }catch(error){
      if(controller.signal.aborted||error instanceof TypeError||error instanceof SyntaxError)return null;
      throw error;
    }finally{
      clearTimeout(timer);
      signal.removeEventListener('abort',cancel);
    }
  }
  async function geocode(address,signal){if(geoStore[address])return geoStore[address];const u='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q='+encodeURIComponent(address);const j=await getDistanceJson(u,signal);if(!j?.[0])return null;const v={lat:+j[0].lat,lon:+j[0].lon};geoStore[address]=v;putStore(GEO_KEY,geoStore);return v}
  async function walk(o,t,signal){
    const targetKey=t.lat.toFixed(5)+','+t.lon.toFixed(5);
    const key=o===HOTEL?targetKey:`${o.lat.toFixed(5)},${o.lon.toFixed(5)}>${targetKey}`;
    if(routeStore[key])return routeStore[key];
    const payload={locations:[o,t],costing:'pedestrian',units:'kilometers'};
    const j=await getDistanceJson('https://valhalla1.openstreetmap.de/route?json='+encodeURIComponent(JSON.stringify(payload)),signal);
    const s=j?.trip?.summary;
    if(j?.trip?.units!=='kilometers'||!Number.isFinite(s?.length)||!Number.isFinite(s?.time)||s.length<0||s.time<0)return null;
    const v={km:s.length,minutes:Math.max(1,Math.round(s.time/60))};
    routeStore[key]=v;putStore(ROUTE_KEY,routeStore);
    return v;
  }
  let distanceRun;
  function cancelDistance(){
    if(!distanceRun)return;
    distanceRun.controller.abort();
    distanceRun.status.classList.remove('guide-distance-loading');
    distanceRun.status.textContent='';
    distanceRun=null;
  }
  async function calculateDistance(row){
    cancelDistance();
    const status=row.querySelector('.v143-distance'),controller=new AbortController(),{signal}=controller;
    distanceRun={controller,status};
    status.classList.remove('guide-walk-ready');
    status.classList.add('guide-distance-loading');
    function finish(text,ready=false){
      if(signal.aborted)return;
      distanceRun=null;
      status.classList.remove('guide-distance-loading');
      status.classList.toggle('guide-walk-ready',ready);
      status.textContent=text;
    }
    status.textContent='Calculando ruta a pie…';
    const x=row.__food;
    try{
      const origin=originMode==='stop'?(selectedStop.point||await geocode(selectedStop.address,signal)):HOTEL;
      if(signal.aborted)return;
      if(!Number.isFinite(origin?.lat)||!Number.isFinite(origin?.lon)){
        finish('No se pudo localizar la parada. Prueba Mapa a pie.');
        return;
      }
      const target=await geocode(x.address,signal);
      if(signal.aborted)return;
      const route=target&&Number.isFinite(target.lat)&&Number.isFinite(target.lon)?await walk(origin,target,signal):null;
      finish(route?`A pie: ≈ ${new Intl.NumberFormat('es',{maximumFractionDigits:2}).format(route.km)} km · ${route.minutes} min${x.venue?' hasta el recinto':''}`:'Ruta a pie no disponible aquí. Prueba Mapa a pie.',!!route);
    }catch(error){
      console.warn('No se pudo calcular la ruta a pie.',error.name);
      finish('Ruta a pie no disponible aquí. Prueba Mapa a pie.');
    }
  }
  function closeGuideFood(){
    cancelDistance();
    document.querySelector('.v106 [data-mode="food"]')?.focus({preventScroll:true});
    modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');
  }
  function refreshOrigin(){
    cancelDistance();
    box.querySelectorAll('.v143-distance').forEach(el=>{el.textContent='';el.classList.remove('guide-walk-ready');});
    setOriginButtons();
  }
  function setOrigin(m){
    if(m===originMode)return;
    originMode=m;
    refreshOrigin();
  }
  build();renderHome();
  box.querySelector('#guideFoodSearch').addEventListener('input',filterResults);
  box.querySelector('#guideFoodStop').addEventListener('change',e=>{
    selectedStop=dayStops[Number(e.target.value)];
    refreshOrigin();
  });
  box.addEventListener('click',e=>{
    const o=e.target.closest('[data-v143-origin]');
    if(o){setOrigin(o.dataset.v143Origin);return}
    const calculate=e.target.closest('.guide-walk-calc');
    if(calculate&&originMode!=='current'){calculateDistance(calculate.closest('.v143-row'));return}
    const c=e.target.closest('[data-v143-cat]');
    if(c){
      renderResults(c.dataset.v143Cat);
      box.querySelector('.v143-main').scrollTop=0;
      box.querySelector('#v143ListTitle').focus({preventScroll:true});
      return;
    }
    if(e.target.closest('#v143Back')){
      const cat=activeCat;
      cancelDistance();
      renderHome();
      box.querySelector(`[data-v143-cat="${cat}"]`)?.focus();
      return;
    }
    if(e.target.closest('#v143Close'))closeGuideFood();
  });
  document.getElementById('foodFloat')?.addEventListener('click',()=>{
    cancelDistance();
    const day=window.__foodContextDay;
    loadDayStops(day);
    originMode=Number(day)>=7||localStorage.getItem('chicago_route_origin_mode')==='current'?'current':'hotel';
    modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');renderHome();
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape'||modal.classList.contains('hidden')||!modal.contains(e.target))return;
    e.stopPropagation();
    closeGuideFood();
  },true);
})();

;

/* v153-food-modal-clean-js */
(function(){
  'use strict';
  const atlas=document.querySelector('.v106');
  const modal=document.getElementById('foodModal');
  const floatBtn=document.getElementById('foodFloat');
  if(!atlas||!modal||!floatBtn)return;

  function selectedDay(){
    const active=atlas.querySelector('.v106-day.active');
    if(active && active.dataset.day!=null) return String(Number(active.dataset.day)+1);
    const tab=document.querySelector('.v90-daytab.active');
    if(tab && tab.dataset.v90Day) return String(tab.dataset.v90Day);
    return '1';
  }

  function applyContext(day){
    window.__foodContextDay=String(day);
    const h=modal.querySelector('.v143-head h2');
    const p=modal.querySelector('.v143-head p');
    if(h)h.textContent='Comer y comprar';
    if(p)p.textContent='Día '+day+' · Lugares guardados para tu recorrido';
  }

  function openModalForDay(day){
    applyContext(day);
    // Let the original food system build its modal. It already honors __foodContextDay.
    floatBtn.click();
    modal.querySelector('#v143Close')?.focus();
  }

  atlas.addEventListener('click',function(e){
    const btn=e.target.closest('.v106-modes button[data-mode="food"]');
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openModalForDay(selectedDay());
  },true);

  // Selecting a day only changes the atlas selection; it does not open food automatically.
  atlas.querySelectorAll('.v106-day').forEach(function(btn){
    btn.addEventListener('click',function(){
      window.__foodContextDay=String(Number(btn.dataset.day)+1);
    },true);
  });
})();
