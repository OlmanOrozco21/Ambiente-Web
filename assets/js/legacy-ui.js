/* v90-premium-ui-js */
(function(){
  const app=document.querySelector('main.app');
  if(!app || document.getElementById('v90Topbar')) return;

  const days=[...app.querySelectorAll('.day')];
  const dayNames=days.map((d,i)=>{
    const h=d.querySelector('h2')?.textContent?.trim()||('Día '+(i+1));
    const m=h.match(/Día\s+(\d+)/i);
    const short=h.replace(/^Día\s+\d+\s*[—-]\s*/i,'').split('|')[0].trim();
    return {el:d,num:m?m[1]:String(i+1),short};
  });

  // Top chrome
  const top=document.createElement('div');
  top.className='v90-topbar';
  top.id='v90Topbar';
  top.innerHTML=`
    <div class="v90-brand">
      <div class="v90-logo">CHI</div>
      <div class="v90-brand-copy">
        <strong>TRIP OS · 2026</strong>
        <span>Chicago → Milwaukee · tu centro de mando</span>
      </div>
    </div>
    <div class="v90-top-actions">
      <button class="v90-chipbtn" id="v90FocusBtn" type="button">◒ <span>Enfoque</span></button>
      <button class="v90-chipbtn primary" id="v90NextTopBtn" type="button">↳ <span>Siguiente</span></button>
    </div>`;
  app.insertBefore(top,app.firstChild);

  const hero=app.querySelector('.hero');
  if(hero){
    const kicker=document.createElement('div');
    kicker.className='v90-hero-kicker';
    kicker.textContent='WINTER EDITION · 2026';
    hero.appendChild(kicker);
    const grid=document.createElement('div');
    grid.className='v90-hero-grid';
    grid.innerHTML='<i></i><i></i><i></i><i></i><i></i>';
    hero.appendChild(grid);
  }

  // Day rail
  const rail=document.createElement('nav');
  rail.className='v90-dayrail';
  rail.setAttribute('aria-label','Navegación rápida por día');
  rail.innerHTML=dayNames.map(d=>`<button type="button" class="v90-daytab" data-v90-day="${d.num}" aria-label="Ir a ${d.el.id}">
    <b>Día d.num</b><span>{d.short}</span>
  </button>`).join('');
  // Put it immediately after the existing sticky tabs to feel like an app selector.
  const tabs=app.querySelector('.tabs');
  if(tabs) tabs.insertAdjacentElement('afterend',rail);
  else top.insertAdjacentElement('afterend',rail);

  // Next-stop command card
  const nextPanel=document.createElement('section');
  nextPanel.className='v90-nextpanel';
  nextPanel.id='v90NextPanel';
  nextPanel.innerHTML=`
    <div class="v90-next-icon">✦</div>
    <div class="v90-nextcopy">
      <small>Tu próxima parada</small>
      <strong id="v90NextTitle">Calculando…</strong>
      <span id="v90NextMeta">Lista para seguir</span>
    </div>
    <button class="v90-nextgo" id="v90NextGo" type="button">ABRIR</button>`;
  if(hero) hero.insertAdjacentElement('afterend',nextPanel);

  // Compact mode control
  const focusBtn=document.getElementById('v90FocusBtn');
  focusBtn?.addEventListener('click',()=>{
    document.body.classList.toggle('v90-compact');
    const on=document.body.classList.contains('v90-compact');
    focusBtn.classList.toggle('primary',on);
    focusBtn.innerHTML=on ? '◉ <span>Enfoque activo</span>' : '◒ <span>Enfoque</span>';
    toast(on?'Modo enfoque activado':'Modo enfoque desactivado');
  });

  // Make existing route/transit/food surfaces feel intentional without changing content.
  const transit=app.querySelector('.transitpanel');
  if(transit){
    const h=transit.querySelector('.transithead');
    const routegrid=transit.querySelector('.routegrid');
    const note=transit.querySelector('.transitnote');
    if(h && routegrid){
      h.setAttribute('role','button');
      h.setAttribute('tabindex','0');
      h.setAttribute('aria-expanded','false');
      let open=false;
      routegrid.style.display='none';
      if(note) note.style.display='none';
      const toggle=()=>{
        open=!open;
        routegrid.style.display=open?'grid':'none';
        if(note) note.style.display=open?'block':'none';
        h.setAttribute('aria-expanded',String(open));
      };
      h.addEventListener('click',toggle);
      h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
      const hint=document.createElement('span');
      hint.className='v90-transit-hint';
      hint.textContent='Toca para ver líneas';
      hint.style.cssText='display:block;margin-top:4px;font-size:8px;color:#8a9ba4;font-weight:800;';
      const existingSpan=h.querySelector('span');
      if(existingSpan) existingSpan.insertAdjacentElement('afterend',hint);
    }
  }

  // Give each stop a compact reveal action and stronger current-state semantics.
  const stops=[...app.querySelectorAll('.stop')];
  stops.forEach(stop=>{
    const top=stop.querySelector('.top');
    if(!top) return;
    if(!top.querySelector('.v90-reveal')){
      const b=document.createElement('button');
      b.type='button';
      b.className='v90-reveal';
      b.textContent='＋ Ver dirección y notas';
      b.addEventListener('click',()=>{
        stop.classList.toggle('v90-expanded');
        b.textContent=stop.classList.contains('v90-expanded')?'− Ocultar detalles':'＋ Ver dirección y notas';
      });
      top.appendChild(b);
    }
  });

  // Dynamic next stop from existing checklist state.
  function getStops(){
    return [...app.querySelectorAll('.stop')].map(s=>({
      el:s,
      key:s.dataset.key,
      title:s.querySelector('.place')?.textContent?.trim()||'Siguiente actividad',
      time:s.querySelector('.time')?.textContent?.trim()||'',
      check:s.querySelector('input[type="checkbox"]'),
      day:s.closest('.day')
    }));
  }
  function updateNext(){
    const all=getStops();
    const next=all.find(x=>!x.check?.checked);
    all.forEach(x=>x.el.classList.remove('current'));
    if(next){
      next.el.classList.add('current');
      const dayNum=dayNames.findIndex(d=>d.el===next.day)+1;
      document.getElementById('v90NextTitle').textContent=next.title;
      document.getElementById('v90NextMeta').textContent=`Día ${dayNum} · ${next.time}`;
      document.getElementById('v90NextGo').onclick=()=>{
        next.el.scrollIntoView({behavior:'smooth',block:'center'});
        next.el.classList.add('flash');
        setTimeout(()=>next.el.classList.remove('flash'),1300);
      };
      if(dayNum>0){
        const tab=rail.querySelector(`[data-v90-day="${dayNames[dayNum-1].num}"]`);
        rail.querySelectorAll('.v90-daytab').forEach(x=>x.classList.remove('active'));
        tab?.classList.add('active');
      }
    }else{
      document.getElementById('v90NextTitle').textContent='Viaje completado ✦';
      document.getElementById('v90NextMeta').textContent='Todas las paradas están marcadas';
      document.getElementById('v90NextGo').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
    }
    updateRing();
  }

  function updateRing(){
    const checks=getStops().map(x=>x.check).filter(Boolean);
    const done=checks.filter(c=>c.checked).length;
    const pct=checks.length?Math.round(done/checks.length*100):0;
    let ring=document.getElementById('v90ProgressRing');
    const pb=document.querySelector('.progressbox');
    if(pb && !ring){
      ring=document.createElement('div');
      ring.id='v90ProgressRing';
      ring.className='v90-progressring';
      ring.innerHTML='<span>0%</span>';
      const left=document.querySelector('.progressbox .progressline');
      if(left) left.insertAdjacentElement('beforeend',ring);
    }
    if(ring){
      ring.style.setProperty('--progress',pct+'%');
      ring.querySelector('span').textContent=pct+'%';
    }
    document.querySelector('.v90-nextpanel')?.style.setProperty('--progress',pct+'%');
  }

  // Existing state events + observer
  app.addEventListener('change',e=>{
    if(e.target.matches('.stop input[type="checkbox"]')) updateNext();
  },true);

  // Active day on scroll
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        const idx=dayNames.findIndex(d=>d.el===en.target);
        rail.querySelectorAll('.v90-daytab').forEach(x=>x.classList.remove('active'));
        rail.querySelector(`[data-v90-day="${dayNames[idx]?.num}"]`)?.classList.add('active');
      }
    });
  },{rootMargin:'-34% 0px -55% 0px',threshold:0});
  dayNames.forEach(d=>obs.observe(d.el));

  rail.addEventListener('click',e=>{
    const btn=e.target.closest('.v90-daytab'); if(!btn) return;
    const item=dayNames.find(x=>x.num===btn.dataset.v90Day);
    item?.el.scrollIntoView({behavior:'smooth',block:'start'});
    rail.querySelectorAll('.v90-daytab').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });

  document.getElementById('v90NextTopBtn')?.addEventListener('click',()=>{
    document.getElementById('v90NextGo')?.click();
  });

  // Bottom dock
  const dock=document.createElement('nav');
  dock.className='v90-bottomdock';
  dock.setAttribute('aria-label','Acciones rápidas');
  dock.innerHTML=`
    <button class="v90-dockbtn active" data-v90-target="top" type="button"><span>⌂</span>Resumen</button>
    <button class="v90-dockbtn" data-v90-target="day1" type="button"><span>◫</span>Días</button>
    <button class="v90-dockbtn" data-v90-target="transit" type="button"><span>↝</span>Mover</button>
    <button class="v90-dockbtn" data-v90-action="food" type="button"><span>✦</span>Comer</button>`;
  document.body.appendChild(dock);

  dock.addEventListener('click',e=>{
    const btn=e.target.closest('.v90-dockbtn'); if(!btn)return;
    dock.querySelectorAll('.v90-dockbtn').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const target=btn.dataset.v90Target;
    if(target==='top') window.scrollTo({top:0,behavior:'smooth'});
    if(target==='day1'){
      days[0]?.scrollIntoView({behavior:'smooth',block:'start'});
    }
    if(target==='transit'){
      document.getElementById('transit')?.scrollIntoView({behavior:'smooth',block:'start'});
    }
    if(btn.dataset.v90Action==='food'){
      document.getElementById('foodFloat')?.click();
    }
  });

  // Update dock state as the user moves through the trip.
  const dockObs=new IntersectionObserver(entries=>{
    const visible=entries.filter(x=>x.isIntersecting);
    if(!visible.length) return;
    const d=visible.sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0].target;
    dock.querySelectorAll('.v90-dockbtn').forEach(x=>x.classList.remove('active'));
    if(d.id==='transit') dock.querySelector('[data-v90-target="transit"]')?.classList.add('active');
    else{
      const b=dock.querySelector(`[data-v90-target="${d.id}"]`);
      if(b) b.classList.add('active');
      else dock.querySelector('[data-v90-target="day1"]')?.classList.add('active');
    }
  },{rootMargin:'-20% 0px -65% 0px',threshold:.05});
  days.forEach(d=>dockObs.observe(d));
  if(document.getElementById('transit')) dockObs.observe(document.getElementById('transit'));

  // Add day number badges to the day headers.
  dayNames.forEach((d,i)=>{
    const head=d.el.querySelector('.dayhead');
    const h=head?.querySelector('h2');
    if(!head || !h) return;
    if(!head.querySelector('.v90-daynum')){
      const n=document.createElement('div');
      n.className='v90-daynum';
      n.textContent='D'+String(i+1).padStart(2,'0');
      head.insertBefore(n,h);
    }
  });

  function toast(msg){
    const t=document.getElementById('toast');
    if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}
  }

  updateNext();
  setTimeout(updateNext,350);

  // Ensure focus buttons are above the bottom dock on narrow screens.
  window.addEventListener('resize',()=>{
    const compact=document.body.classList.contains('v90-compact');
    if(compact) document.body.classList.add('v90-compact');
  },{passive:true});
})();

;

/* v91-ultimate-ui-js */
(function(){
  if(document.getElementById('v91CoverTag')) return;

  const app=document.querySelector('main.app');
  if(!app) return;
  const days=[...app.querySelectorAll('.day')];

  /* Hero polish */
  const hero=app.querySelector('.hero');
  if(hero){
    const tag=document.createElement('div');
    tag.className='v91-cover-tag'; tag.id='v91CoverTag';
    tag.textContent='WINTER TRIP · 2026';
    hero.appendChild(tag);
    const route=document.createElement('div');
    route.className='v91-cover-route';
    route.innerHTML='<i></i><em></em><b></b>';
    hero.appendChild(route);
  }

  /* Upgrade day rail with real per-day progress */
  const rail=document.querySelector('.v90-dayrail');
  function refreshDayRail(){
    if(!rail) return;
    days.forEach((day,i)=>{
      const btn=rail.querySelector(`[data-v90-day="${i+1}"]`);
      if(!btn) return;
      let progress=btn.querySelector('.v91-dayprogress');
      if(!progress){
        progress=document.createElement('span');
        progress.className='v91-dayprogress';
        progress.innerHTML='<i></i>';
        btn.appendChild(progress);
      }
      const checks=[...day.querySelectorAll('.checkbtn input[type="checkbox"]')];
      const done=checks.filter(x=>x.checked).length;
      progress.querySelector('i').style.width=(checks.length?(done/checks.length)*100:0)+'%';
    });
  }
  refreshDayRail();
  document.addEventListener('change',e=>{
    if(e.target.matches('.checkbtn input')) refreshDayRail();
  },true);

  /* Replace the problematic 4-item dock + floating buttons with one coherent 5-item nav. */
  const dock=document.querySelector('.v90-bottomdock');
  if(dock){
    dock.innerHTML=`
      <button class="v90-dockbtn active" data-v91-target="top" type="button"><span>⌂</span><label>Resumen</label></button>
      <button class="v90-dockbtn" data-v91-target="days" type="button"><span>▦</span><label>Itinerario</label></button>
      <button class="v90-dockbtn" data-v91-target="transit" type="button"><span>⇄</span><label>Transporte</label></button>
      <button class="v90-dockbtn" data-v91-action="food" type="button"><span>✦</span><label>Comida</label></button>
      <button class="v90-dockbtn" data-v91-action="hotel" type="button"><span>⌂</span><label>Hospedaje</label></button>`;

    dock.addEventListener('click',e=>{
      const btn=e.target.closest('.v90-dockbtn');
      if(!btn) return;
      dock.querySelectorAll('.v90-dockbtn').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      const target=btn.dataset.v91Target;
      if(target==='top') window.scrollTo({top:0,behavior:'smooth'});
      if(target==='days') days[0]?.scrollIntoView({behavior:'smooth',block:'start'});
      if(target==='transit') document.getElementById('transit')?.scrollIntoView({behavior:'smooth',block:'start'});
      if(btn.dataset.v91Action==='food') document.getElementById('foodFloat')?.click();
      if(btn.dataset.v91Action==='hotel') document.getElementById('hotelFloat')?.click();
    },{passive:true});
  }

  /* Make the current activity feel intentionally “live” without changing stored data. */
  function updateCurrentStop(){
    const checked=[...app.querySelectorAll('.checkbtn input[type="checkbox"]')];
    checked.forEach(c=>c.closest('.stop')?.classList.remove('current'));
    const next=checked.find(c=>!c.checked);
    next?.closest('.stop')?.classList.add('current');
  }
  updateCurrentStop();
  document.addEventListener('change',e=>{
    if(e.target.matches('.checkbtn input')) updateCurrentStop();
  },true);

  /* Add a tiny semantic subtitle beneath each day title when possible. */
  days.forEach(day=>{
    const head=day.querySelector('.dayhead');
    const h=head?.querySelector('h2');
    if(!h || head.querySelector('.v91-daymeta')) return;
    const txt=h.textContent||'';
    const parts=txt.split('|');
    if(parts.length<2) return;
    const meta=document.createElement('span');
    meta.className='v91-daymeta';
    meta.style.cssText='position:absolute;right:58px;bottom:9px;font-size:6.5px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#8b9aa0;pointer-events:none;opacity:.8';
    meta.textContent='PLAN DEL DÍA';
    head.appendChild(meta);
  });

  /* Keep dock and progress aligned with the itinerary as the user scrolls. */
  const sections=[
    {id:'top',el:document.querySelector('.hero')},
    {id:'days',el:days[0]},
    {id:'transit',el:document.getElementById('transit')}
  ].filter(x=>x.el);
  const obs=new IntersectionObserver(entries=>{
    const hit=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!hit||!dock)return;
    dock.querySelectorAll('.v90-dockbtn').forEach(x=>x.classList.remove('active'));
    const key=hit.target===document.querySelector('.hero')?'top':hit.target===document.getElementById('transit')?'transit':'days';
    dock.querySelector(`[data-v91-target="${key}"]`)?.classList.add('active');
  },{rootMargin:'-25% 0px -60% 0px',threshold:.05});
  sections.forEach(x=>obs.observe(x.el));

  /* Expose a clean no-jank external API for future GitHub iteration. */
  window.ChicagoItineraryUI={
    refresh:()=>{refreshDayRail();updateCurrentStop();},
    scrollToDay:n=>days[n-1]?.scrollIntoView({behavior:'smooth',block:'start'})
  };
})();

;

/* v92-signature-ui-js */
(function(){
  if(document.getElementById('v92RoutePill')) return;
  const app=document.querySelector('main.app');
  const topbar=document.querySelector('.v90-topbar');
  const original=document.querySelector('.route-controls');
  if(!app || !topbar || !original) return;

  /* Compress the two global route settings into a single intentional control. */
  const pill=document.createElement('section');
  pill.id='v92RoutePill';
  pill.className='v92-routepill';
  pill.innerHTML=`
    <div class="v92-routepill-copy">
      <div class="v92-routeicon">⌁</div>
      <div><b>Ruta activa</b><span id="v92RouteSummary">Apple Maps · Hospedaje</span></div>
    </div>
    <button class="v92-routepill-toggle" id="v92RouteToggle" type="button">Ajustar</button>
    <div class="v92-routepanel" id="v92RoutePanel">
      <div class="v92-route-row"><span>Mapa</span><div class="v92-route-seg" id="v92MapSeg"></div></div>
      <div class="v92-route-row"><span>Origen</span><div class="v92-route-seg" id="v92OriginSeg"></div></div>
    </div>`;
  topbar.insertAdjacentElement('afterend',pill);

  const originalMap=[...original.querySelectorAll('[data-map-provider]')];
  const originalOrigin=[...original.querySelectorAll('[data-origin-mode]')];
  const mapSeg=pill.querySelector('#v92MapSeg');
  const originSeg=pill.querySelector('#v92OriginSeg');
  const copyButtons=(items,host)=>{
    items.forEach(src=>{
      const b=document.createElement('button');
      b.type='button';
      b.textContent=(src.textContent||'').replace(/^[^\wÀ-ÿ]+/,'').trim();
      b.dataset.proxy=src.dataset.mapProvider||src.dataset.originMode||'';
      b.addEventListener('click',()=>{src.click();sync()});
      host.appendChild(b);
    });
  };
  copyButtons(originalMap,mapSeg); copyButtons(originalOrigin,originSeg);

  function selectedLabel(){
    const map=originalMap.find(b=>b.classList.contains('active')||b.getAttribute('aria-pressed')==='true')?.textContent?.trim();
    const origin=originalOrigin.find(b=>b.classList.contains('active')||b.getAttribute('aria-pressed')==='true')?.textContent?.trim();
    return [(map||'Apple Maps').replace(/^[^\wÀ-ÿ]+/,'').trim(),(origin||'Hospedaje').replace(/^[^\wÀ-ÿ]+/,'').trim()].join(' · ');
  }
  function sync(){
    const map=originalMap.map(b=>b.dataset.mapProvider); 
    const chosenMap=originalMap.find(b=>b.classList.contains('active'))||originalMap[0];
    const chosenOrigin=originalOrigin.find(b=>b.classList.contains('active'))||originalOrigin[1]||originalOrigin[0];
    pill.querySelector('#v92RouteSummary').textContent=`${(chosenMap?.textContent||'Apple Maps').trim()} · ${(chosenOrigin?.textContent||'Hospedaje').trim()}`.replace(/^[^\wÀ-ÿ]+/,'').replace(/ · [^\wÀ-ÿ]+/,' · ');
    mapSeg.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.proxy===chosenMap?.dataset.mapProvider));
    originSeg.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.proxy===chosenOrigin?.dataset.originMode));
  }
  pill.querySelector('#v92RouteToggle').addEventListener('click',()=>{
    const panel=pill.querySelector('#v92RoutePanel');
    panel.classList.toggle('open');
    pill.querySelector('#v92RouteToggle').textContent=panel.classList.contains('open')?'Cerrar':'Ajustar';
  });
  sync();

  /* Make top-right controls readable on small screens. */
  const focus=document.getElementById('v90FocusBtn');
  const next=document.getElementById('v90NextTopBtn');
  if(focus){ focus.innerHTML='◐ <span>Enfoque</span>'; }
  if(next){ next.innerHTML='→ <span>Siguiente</span>'; }

  /* Add a tiny footer cue to the editorial cover. */
  const hero=app.querySelector('.hero');
  if(hero&&!hero.querySelector('.v92-cover-kicker')){
    const k=document.createElement('div');k.className='v92-cover-kicker';k.innerHTML='<b>CHI</b> / TRAVEL SYSTEM';hero.appendChild(k);
  }
})();

;

/* v93-journey-system-js */
(()=>{
  const app=document.querySelector('main.app'); if(!app || document.getElementById('v93Command')) return;
  const hero=app.querySelector('.hero'); if(!hero) return;
  const panel=document.createElement('section'); panel.id='v93Command'; panel.className='v93-command';
  panel.innerHTML=`<div class="v93-command-head"><div class="v93-live"><i></i><span id="v93Status">PLAN EN VIVO</span></div><button type="button" id="v93NextBtn">Ver siguiente →</button></div><div class="v93-next"><div class="v93-orb">⌁</div><div><small id="v93Kicker">PRÓXIMA PARADA</small><b id="v93Place">Preparando tu recorrido…</b></div><span id="v93Meta"></span></div><div class="v93-command-foot"><a href="#transit">🚌 CTA y buses</a><a href="https://www.transitchicago.com/bus-tracker/" target="_blank" rel="noopener">Bus Tracker ↗</a><a href="https://www.transitchicago.com/alerts/" target="_blank" rel="noopener">Alertas CTA ↗</a><a href="https://www.google.com/maps" target="_blank" rel="noopener">Abrir Maps ↗</a></div>`;
  hero.insertAdjacentElement('afterend',panel);
  const getStops=()=>[...app.querySelectorAll('.stop')];
  function refresh(){
    const stops=getStops(), done=stops.filter(s=>s.querySelector('input[type=checkbox]')?.checked);
    const next=stops.find(s=>!s.querySelector('input[type=checkbox]')?.checked);
    const status=document.getElementById('v93Status'),place=document.getElementById('v93Place'),meta=document.getElementById('v93Meta'),kick=document.getElementById('v93Kicker');
    if(next){const day=next.closest('.day')?.querySelector('.dayhead h2')?.textContent?.match(/Día\s+\d+/i)?.[0]||'ITINERARIO';place.textContent=next.querySelector('.place')?.textContent?.trim()||'Siguiente actividad';meta.textContent=`${day} · next.querySelector('.time')?.textContent?.trim()||'Sinhora'`;kick.textContent='PRÓXIMAPARADA';status.textContent=`{done.length} DE ${stops.length} COMPLETADAS`;}
    else {place.textContent='¡Itinerario completo!';meta.innerHTML='<span class="v93-done">TODO HECHO</span>';kick.textContent='MISIÓN CUMPLIDA';status.textContent='VIAJE COMPLETADO';}
  }
  document.getElementById('v93NextBtn').addEventListener('click',()=>{const next=getStops().find(s=>!s.querySelector('input[type=checkbox]')?.checked);if(next){next.scrollIntoView({behavior:'smooth',block:'center'});next.classList.add('flash');setTimeout(()=>next.classList.remove('flash'),1300)}});
  document.addEventListener('change',e=>{if(e.target.matches('.checkbtn input')) refresh()},true); refresh();

})();
