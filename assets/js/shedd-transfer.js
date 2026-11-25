/* v166-shedd-united-complete-script */
(function(){
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim()}
  function setup(){
    const modal=document.getElementById('sheddUnitedModal');
    if(!modal || modal.dataset.v166Complete==='1') return;
    const box=modal.querySelector('.route-box');
    if(!box) return;
    modal.dataset.v166Complete='1';
    const old=box.querySelector('.v126-content');
    if(!old) return;
    const fullBtn=old.querySelector('[data-full-route]');
    old.remove();

    const content=document.createElement('div');
    content.className='v166-su-content';
    content.innerHTML=`
      <div class="v166-su-summary">
        <div class="v166-su-card main"><b>TRAMO 1</b><strong>🐟 Shedd → 🏨 Hotel</strong><span>≈ 4:40 pm → ≈ 5:00 pm</span></div>
        <div class="v166-su-card"><b>CAMBIO</b><strong>🏨 30 min</strong><span>5:00–5:30 pm para cambiarte</span></div>
        <div class="v166-su-card"><b>TRAMO 2</b><strong>🏨 Hotel → 🏀 United</strong><span>5:30 pm → ≈ 6:03 pm</span></div>
      </div>

      <section class="v166-su-section">
        <div class="v166-su-head"><b>🚌 146 North · Shedd → hospedaje</b><span>objetivo de planificación</span></div>
        <div class="v166-su-body">
          <div class="v166-su-options" data-su146>
            <button class="v166-su-option active" type="button" data-depart="≈ 4:40 pm" data-arrive="≈ 5:00 pm"><small>plan recomendado</small><strong>≈ 4:40 pm</strong><span>llegada objetivo ≈ 5:00 pm</span></button>
            <button class="v166-su-option" type="button" data-depart="≈ 4:55 pm" data-arrive="≈ 5:15 pm"><small>respaldo</small><strong>≈ 4:55 pm</strong><span>llegada objetivo ≈ 5:15 pm</span></button>
          </div>
        </div>
      </section>

      <div class="v166-su-route">
        <div class="v166-su-step"><div class="v166-su-icon">🐟</div><div><div class="v166-su-label">Salir</div><div class="v166-su-main">Shedd Aquarium</div><div class="v166-su-detail">1200 S DuSable Lake Shore Dr</div></div></div>
        <div class="v166-su-step"><div class="v166-su-icon">🚶</div><div><div class="v166-su-label">Ir a</div><div class="v166-su-main">Solidarity Drive & Aquarium</div><div class="v166-su-detail">≈ 2 min caminando desde Shedd</div></div></div>
        <div class="v166-su-step"><div class="v166-su-icon">🚌</div><div><div class="v166-su-label">Tomar</div><div class="v166-su-main">146 North · Shedd → hospedaje <span data-su146inline>≈ 4:40 pm</span></div><div class="v166-su-detail">Bajar en State & Harrison / Ida B Wells</div></div></div>
        <div class="v166-su-step"><div class="v166-su-icon">🚶</div><div><div class="v166-su-label">Bajar En</div><div class="v166-su-main">State & Harrison/Ida B Wells Drive</div><div class="v166-su-detail">≈ 3–4 min desde la parada</div></div></div>
      </div>

      <section class="v166-su-section">
        <div class="v166-su-head"><b>🏨 Parada en hospedaje</b><span>tiempo reservado</span></div>
        <div class="v166-su-body">
          <div class="v166-su-buffer"><b>5:00–5:30 pm · 30 min</b><br>Entrar al hotel, cambiarte, dejar lo necesario y salir. Este bloque está reservado deliberadamente para no intentar enlazar Shedd → United de forma directa.</div>
        </div>
      </section>

      <section class="v166-su-section">
        <div class="v166-su-head"><b>🚶 Hotel → 🚌 20 West → 🏀 United Center</b><span>tramo final</span></div>
        <div class="v166-su-body">
          <div class="v166-su-route" style="margin:0;padding:0;border:0">
            <div class="v166-su-step"><div class="v166-su-icon">🏨</div><div><div class="v166-su-label">Salir</div><div class="v166-su-main">HI Chicago</div><div class="v166-su-detail">Objetivo: 5:30 pm</div></div></div>
            <div class="v166-su-step"><div class="v166-su-icon">🚶</div><div><div class="v166-su-label">Ir a</div><div class="v166-su-main">Madison & Dearborn/State</div><div class="v166-su-detail">≈ 13 min caminando · llegada objetivo ≈ 5:43 pm</div></div></div>
            <div class="v166-su-step"><div class="v166-su-icon">🚌</div><div><div class="v166-su-label">Tomar</div><div class="v166-su-main">20 West · Austin</div><div class="v166-su-detail">5:43 pm → ≈ 6:02 pm · baja en Madison & United Center</div></div></div>
            <div class="v166-su-step"><div class="v166-su-icon">🏀</div><div><div class="v166-su-label">Llegar</div><div class="v166-su-main">United Center · 1901 W Madison St</div><div class="v166-su-detail">≈ 6:03 pm · ≈ 57 min antes del partido de las 7:00 pm</div></div></div>
          </div>
        </div>
      </section>

      <div class="v166-su-actions"><button type="button" data-su-map="shedd-hotel">🗺️ Shedd → hospedaje</button><button type="button" data-su-map="hotel-united">🗺️ Hospedaje → United</button><button type="button" data-su-map="full">🗺️ Ruta completa</button></div>
      <div class="v166-su-note">🕒 Los horarios del transporte son referencias de planificación, no una promesa de servicio para diciembre de 2026. El objetivo es proteger el bloque de 30 min para cambiarte y aun así llegar al United Center con margen. Las referencias de Transit que compartiste se pueden usar para recalcular la salida real cuando se acerque el viaje.</div>
    `;

    box.querySelector('h3')?.insertAdjacentElement('afterend',content);

    const depart=content.querySelector('[data-su146inline]');
    const chips=[...content.querySelectorAll('[data-su146] .v166-su-option')];
    chips.forEach((chip)=>chip.addEventListener('click',()=>{
      chips.forEach(x=>x.classList.remove('active')); chip.classList.add('active');
      if(depart) depart.textContent=chip.dataset.depart||'';
      const note=content.querySelector('.v166-su-card.main span');
      if(note) note.textContent=(chip.dataset.depart||'')+' → '+(chip.dataset.arrive||'');
    }));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup); else setup();
  setTimeout(setup,250);
})();
