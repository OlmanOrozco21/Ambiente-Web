/* v155-transport-modal-js */
(function(){
  'use strict';
  if(window.__v155TransportModal)return;
  window.__v155TransportModal=true;

  const atlas=document.querySelector('.v106');
  if(!atlas)return;

  const modal=document.createElement('div');
  modal.id='atlasTransportModal';
  modal.hidden=true;
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`
    <div class="atm-box" role="dialog" aria-modal="true" aria-labelledby="atmTitle">
      <header class="atm-head">
        <h2 class="atm-title" id="atmTitle">Transporte</h2>
        <p class="atm-sub" id="atmDayLabel"></p>
        <button class="atm-close" type="button" aria-label="Cerrar">×</button>
      </header>
      <div class="atm-body">
        <p class="atm-section-label" id="atmCount"></p>
        <p class="atm-error" role="status" hidden>No se pudo abrir este trayecto.</p>
        <ol class="atm-list" id="atmList"></ol>
      </div>
      <aside class="atm-foot">Horarios de referencia · <a href="https://www.transitchicago.com/alerts/" target="_blank" rel="noopener">Consultar alertas de CTA ↗</a></aside>
    </div>`;
  document.body.appendChild(modal);

  const dayLabel=modal.querySelector('#atmDayLabel');
  const count=modal.querySelector('#atmCount');
  const list=modal.querySelector('#atmList');
  const railLabels=new Map(Object.values(window.tripRailRoutes).filter(route=>route.first&&route.trigger).map(route=>[route.trigger,route.label]));

  function currentIndex(){
    const active=atlas.querySelector('.v106-day.active');
    return active?Number(active.dataset.day||0):0;
  }
  function currentDay(){
    const days=[...atlas.querySelectorAll('.v106-day')];
    const b=days[currentIndex()];
    return b?{
      index:currentIndex(),
      num:currentIndex()+1,
      label:(b.querySelector('strong')?.textContent||'').trim(),
      detail:(b.querySelector('span')?.textContent||'').trim()
    }:{index:0,num:1,label:'Día 1',detail:''};
  }
  function sourceDay(){
    const ds=[...document.querySelectorAll('.app .day')];
    return ds[currentIndex()]||null;
  }
  function transferData(){
    const d=sourceDay();
    if(!d)return [];
    return [...d.querySelectorAll(':scope .transit-important')].map(x=>{
      const cls=[...x.classList].find(c=>c.startsWith('transit-')&&c!=='transit-important')||'';
      return {
        cls,
        title:(x.querySelector('span')?.textContent||'Traslado importante').replace(/\s+/g,' ').trim()
      };
    }).filter(x=>x.cls||x.title);
  }
  function findSource(cls){
    if(!cls)return null;
    try{return document.querySelector('.app .' + (window.CSS&&CSS.escape?CSS.escape(cls):cls));}
    catch(e){return document.querySelector('.app .' + cls);}
  }
  function openOriginal(button){
    const src=findSource(button.dataset.cls);
    const error=modal.querySelector('.atm-error');
    const routeModals=[...document.querySelectorAll('.route-modal')];
    const wasOpen=new Set(routeModals.filter(route=>route.getAttribute('aria-hidden')==='false'));
    src?.click();
    const detail=routeModals.find(route=>!wasOpen.has(route)&&route.getAttribute('aria-hidden')==='false');
    error.hidden=!!detail;
    if(!detail)return;

    close(false);
    const back=detail.querySelector('.route-close');
    const closeLabel=back?.getAttribute('aria-label');
    back?.classList.add('guide-transfer-back');
    back?.setAttribute('aria-label','Volver a los traslados');
    back?.focus({preventScroll:true});
    const observer=new MutationObserver(()=>{
      if(detail.getAttribute('aria-hidden')!=='true')return;
      observer.disconnect();
      back?.classList.remove('guide-transfer-back');
      if(closeLabel===null)back?.removeAttribute('aria-label');
      else if(closeLabel)back.setAttribute('aria-label',closeLabel);
      show();
      button.focus({preventScroll:true});
    });
    observer.observe(detail,{attributes:true,attributeFilter:['aria-hidden']});
  }
  function render(){
    const d=currentDay(), transfers=transferData();
    const suffix=d.detail?` · ${d.detail}`:'';
    dayLabel.textContent=`Día ${d.num}${d.label?' · '+d.label:''}${suffix}`;
    count.textContent=`${transfers.length} ${transfers.length===1?'traslado':'traslados'}`;
    modal.querySelector('.atm-error').hidden=true;
    if(!transfers.length){
      list.innerHTML=`<li class="atm-empty">Este día no tiene traslados destacados en el itinerario.</li>`;
      return;
    }
    list.innerHTML=transfers.map(t=>{
      const [journey,...notes]=t.title.split(/\s+·\s+/);
      const label=railLabels.get(t.cls)||notes.join(' · ');
      const stops=journey.split(/\s*→\s*/).map(stop=>stop.replace(/^[^\p{L}\p{N}]+/u,''));
      return `
      <li class="atm-entry">
        <button class="plan" type="button" data-cls="${esc(t.cls)}" aria-haspopup="dialog">
          <span class="atm-entry-stops">
            ${stops.map(stop=>`<span>${esc(stop)}</span>`).join('')}
          </span>
          ${label?`<span class="atm-entry-note">${esc(label)}</span>`:''}
          <span class="atm-entry-arrow" aria-hidden="true">›</span>
        </button>
      </li>`;
    }).join('');

    list.querySelectorAll('button.plan').forEach(b=>b.addEventListener('click',()=>openOriginal(b)));
  }
  function show(){
    modal.hidden=false;modal.setAttribute('aria-hidden','false');
    document.body.classList.add('v155-modal-open');
  }
  function open(){
    render();
    show();
    modal.querySelector('.atm-body').scrollTop=0;
    modal.querySelector('.atm-close').focus();
  }
  function close(restoreFocus=true){
    modal.hidden=true;modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('v155-modal-open');
    if(restoreFocus)transportButton?.focus();
  }
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

  const transportButton=atlas.querySelector('.v106-modes button[data-mode="transit"]');
  if(transportButton){
    atlas.addEventListener('click',function(e){
      const btn=e.target.closest('.v106-modes button[data-mode="transit"]');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      open();
    },true);
  }
  atlas.querySelectorAll('.v106-day').forEach(btn=>btn.addEventListener('click',()=>{
    if(!modal.hidden){render();}
  },true));

  modal.querySelector('.atm-close').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented&&!modal.hidden)close()});
})();
