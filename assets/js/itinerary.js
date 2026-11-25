/* atlas-v106-clean-js */
(function(){
  if(window.__atlasV106)return;
  window.__atlasV106=true;
  document.body.classList.add('v106-body');

  const sourceDays=[...document.querySelectorAll('.app .day')];
  const foodPanels=[...document.querySelectorAll('.food-panel[data-food-panel]')];

  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const iconPaths={
    route:'<path d="M6 18h8a4 4 0 0 0 0-8h-3a3 3 0 0 1 0-6h7"/><circle cx="4" cy="18" r="2"/><path d="m16 2 2 2-2 2"/>',
    map:'<path d="M19 10c0 4.5-7 10-7 10S5 14.5 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    camera:'<path d="M4 7h4l2-2h4l2 2h4v12H4z"/><circle cx="12" cy="13" r="3"/>',
    clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    food:'<path d="M5 3v5a3 3 0 0 0 6 0V3M8 3v18M19 3c-3 2-4 5-4 9h4m0-9v18"/>',
    rail:'<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M8 17l-2 4m10-4 2 4M9 13h.01M15 13h.01"/>',
    info:'<circle cx="12" cy="12" r="8"/><path d="M12 11v5m0-8h.01"/>'
  };
  const icon=name=>`<svg class="trip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[name]}</svg>`;
  const isImageSearch=link=>link.href.includes('tbm=isch');
  function stopLink(link){
    const label=link.dataset.linkLabel||(isImageSearch(link)?'Buscar fotos':'Fotos');
    const isRoute=/^(Ver en mapa|Ruta (?:en carro|a |de regreso))/.test(label);
    const glyph=isRoute?'route':/fotos/i.test(label)?'camera':'';
    return `<a href="${esc(link.href)}" target="_blank" rel="noopener"${glyph?` class="trip-icon-action${isRoute?' primary trip-route-action':''}" aria-label="${esc(label)}" title="${esc(label)}"`:''}>${glyph?icon(glyph):''}<span class="trip-action-text">${esc(isRoute?'Ruta':label)}</span></a>`;
  }

  const mapPin=query=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const arrivalGuides={
    d2s01:{
      target:'Entrada principal · junto a Man with Fish',
      steps:[
        ['Al bajar en Museum Campus','Ve al Shedd Aquarium y acércate por la glorieta semicircular. Busca la escultura Man with Fish para reconocer la entrada principal.'],
        ['Antes de entrar','Ten listo el boleto de tu horario. Para orientarte dentro, pide el mapa en Information Desk.']
      ],
      links:[['Entrada y servicios oficiales','https://www.sheddaquarium.org/plan-a-visit']]
    },
    d2s06:{
      target:'United Center · nivel 300',
      steps:[
        ['Del hotel al estadio','Por Green Line baja en Damen y camina al sur hacia Madison. Si vas en el 20 West, baja en Madison & United Center y cruza por el paso peatonal hacia la arena.'],
        ['Puerta y boleto','El partido empieza a las 7:00 pm y el recinto anuncia apertura a las 5:30 pm. Si tu boleto indica una puerta, úsala. Si no, pregunta al personal por una puerta pública con acceso al nivel 300: las puertas 2, 3, 6 y 7 tienen escaleras mecánicas a ese nivel. Guarda los boletos en la billetera del teléfono; una captura no sirve para entrar. Deja la mochila en el hotel.'],
        ['Del pasillo a tus asientos','Sube al nivel 300 y sigue los letreros de Section 320. En la boca de la sección, muestra tu boleto a un acomodador y pregunta qué pasillo te deja más cerca de tu fila y asientos. Si te pierdes, hay Guest Relations frente a la sección 325.']
      ],
      links:[['Plano de los Bulls','https://www.unitedcenter.com/venue/seating-charts/'],['Evento y horarios','https://www.unitedcenter.com/events/2026/12/03/chicago-bulls-vs-cleveland-cavaliers/'],['Puertas y bolsas','https://www.unitedcenter.com/venue/frequently-asked-questions/'],['Boleto móvil','https://www.unitedcenter.com/venue/mobile-ticketing-guide/']],
      seatNote:true
    },
    d3s05:{
      target:'Entrada Skydeck · Jackson Blvd',
      steps:[
        ['Busca el lado sur','Rodea Willis Tower hasta Jackson Boulevard y sigue los letreros de Skydeck. No uses un acceso de oficinas de la torre.'],
        ['Dentro del recinto','Presenta el boleto de tu franja horaria. Sigue el recorrido de visitantes y el ascensor de Skydeck al piso 103.']
      ],
      links:[['Entrada y visita oficiales','https://theskydeck.com/plan-a-visit/']]
    },
    'd4s08-fireworks':{
      target:'Navy Pier · paseo exterior junto al lago',
      steps:[
        ['Al llegar al muelle','Vengas a pie desde Grand o en el 29, busca un tramo abierto del paseo exterior con vista al lago; sigue las indicaciones del personal si hay zonas cerradas.'],
        ['Antes y después del show','Procura estar en el muelle a las 7:30 pm. Los fuegos son gratis a las 8:00 pm; no necesitas entrada. Al terminar, vuelve por Grand Red Line o toma el 29 desde la terminal.']
      ],
      links:[['Terminal en Maps',mapPin('Navy Pier Terminal, Chicago, IL')],['Avisos del evento','https://navypier.org/pier-events/winter-fireworks/']]
    },
    d5s04:{
      target:'West Gate · Stockton & Webster',
      steps:[
        ['Desde Magnificent Mile','En la esquina sureste de Michigan & Huron, toma el CTA 151 hacia Devon/Clark. Baja en Stockton & Webster, del lado del zoo. Busca el letrero West Gate junto a ese cruce: 2001 N Clark St es la dirección administrativa, no la entrada.'],
        ['En la puerta','Usa el boleto de ZooLights del domingo 6 de diciembre: uno por persona. Las puertas reabren a las 4:30 pm y la última entrada es a las 8:00 pm. Si el personal te redirige, sigue su señalización.'],
        ['Ya adentro','Empieza por el paseo principal (Main Mall) y usa el plano para ubicar el espectáculo de South Lawn y el túnel de luces. Para volver, sal por West Gate y busca el 151 hacia Union Station en la esquina noroeste de Stockton & Webster.']
      ],
      links:[['Pin oficial de West Gate','https://goo.gl/maps/wmQjjFXpynf5ozHJ7'],['Mapa del evento (PDF)','https://www.lpzoo.org/wp-content/uploads/2026/11/ZooLights_2026_Printable-Program_2-sided.pdf'],['ZooLights y entradas','https://www.lpzoo.org/event/zoolights/'],['Paradas del 151','https://www.transitchicago.com/assets/1/6/stoplist_151.htm']]
    },
    d6s07:{
      target:'Crystal Ridge · boletos y alquiler',
      steps:[
        ['Al llegar en carro','Pon Crystal Ridge, 7011 S Ballpark Dr, Franklin. Busca primero el área de boletos y alquiler, no el acceso a las pistas.'],
        ['Antes de subir','Ten lista la reserva del pase y del equipo si alquilas. Pide que te ajusten las botas y el casco y que te indiquen la zona de principiantes que esté abierta esa noche.']
      ],
      links:[['Horarios de la estación','https://crystalridge.com/mountain-info/hours'],['Alquiler de equipo','https://crystalridge.com/ski-board/ski-board-rentals']]
    },
    'd9-garden-lights':{
      target:'Rotary Botanical Gardens · 1455 Palmer Dr',
      steps:[
        ['Al llegar','Ve a Rotary Botanical Gardens, no al pin de Palmer Park. Busca los letreros de acceso del Holiday Light Show.'],
        ['Control y recorrido','Ten el boleto listo y sigue el recorrido señalizado de luces al aire libre. El evento abre a las 4:30 pm, admite hasta las 8:30 pm y apaga las luces a las 9:00 pm.']
      ],
      links:[['Acceso y entradas del evento','https://www.rotarybotanicalgardens.org/holiday-light-show']]
    }
  };
  const seatNoteKey='trip_uc_seat_note';
  const seatNoteHelp='Solo se guarda en este navegador; no se publica ni se sincroniza.';
  function getArrival(key){
    const base=arrivalGuides[key];
    const visual=window.tripVisualGuides?.[key];
    if(!base)return visual;
    if(!visual)return base;
    return {...base,...visual,target:visual.target||base.target,steps:[...base.steps,...visual.steps],links:[...base.links,...visual.links]};
  }
  function renderArrivalPhoto(photo){
    const {file,width,height,alt,caption,credit,source,license,licenseUrl,edited}=photo;
    return `<figure class="trip-arrival-photo">
      <a href="./assets/img/${esc(file)}" target="_blank" rel="noopener" aria-label="${esc('Ampliar foto: '+alt)}"><img src="./assets/img/${esc(file)}" width="${esc(width)}" height="${esc(height)}" alt="${esc(alt)}" loading="lazy" decoding="async"></a>
      <figcaption>${esc(caption)} <a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(source)}" target="_blank" rel="noopener">${esc(credit)}</a> · ${licenseUrl?`<a href="${esc(licenseUrl)}" target="_blank" rel="noopener">${esc(license)}</a>`:esc(license)}${edited?' · imagen reducida':''}.</figcaption>
    </figure>`;
  }
  function renderArrival(guide,mediaId){
    if(!guide)return '';
    const photos=[...(guide.photos||[]),guide.photo].filter(Boolean);
    const mediaCount=photos.length+(guide.diagram?1:0);
    const mediaLabel=[photos.length?`${photos.length} ${photos.length===1?'foto':'fotos'}`:'',guide.diagram?'1 esquema':''].filter(Boolean).join(' · ');
    const notes=guide.steps;
    const links=guide.links.filter(([,url],index,all)=>url!==guide.access?.[1]&&!guide.diagram?.links?.some(link=>link[1]===url)&&all.findIndex(link=>link[1]===url)===index);
    return `<details class="trip-arrival trip-place-guide">
      ${guideSummary('map','Guía de la parada',guide.target)}
      <div class="trip-arrival-body">
        ${renderGuidePoints(guide.points,'Llegada paso a paso')}
        ${guide.access?`<div class="trip-arrival-links trip-arrival-access"><a href="${esc(guide.access[1])}" target="_blank" rel="noopener">${icon('map')} ${esc(guide.access[0])} <span aria-hidden="true">↗</span></a></div>`:''}
        ${renderGuideFacts('Qué letrero buscar',guide.signs)}
        ${guide.rail?renderRailRoute(window.tripRailRoutes[guide.rail],true):''}
        ${mediaCount?renderGuideFold('camera','Fotos y esquemas',mediaLabel,`
          ${guide.diagram?renderArrivalDiagram(guide.diagram):''}
          ${photos.length?`<div class="trip-photo-grid">${photos.map(renderArrivalPhoto).join('')}</div>`:''}`,mediaId):''}
        ${guide.inside?.length||guide.visit?renderGuideFold('food','Qué hacer y dónde comer','Ideas para aprovechar la parada',`
          ${guide.visit?renderGuideFacts('Durante la visita',[
            ['Qué hacer',guide.visit[0]],['Dónde comer',guide.visit[1],guide.visit[2]]
          ]):''}
          ${renderGuideFacts('Dentro del lugar',guide.inside)}`):''}
        ${notes.length||links.length?renderGuideFold('info','Notas y enlaces',notes.length?'Detalles antes de ir':'Fuentes y mapas',`
          ${renderGuideFacts('Ten en cuenta',notes)}
          ${renderGuideLinks(links)}`):''}
        ${guide.seatNote?`<form class="trip-seat-note">
          <label for="tripSeatNote">Mi fila y asientos</label>
          <input id="tripSeatNote" name="seats" maxlength="80" autocomplete="off" placeholder="Fila y números de asiento" aria-describedby="tripSeatStatus">
          <button type="submit">Guardar nota</button>
          <small id="tripSeatStatus" role="status">${seatNoteHelp}</small>
        </form>`:''}
      </div>
    </details>`;
  }

  function guideSummary(symbol,title,subtitle){
    return `<summary>${icon(symbol)}<span><strong>${esc(title)}</strong><small>${esc(subtitle)}</small></span></summary>`;
  }

  function renderGuideFold(symbol,title,subtitle,body,id){
    return `<details class="trip-arrival trip-guide-fold"${id?` id="${esc(id)}"`:''}>${guideSummary(symbol,title,subtitle)}<div class="trip-arrival-body">${body}</div></details>`;
  }

  function renderGuideFacts(title,items){
    return items?.length?`<section class="trip-arrival-signs">
      <h5>${esc(title)}</h5>
      <dl>${items.map(([name,hint,url])=>`<div><dt>${esc(name)}</dt><dd>${esc(hint)}</dd>${url?`<dd><a href="${esc(url)}" target="_blank" rel="noopener">Ver referencia ↗</a></dd>`:''}</div>`).join('')}</dl>
    </section>`:'';
  }

  function renderGuidePoints(points,label){
    return points?.length?`<div class="trip-arrival-strip">
      ${label?`<span class="trip-arrival-kicker">${esc(label)}</span>`:''}
      <ol class="trip-arrival-points">${points.map(([title,body])=>`<li><strong>${esc(title)}</strong><p>${esc(body)}</p></li>`).join('')}</ol>
    </div>`:'';
  }

  function renderRailRoute({label,first,note,legs,links=[]},compact=false){
    const block=`<section class="trip-rail-route">
      <span class="trip-arrival-kicker">${first?'Primero en tren':'Opción en tren · más caminata'}</span>
      <h4>${esc(label)}</h4><p>${esc(note)}</p>
      ${legs.map(({points,links})=>renderGuidePoints(points)+renderGuideLinks(links)).join('')}
      ${renderGuideLinks(links)}
    </section>`;
    return first&&!compact?block:renderGuideFold('rail',first?'Trayecto en tren':'Alternativa en tren',label,block);
  }

  function renderGuideLinks(links){
    return links.length?`<div class="trip-arrival-links">${links.map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('')}</div>`:'';
  }

  function renderArrivalDiagram({file,alt,caption,title,points,links=[]}){
    if(points){
      return `<figure class="trip-landmark-sketch">
        <figcaption>
          <span class="trip-arrival-kicker">Esquema de orientación · sin escala</span>
          <strong>${esc(title)}</strong>
        </figcaption>
        <ol class="trip-sketch-points">${points.map(([symbol,label,detail])=>`<li>
          <span class="trip-sketch-icon">${icon(symbol)}</span>
          <div><strong>${esc(label)}</strong><p>${esc(detail)}</p></div>
        </li>`).join('')}</ol>
        <p class="trip-sketch-note">${esc(caption)}</p>
        ${renderGuideLinks(links)}
      </figure>`;
    }
    const src=`./assets/img/${esc(file)}`;
    return `<figure class="trip-arrival-photo"><a href="${src}" target="_blank" rel="noopener" aria-label="${esc(`Ampliar esquema: ${alt}`)}"><img src="${src}" width="400" height="224" alt="${esc(alt)}" loading="lazy"></a><figcaption>${esc(caption)}</figcaption></figure>`;
  }

  function renderTransitReferences({legs,photo,diagram},hasRail){
    const directions={Northbound:'Norte',Southbound:'Sur',Eastbound:'Este',Westbound:'Oeste'};
    const stopMarkup=(label,stop)=>{
      const coordinates=window.tripCtaStopPins[stop.id];
      const query=coordinates?.join(',')||stop.query+', Chicago, IL';
      const links=[[coordinates?'Pin de CTA':'Ver cruce','https://www.google.com/maps/search/?'+new URLSearchParams({api:'1',query})]];
      if(coordinates&&!stop.name.includes('Terminal'))links.push(['Vista de calle cercana','https://www.google.com/maps/@?'+new URLSearchParams({api:'1',map_action:'pano',viewpoint:query})]);
      return `<div><dt>${label} · <b>#${esc(stop.id)}</b></dt><dd><strong>${esc(stop.name)}</strong>${esc(stop.side)}</dd><dd>${renderGuideLinks(links)}</dd></div>`;
    };
    const trackerLink=(route,direction,stop)=>{
      const params=new URLSearchParams({route,direction,id:stop.id,showAllBusses:'off'});
      return `<a class="trip-tracker-link" href="https://www.ctabustracker.com/bustime/wireless/html/eta.jsp?${esc(params)}" target="_blank" rel="noopener">Próximo ${esc(route)} · #${esc(stop.id)} ↗</a>`;
    };
    return `<details class="trip-arrival trip-transit-references">
      ${guideSummary('map','Cómo reconocer las paradas del bus',hasRail?'Postes del trayecto en bus y sus alternativas':'Número de poste, lado de calle y destino del bus')}
      <div class="trip-arrival-body">
        <p class="trip-transit-help">Los pines vienen del archivo de paradas de CTA. Street View puede mostrar una toma antigua o llevarte al panorama más cercano: confirma el número y la acera al llegar.</p>
        ${legs.map(({route,direction,destination,board,exit,tip,alternate})=>{
          return `<section class="trip-transit-leg">
            <h4><span>${esc(route)}</span> ${esc(directions[direction])} · ${esc(destination)}</h4>
            <dl>${stopMarkup('Sube aquí',board)}${alternate?stopMarkup('Otra subida',alternate):''}${stopMarkup('Baja aquí',exit)}</dl>
            <p>${esc(tip)}</p>
            <div class="trip-arrival-links">
              ${trackerLink(route,direction,board)}
              ${alternate?trackerLink(route,direction,alternate):''}
              <a href="https://www.transitchicago.com/bus/${esc(route)}/" target="_blank" rel="noopener">Paradas y alertas CTA ↗</a>
            </div>
          </section>`;
        }).join('')}
        ${diagram?renderArrivalDiagram(diagram):''}
        ${photo?renderArrivalPhoto(photo):''}
      </div>
    </details>`;
  }

  const transitReferencesByTrigger=new Map();
  const railByTrigger=new Map(Object.values(window.tripRailRoutes).filter(route=>route.trigger).map(route=>[route.trigger,route]));
  for(const [id,references] of Object.entries(window.tripTransitReferences)){
    const rail=railByTrigger.get(references.trigger);
    const markup=renderTransitReferences(references,rail?.first);
    transitReferencesByTrigger.set(references.trigger,markup);
    const title=document.getElementById(id)?.querySelector('.route-box h3');
    if(title)title.insertAdjacentHTML('afterend',rail?.first?renderRailRoute(rail)+markup+'<p class="trip-rail-kicker">Detalle del plan en bus</p>':markup+(rail?renderRailRoute(rail):''));
    else console.error(`No se encontró el encabezado de transporte: ${id}`);
  }

  const days=sourceDays.map((d,i)=>{
    const num=(d.id.match(/(\d+)$/)||[])[1]||String(i+1);
    const stops=[...d.querySelectorAll(':scope .timeline > .stop')].map((s,j)=>({
      arrival:getArrival(s.dataset.key),
      place:clean(s.querySelector('.place')?.textContent),
      time:clean(s.querySelector('.time')?.textContent),
      desc:clean(s.querySelector('.desc')?.textContent).replace(/^(PAUSA|GRATIS|PAGADO)\s*·\s*/,''),
      addr:clean(s.querySelector('.address .value')?.textContent),
      hours:(()=>{
        const h=s.querySelector('.it-hours-action');
        if(!h)return '';
        const txt=clean(h.textContent);
        const m=txt.match(/\d{1,2}:\d{2}\s*[ap]m\s*[–-]\s*\d{1,2}:\d{2}\s*[ap]m/i);
        return m?m[0]:(/por confirmar/i.test(txt)?'Por confirmar':'');
      })(),
      free:s.classList.contains('free'),
      paid:s.classList.contains('paid'),
      meal:clean(s.querySelector('.badge')?.textContent)==='PAUSA',
      night:s.dataset.highlight==='night',
      route:s.querySelector('.route-btn, .transfer-route-btn'),
      check:s.querySelector('.checkbtn input'),
      links:[...s.querySelectorAll('.actions a')]
    }));
    const transfers=[...d.querySelectorAll(':scope .transit-important')].map((x,j)=>({
      cls:[...x.classList].find(c=>c.startsWith('transit-')&&c!=='transit-important')||'',
      title:clean(x.querySelector('span')?.textContent||'Traslado importante').split(' · ')[0],
      detail:clean(x.querySelector('small')?.textContent||'')
    }));
    const head=clean(d.querySelector('.dayhead h2')?.textContent);
    const small=clean(d.querySelector('.dayhead small')?.textContent);
    const start=clean(d.querySelector('.start')?.textContent);
    return {num,id:d.id,head,small,start,stops,transfers};
  });

  /* -------- food source: keep every option -------- */
  const food={};
  foodPanels.forEach(p=>{
    const day=String(p.dataset.foodPanel);
    food[day]=[];
    p.querySelectorAll('.category-title').forEach(title=>{
      let node=title.nextElementSibling,items=[];
      while(node&&!node.classList.contains('category-title')){
        node.querySelectorAll?.('.option-card')?.forEach(c=>{
          const name=clean(c.querySelector('b')?.textContent);
          if(!name)return;
          const route=c.querySelector('.route-btn');
          items.push({
            name,
            meta:clean(c.querySelector('.meta')?.textContent),
            price:clean(c.querySelector('.price')?.textContent),
            dest:route?.dataset.destination||'',
            label:route?.dataset.destinationLabel||name,
            links:[...c.querySelectorAll('a')].map(a=>({text:clean(a.textContent),href:a.href}))
          });
        });
        node=node.nextElementSibling;
      }
      if(items.length)food[day].push({name:clean(title.textContent),items});
    });
  });

  const atlas=document.createElement('div');
  atlas.className='v106';
  atlas.innerHTML=`
    <div class="v106-shell">
      <a class="trip-skip" href="#tripDay">Saltar a las actividades</a>
      <header class="v106-mast">
        <div class="trip-mast-content">
          <div class="v106-brand"><span aria-hidden="true">✶</span> Guía de invierno <span class="trip-edition">/ 2026</span></div>
          <h1 class="v106-title">Chicago<span>en diciembre</span></h1>
          <p class="v106-sub"><b>02–11 DIC</b><span aria-hidden="true">/</span> Chicago + Wisconsin</p>
        </div>
        <div class="trip-snow" aria-hidden="true"><i></i><i></i><i></i></div>
      </header>
      <div class="trip-nav">
      <div class="trip-chapters" role="group" aria-label="Etapas del viaje">
        <button type="button" data-chapter="chicago" aria-controls="tripChicagoDays" aria-pressed="true">Chicago</button>
        <button type="button" data-chapter="wisconsin" aria-controls="tripWisconsinDays" aria-pressed="false">Wisconsin y regreso</button>
      </div>
      <nav aria-label="Días del itinerario" class="v106-dayrail" id="v106DayRail">
        <div class="trip-leg" role="group" aria-label="Chicago"><p>01 <span>Chicago</span></p><div class="trip-leg-days" id="tripChicagoDays"></div></div>
        <div class="trip-leg" role="group" aria-label="Wisconsin y regreso"><p>02 <span>Wisconsin y regreso</span></p><div class="trip-leg-days" id="tripWisconsinDays"></div></div>
      </nav>
      <div class="v106-nav">
        <div class="v106-modes">
          <button type="button" class="active" data-mode="route"><span aria-hidden="true">☷</span> Ruta</button>
          <button type="button" data-mode="food" aria-haspopup="dialog"><span aria-hidden="true">♨</span> Comida</button>
          <button type="button" data-mode="transit" aria-haspopup="dialog"><span aria-hidden="true">⇄</span> Transporte</button>
        </div>
      </div>
      </div>
      <main class="v106-page" id="tripDay" tabindex="-1">
        <header class="v106-head">
          <div>
            <div class="v106-kicker" id="v106Kicker"></div>
            <h2 class="v106-h1" id="v106Title"></h2>
            <p class="trip-start" id="tripStart" hidden></p>
          </div>
          <div class="v106-stats" id="v106Stats"></div>
          <details class="trip-settings"><summary>Preferencias de mapas</summary></details>
        </header>

        <section class="v106-view" id="v106RouteView">
          <section class="trip-brief" aria-label="Siguiente parada y progreso">
            <div class="trip-today">
              <div class="trip-eyebrow" id="tripNextLabel">Siguiente pendiente</div>
              <b id="tripNextPlace"></b>
              <span id="tripNextTime"></span>
              <button type="button" id="tripNextButton" class="trip-next">Ir a la parada <span aria-hidden="true">↓</span></button>
            </div>
            <div class="trip-progress">
              <div class="trip-eyebrow" id="tripProgressLabel">Avance del viaje</div>
              <output id="tripProgressText" for="tripProgress" aria-live="polite"></output>
              <progress id="tripProgress" aria-labelledby="tripProgressLabel"></progress>
              <span class="trip-progress-track" aria-hidden="true"><i></i></span>
            </div>
          </section>
          <div class="v106-journey-grid">
            <div class="trip-schedule">
              <h3 class="trip-section-title">Paradas del día</h3>
              <div class="v106-route" id="v106Route"></div>
            </div>
            <aside class="v106-side">
              <div class="v106-panel" id="v106BriefPanel"></div>
            </aside>
          </div>
        </section>

        <section class="v106-food" id="v106FoodView">
          <div class="v106-section-title">Comida</div>
          <div class="v106-section-sub">Elige una categoría para ver los lugares.</div>
          <div id="v106FoodContent"></div>
        </section>

        <section class="v106-transit" id="v106TransitView">
          <div class="v106-section-title">Transport map</div>
          <div class="v106-section-sub">Cada traslado importante del día, con acceso al plan completo y al mapa.</div>
          <div class="v106-transit-grid" id="v106TransitContent"></div>
        </section>
      </main>
    </div>`;
  document.body.insertBefore(atlas,document.body.firstChild);
  const tripNav=atlas.querySelector('.trip-nav');
  new ResizeObserver(()=>{
    document.documentElement.style.setProperty('--trip-nav-height',`${Math.ceil(tripNav.getBoundingClientRect().height)+8}px`);
  }).observe(tripNav);
  const mapControls=document.querySelector('body > .route-controls');
  if(mapControls)atlas.querySelector('.trip-settings').append(mapControls);

  const checkable=days.flatMap(day=>day.stops).filter(stop=>stop.check);
  const nextButton=atlas.querySelector('#tripNextButton');
  const progress=atlas.querySelector('#tripProgress');
  const progressTrack=atlas.querySelector('.trip-progress-track');
  progress.max=checkable.length||1;
  nextButton.addEventListener('click',()=>{
    const stop=atlas.querySelector(`#tripStop${nextButton.dataset.stop}`);
    if(!stop)return;
    stop.focus({preventScroll:true});
    stop.scrollIntoView({block:'start',behavior:'instant'});
  });

  function updateBrief(day){
    const done=checkable.filter(stop=>stop.check.checked).length;
    progress.value=done;
    progressTrack.style.setProperty('--trip-completion',String(done/progress.max));
    atlas.querySelector('#tripProgressText').textContent=`${done} de ${checkable.length} completadas`;
    const index=day.stops.findIndex(stop=>stop.check&&!stop.check.checked);
    const next=day.stops[index];
    atlas.querySelector('#tripNextLabel').textContent=next?'Siguiente pendiente':'Progreso del día';
    atlas.querySelector('#tripNextPlace').textContent=next?.place||
      (day.stops.some(stop=>stop.check)?'Día completado':'Sin actividades para marcar');
    atlas.querySelector('#tripNextTime').textContent=next?.time||'';
    nextButton.hidden=!next;
    nextButton.dataset.stop=index;
  }

  const rail=atlas.querySelector('#v106DayRail');
  const chicagoDays=rail.querySelector('#tripChicagoDays');
  const wisconsinDays=rail.querySelector('#tripWisconsinDays');
  days.forEach((d,i)=>{
    const b=document.createElement('button');
    b.className='v106-day';b.dataset.day=i;
    const date=d.head.split('|')[0].trim().match(/\d+\s+dic/i)?.[0]||'';
    b.type='button';
    b.setAttribute('aria-label',`Día ${d.num}${date?', '+date:''}`);
    b.innerHTML=`<small>Día ${esc(d.num)}</small><strong>${esc(date)}</strong>`;
    (i<5?chicagoDays:wisconsinDays).appendChild(b);
  });

  function activateOriginalTransfer(cls){
    const source=document.querySelector('.app .'+cls);
    if(source){source.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));return}
  }

  function openOriginalMapFromModal(modal, selector){
    const b=modal?.querySelector(selector);
    if(b)b.click();
  }

  function renderRoute(d){
    atlas.querySelector('#v106Route').innerHTML=d.stops.map((s,i)=>{
      const routeLabel=s.route?.dataset.transferTarget?clean(s.route.textContent):'Ver trayecto';
      const hasMedia=s.arrival?.photo||s.arrival?.photos?.length||s.arrival?.diagram;
      const mediaId=`tripStopMedia${i}`;
      return `
      <article class="v106-stop ${s.free?'free':s.paid?'paid':''}${s.night?' trip-stop-night':''}${s.check?.checked?' trip-stop-done':''}" id="tripStop${i}" tabindex="-1" style="--trip-stop-order:${Math.min(i,5)}">
        <span class="v106-stop-pin" aria-hidden="true"><span>${String(i+1).padStart(2,'0')}</span></span>
        <div class="trip-stop-meta">
          <div class="v106-time">${icon('clock')}${esc(s.time)}</div>
          <span class="v106-tag ${s.meal?'trip-meal':s.free?'free':s.paid?'paid':''}">${s.meal?'Pausa para comer':s.night?'Sesión nocturna':s.free?'Gratis':s.paid?'Pagado':'Actividad'}</span>
        </div>
        <div class="v106-stop-main">
          <h4 class="v106-place">${esc(s.place)}</h4>
          ${s.desc?`<div class="v106-stop-desc">${esc(s.desc)}</div>`:''}
          ${s.addr?`<div class="v106-address">${icon('map')}<span>${esc(s.addr)}</span></div>`:''}
          ${s.hours?`<div class="v106-hours"><b>Horario del lugar:</b> ${esc(s.hours)}</div>`:''}
          <div class="v106-actions">
            ${s.route?`<button type="button" class="primary v106-route-btn trip-icon-action trip-route-action" aria-label="${esc(routeLabel)}" title="${esc(routeLabel)}" data-stop-index="${i}">${icon('route')}<span class="trip-action-text">Ruta</span></button>`:''}
            ${hasMedia?`<button type="button" class="trip-icon-action" data-guide-media="${mediaId}" aria-controls="${mediaId}" aria-label="Ver fotos y esquemas de esta parada">${icon('camera')}<span class="trip-action-text">Fotos y esquemas</span></button>`:''}
            ${s.links.filter(link=>!(hasMedia||s.meal)||!isImageSearch(link)).map(stopLink).join('')}
            ${s.check?`<label class="trip-check"><input type="checkbox" data-stop-index="${i}" aria-label="${esc(`Marcar como hecha: ${s.place}`)}"${s.check.checked?' checked':''}/><span class="trip-action-text">Hecha</span></label>`:''}
          </div>
          ${renderArrival(s.arrival,mediaId)}
        </div>
      </article>`;
    }).join('');

    const seatForm=atlas.querySelector('.trip-seat-note');
    if(seatForm){
      const note=seatForm.elements.namedItem('seats');
      const status=seatForm.querySelector('[role="status"]');
      try{note.value=localStorage.getItem(seatNoteKey)||''}
      catch(e){status.textContent='No se pudo leer la nota guardada en este navegador.'}
      seatForm.addEventListener('submit',e=>{
        e.preventDefault();
        const value=note.value.trim();
        try{
          if(value)localStorage.setItem(seatNoteKey,value);
          else localStorage.removeItem(seatNoteKey);
          status.textContent=`${value?'Nota guardada.':'Nota borrada.'} ${seatNoteHelp}`;
        }catch(e){status.textContent='No se pudo guardar la nota en este navegador.'}
      });
    }

    atlas.querySelectorAll('.v106-route-btn').forEach(b=>{
      const route=d.stops[Number(b.dataset.stopIndex)].route;
      const target=route.dataset.transferTarget;
      const source=target?sourceDays[Number(d.num)-1].querySelector('.'+target):route;
      if(source)b.addEventListener('click',()=>source.click());
    });

    atlas.querySelectorAll('[data-guide-media]').forEach(button=>{
      button.addEventListener('click',()=>{
        const gallery=document.getElementById(button.dataset.guideMedia);
        gallery.closest('.trip-place-guide').open=true;
        gallery.open=true;
        const summary=gallery.querySelector('summary');
        summary.focus({preventScroll:true});
        summary.scrollIntoView({block:'start',behavior:reduceMotion.matches?'instant':'smooth'});
      });
    });

    atlas.querySelectorAll('.trip-check input').forEach(box=>{
      const original=d.stops[Number(box.dataset.stopIndex)].check;
      box.addEventListener('change',()=>{
        original.checked=box.checked;
        original.dispatchEvent(new Event('change',{bubbles:true}));
        const card=box.closest('.v106-stop');
        card.classList.toggle('trip-stop-done',box.checked);
        card.classList.toggle('trip-stop-celebrate',box.checked);
        updateBrief(d);
      });
    });

    atlas.querySelector('#v106BriefPanel').innerHTML=`
      <div class="v106-eyeline">En movimiento</div>
      <h3>Traslados del día</h3>
      ${d.transfers.length?'':'<p class="note">No hay traslados destacados para este día.</p>'}
      ${d.transfers.map((t,i)=>{
        const rail=railByTrigger.get(t.cls);
        return `
        <div class="trip-transfer-card">
          <button type="button" class="v106-transfer" data-transfer-class="${esc(t.cls)}">
            <span class="trip-transfer-icon">${icon(rail?.first||t.cls.endsWith('-ohare')?'rail':'route')}</span>
            <span class="trip-transfer-copy">
              <span class="trip-transfer-index">Traslado ${String(i+1).padStart(2,'0')}</span>
              <strong class="v106-transfer-name">${esc(t.title)}</strong>
              <span class="v106-transfer-route">${esc(rail?.first?rail.label:t.detail)}</span>
            </span>
            <span class="trip-transfer-arrow" aria-hidden="true">›</span>
          </button>${transitReferencesByTrigger.get(t.cls)??(t.cls==='transit-d1-ohare'?renderArrival(getArrival(t.cls)):'')}
        </div>`;
      }).join('')}`;

    atlas.querySelectorAll('.v106-transfer[data-transfer-class]').forEach(el=>{
      const open=()=>{
        const source=document.querySelector('.app .'+el.dataset.transferClass);
        if(source)source.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
      };
      el.addEventListener('click',open);
    });
  }

  function renderFood(d){
    const content=atlas.querySelector('#v106FoodContent');
    const cats=[
      {key:'breakfast',label:'Desayunos',desc:'Café · brunch · bagels',img:'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1400&q=88',icon:'☕'},
      {key:'fast',label:'Comida rápida',desc:'Rápido · casual · económico',img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=88',icon:'🍔'},
      {key:'market',label:'Supermercados',desc:'Agua · snacks · provisiones',img:'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=88',icon:'🛒'},
      {key:'classic',label:'Chicago clásico',desc:'Pizza · hot dogs · sabores locales',img:'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1400&q=88',icon:'🌭'},
      {key:'shops',label:'Tiendas',desc:'Compras · souvenirs · ropa',img:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=88',icon:'🛍️'}
    ];
    content.innerHTML=`<div class="v142-food-home">${cats.map(c=>`
      <button class="v142-food-card" type="button" data-food-category="c.key"style="--food-image:url('{c.img}')">
        <span class="v142-food-bg"></span><span class="v142-food-shade"></span>
        <span class="v142-food-icon">${c.icon}</span>
        <span class="v142-food-copy"><b>c.label</b><small>{c.desc}</small></span>
        <span class="v142-food-arrow">›</span>
      </button>`).join('')}</div>`;

    content.querySelectorAll('[data-food-category]').forEach(btn=>btn.addEventListener('click',()=>{
      const modal=document.getElementById('foodModal');
      const float=document.getElementById('foodFloat');
      if(float) float.click();
      setTimeout(()=>{
        const target=document.querySelector(`#foodModal [data-v141-cat="${btn.dataset.foodCategory}"]`);
        if(target) target.click();
      },30);
    }));
  }

  function renderTransit(d){
    const grid=atlas.querySelector('#v106TransitContent');
    grid.innerHTML=d.transfers.length?d.transfers.map((t,i)=>`
      <article class="v106-transit-card">
        <div class="v106-transit-num">Traslado ${String(i+1).padStart(2,'0')}</div>
        <h4>${esc(t.title)}</h4>
        <p>${esc(t.detail)}</p>
        <div class="v106-transit-actions">
          <button class="main v106-open-transfer" data-cls="${esc(t.cls)}">Ver plan de viaje</button>
          <button class="v106-open-map" data-cls="${esc(t.cls)}">Abrir mapa</button>
        </div>
      </article>`).join('')
    :'<article class="v106-transit-card"><div class="v106-transit-num">Transport</div><h4>Sin traslados destacados</h4><p>Este día no tiene bloques de transporte importantes.</p></article>';

    grid.querySelectorAll('.v106-open-transfer').forEach(b=>{
      b.addEventListener('click',()=>activateOriginalTransfer(b.dataset.cls));
    });
    grid.querySelectorAll('.v106-open-map').forEach(b=>{
      b.addEventListener('click',()=>{
        const src=document.querySelector('.app .'+b.dataset.cls);
        const mapButton=src?.querySelector('button[class*="map"]')||src?.querySelector('button[data-');
        if(mapButton)mapButton.click();
        else activateOriginalTransfer(b.dataset.cls);
      });
    });
  }

  const chapterButtons=[...atlas.querySelectorAll('[data-chapter]')];
  const chapterDays={chicago:0,wisconsin:5};
  function render(i){
    const d=days[i];
    const chapter=i<5?'chicago':'wisconsin';
    atlas.dataset.tripRegion=chapter;
    document.body.dataset.tripRegion=chapter;
    chapterDays[chapter]=i;
    chapterButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.chapter===chapter)));
    rail.querySelectorAll('.v106-day').forEach((b,n)=>{
      b.classList.toggle('active',n===i);
      if(n===i)b.setAttribute('aria-current','true');
      else b.removeAttribute('aria-current');
    });
    const cleanHead=d.head.replace(/^Día\s*\d+\s*[—-]\s*/,'');
    const parts=cleanHead.split('|');
    atlas.querySelector('#v106Kicker').textContent=`Día ${d.num} · ${parts[0].trim()}`;
    atlas.querySelector('#v106Title').textContent=parts.slice(1).join(' · ').trim()||cleanHead;
    const start=atlas.querySelector('#tripStart');
    start.textContent=d.start;
    start.hidden=!d.start;
    atlas.querySelector('#v106Stats').innerHTML=`
      <div class="v106-stat"><b>${d.stops.length}</b><span>paradas</span></div>
      <div class="v106-stat"><b>${d.transfers.length}</b><span>traslados</span></div>
      <div class="v106-stat"><b>${food[d.num]?.reduce((n,g)=>n+g.items.length,0) || guideFoodPicks.filter(p=>p.day===d.num).length}</b><span>opciones comida</span></div>`;
    renderRoute(d);renderTransit(d);updateBrief(d);
  }

  function mode(which){
    atlas.querySelectorAll('.v106-modes button').forEach(b=>b.classList.toggle('active',b.dataset.mode===which));
    atlas.querySelector('#v106RouteView').style.display=which==='route'?'block':'none';
    atlas.querySelector('#v106FoodView').classList.toggle('active',which==='food');
    atlas.querySelector('#v106TransitView').classList.toggle('active',which==='transit');
  }

  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const dayHeader=atlas.querySelector('.v106-head');
  let headerMotion;
  function navigateDay(i){
    const direction=i<Number(rail.querySelector('.active')?.dataset.day)?-1:1;
    render(i);
    headerMotion?.cancel();
    if(!reduceMotion.matches){
      headerMotion=dayHeader.animate(
        [{opacity:.4,transform:`translateX(${direction*10}px)`},{opacity:1,transform:'translateX(0)'}],
        {duration:310,easing:'cubic-bezier(.2,.65,.25,1)'}
      );
    }
    atlas.querySelector('#tripDay').scrollIntoView({block:'start',behavior:'instant'});
  }
  reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches)headerMotion?.cancel()});
  rail.querySelectorAll('.v106-day').forEach(b=>b.addEventListener('click',()=>navigateDay(Number(b.dataset.day))));
  chapterButtons.forEach(button=>button.addEventListener('click',()=>{
    const chapter=button.dataset.chapter;
    if(chapter!==atlas.dataset.tripRegion)navigateDay(chapterDays[chapter]);
  }));
  atlas.querySelectorAll('.v106-modes button').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));


  /* =========================================================
     v126 · TRANSPORT LOGIC FIX
     Built only from the original .zs-route semantic blocks.
     ========================================================= */
  function buildModal(modal){
    if(!modal || modal.dataset.v126Built) return;
    const box=modal.querySelector('.route-box');
    if(!box) return;

    function busSvg(){
      return `<svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4.5" width="16" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M7 16.5v3M17 16.5v3M5 9.5h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="8" cy="14" r="1.2" fill="currentColor"/><circle cx="16" cy="14" r="1.2" fill="currentColor"/>
      </svg>`;
    }
    function trainSvg(){
      return `<svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="4" width="12" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M8 8h8M9 12h6M8 19l-2 2M16 19l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    }

    const title=clean(box.querySelector('h3')?.textContent||'Traslado');
    const sourceRoutes=[...box.querySelectorAll('.zs-route')];
    const transitRoutes=sourceRoutes.filter(r=>{
      const h=clean(r.querySelector('.zs-route-head b')?.textContent||'');
      return /^(?:🚌|🚇)/u.test(h);
    });
    if(!transitRoutes.length) return;

    modal.dataset.v126Built='1';
    modal.classList.add('v126-modal');

    const titleParts=title.split('→').map(clean).filter(Boolean);
    const origin=titleParts[0]||'Origen';
    const destination=titleParts[titleParts.length-1]||'Destino';

    const lineFromHead = route => clean(route.querySelector('.zs-route-head b')?.textContent||'')
      .replace(/^(?:🚌|🚇)\s*/u,'')
      .replace(/\s*·\s*(primera opción|backup|respaldo|conexión|siguiente respaldo|ruta principal|salida.*)$/i,'')
      .trim();

    const headText = route => clean(route.querySelector('.zs-route-head b')?.textContent||'');

    const strongsForLabel = (route, labelRegex) => {
      const values=[];
      route.querySelectorAll('.zs-walk').forEach(w=>{
        const b=w.querySelector('b');
        if(!b || !labelRegex.test(clean(b.textContent))) return;
        w.querySelectorAll('strong').forEach(s=>{
          const value=clean(s.textContent);
          if(value && !values.includes(value)) values.push(value);
        });
      });
      return values;
    };

    function walkInstruction(route,label){
      const walk=[...route.querySelectorAll('.zs-walk')].find(w=>label.test(clean(w.querySelector('b')?.textContent)));
      if(!walk)return '';
      const text=clean(walk.textContent).replace(/^[^\p{L}\p{N}]+/u,'');
      const prefix=clean(walk.querySelector('b')?.textContent);
      return text.startsWith(prefix)?text.slice(prefix.length).trim():text;
    }

    function boardingFromRoute(route, line){
      // Explicit labels first.
      for(const label of [/^Subida/i,/^Salida/i,/^Ruta/i]){
        const values=strongsForLabel(route,label);
        if(!values.length) continue;

        if(/^Ruta/i.test(label)){
          const idx=values.findIndex(v=>v.toLowerCase().includes(line.toLowerCase()));
          if(idx>0) return values[idx-1];
          if(values.length>=2) return values[0];
        }else{
          // Salida/lúgar de subida: the final strong is normally the stop.
          return /^Salida/i.test(label) ? values[values.length-1] : values[0];
        }
      }

      // Plain-text cases such as O'Hare / Blue Line.
      const walks=[...route.querySelectorAll('.zs-walk')].map(x=>clean(x.textContent));
      for(const text of walks){
        let m=text.match(/(?:desde|de)\s+([^·]+?)(?:\s+sigue|\s+camina|\s+para|\.|$)/i);
        if(m && /Salida/i.test(text)) return clean(m[1]);

        m=text.match(/(?:hasta|a)\s+([^·]+?)(?:\s+para tomar|\.|$)/i);
        if(m && /Salida|Subida/i.test(text)) return clean(m[1]);
      }

      return '';
    }

    function alightingFromRoute(route, line){
      // Explicit "Bajada" or "Final" is authoritative.
      for(const label of [/^Bajada/i,/^Final/i]){
        const values=strongsForLabel(route,label);
        if(values.length) return values[0];
      }

      // A "Ruta" sentence uses: boarding → bus → alighting.
      const values=strongsForLabel(route,/^Ruta/i);
      if(values.length){
        const idx=values.findIndex(v=>v.toLowerCase().includes(line.toLowerCase()));
        if(idx>=0 && values[idx+1]) return values[idx+1];
        if(values.length>=2) return values[values.length-1];
      }

      // Plain text / Blue Line.
      const walks=[...route.querySelectorAll('.zs-walk')].map(x=>clean(x.textContent));
      for(const text of walks){
        let m=text.match(/(?:bajas?|bajar|bájate)\s+en\s+([^·.;]+)/i);
        if(m) return clean(m[1]);
      }
      for(const row of route.querySelectorAll('.zs-time em')){
        const text=clean(row.textContent);
        let m=text.match(/(?:bajar en|baja en)\s+([^·.;]+)/i);
        if(m) return clean(m[1]);
      }
      return '';
    }

    function parseTimeMinutes(value){
      const m=clean(value).match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
      if(!m) return null;
      let h=Number(m[1]), min=Number(m[2]);
      const ap=m[3].toLowerCase();
      if(ap==='pm' && h<12) h+=12;
      if(ap==='am' && h===12) h=0;
      return h*60+min;
    }

    function formatTimeMinutes(total){
      total=((total%1440)+1440)%1440;
      let h=Math.floor(total/60), min=total%60;
      const ap=h>=12?'pm':'am';
      h=h%12||12;
      return `${h}:${String(min).padStart(2,'0')} ${ap}`;
    }

    function durationMinutes(route){
      const head=clean(route.querySelector('.zs-route-head span')?.textContent||'');
      const candidates=[
        head,
        ...[...route.querySelectorAll('.zs-time em')].map(x=>clean(x.textContent))
      ];
      for(const text of candidates){
        const m=text.match(/(?:≈|~)?\s*(\d+)\s*(?:min|mins|minutes)\b/i);
        if(m) return Number(m[1]);
      }
      return null;
    }

    function arrivalFromDetail(detail){
      const matches=[...clean(detail).matchAll(/(\d{1,2}:\d{2})\s*(am|pm)/ig)];
      if(!matches.length) return '';
      const last=matches[matches.length-1];
      return `${last[1]} ${last[2].toLowerCase()}`;
    }

    function parseSchedules(routes){
      const schedules=[];
      routes.forEach(route=>{
        const dur=durationMinutes(route);
        route.querySelectorAll('.zs-time').forEach(row=>{
          const rawTime=clean(row.querySelector('strong')?.textContent);
          const detail=clean(row.querySelector('em')?.textContent);

          /* Some rows are real departures even when the label also contains
             a stop, e.g. "Armitage · 3:03 pm". */
          const departureMatch=rawTime.match(/(\d{1,2}:\d{2})\s*(am|pm)/i);
          if(!departureMatch) return;

          const departure=`${departureMatch[1]} ${departureMatch[2].toLowerCase()}`;
          let arrival=arrivalFromDetail(detail);

          /* When the source only gives a duration, derive the approximate
             arrival from the selected departure. */
          if(!arrival && dur!=null){
            const mins=parseTimeMinutes(departure);
            if(mins!=null) arrival=formatTimeMinutes(mins+dur);
          }

          schedules.push({
            time:rawTime,
            detail,
            arrival,
            line:lineFromHead(route),
            recommended:row.hasAttribute('data-recommended')
          });
        });
      });
      return schedules;
    }

    /* "primera opción/backup/respaldo" = same bus leg.
       "conexión" = next actual bus leg. */
    const legs=[];
    transitRoutes.forEach(route=>{
      const line=lineFromHead(route);
      const head=headText(route);
      const connection=/\bconexi[oó]n\b/i.test(head);

      if(!legs.length || connection){
        legs.push({line, routes:[route]});
      }else if(legs[legs.length-1].line===line || /backup|respaldo|primera opción/i.test(head)){
        legs[legs.length-1].routes.push(route);
      }else{
        legs.push({line, routes:[route]});
      }
    });

    const data=legs.map(leg=>{
      const primary=leg.routes.find(r=>/primera opci[oó]n|ruta principal|salida/i.test(headText(r))) || leg.routes[0];
      const boarding=boardingFromRoute(primary,leg.line);
      const alighting=alightingFromRoute(primary,leg.line);
      const schedules=parseSchedules(leg.routes);
      const initial=Math.max(0,schedules.findIndex(option=>option.recommended));

      return {
        line:leg.line,
        boarding,
        alighting,
        boardingNote:walkInstruction(primary,/^(Subida|Salida|Cómo llegar|Ir a)/i),
        alightingNote:walkInstruction(primary,/^(Bajada|Final)/i),
        rideNote:clean(primary.querySelector('.zs-route-head span')?.textContent),
        schedules,
        initial
      };
    });

    const intro=clean(box.querySelector('.route-sub')?.textContent);
    const planningNote=clean(box.querySelector('.zs-note')?.textContent);
    const seenMaps=new Set();
    const maps=[...box.querySelectorAll('.zs-maprow button')].flatMap(button=>{
      const label=clean(button.textContent).replace(/^[^\p{L}\p{N}]+/u,'');
      if(!label||seenMaps.has(label))return [];
      seenMaps.add(label);
      return [[label,button]];
    });
    const fullMap=maps.find(([label])=>/ruta completa/i.test(label))?.[1];
    const walkMapLinks = match => maps.map(([label],idx)=>match.test(label)
      ?`<button class="guide-step-map" type="button" data-step-map="${idx}">${esc(label)} ↗</button>`:'').join('');
    const startMaps=walkMapLinks(/^caminar a (?:la parada|jackson|armitage|webster)/i);
    const endMaps=walkMapLinks(/^caminar (?:al |a la entrada)/i);
    const summaryIndex=data.findIndex(g=>g.schedules.length);
    const summary=data[summaryIndex]?.schedules[data[summaryIndex].initial];

    /* Hide original transport blocks; keep them as source for their working map buttons. */
    [...box.querySelectorAll('.zs-route,.zs-note')].forEach(x=>x.style.display='none');

    const schedules=data.map((g,gi)=>g.schedules.length?`
          <section class="v126-leg" data-leg="${gi}">
            <div class="v126-leg-head">
              <div class="v126-leg-name">
  <span class="v130-vehicle" aria-hidden="true">${/Blue Line/i.test(g.line)?trainSvg():busSvg()}</span>
  <span>${esc(g.line)}</span>
</div>
              <div class="v126-leg-count">${g.schedules.length} ${g.schedules.length===1?'horario':'horarios'}</div>
            </div>
            <div class="v126-picker">
              ${g.schedules.map((s,i)=>`
                <button type="button" class="v126-chip${i===g.initial?' active':''}" aria-pressed="${i===g.initial}">
                  <small>${s.recommended?'Recomendada':s.line!==g.line?esc(s.line):`Opción ${i+1}`}</small>
                  <strong>${esc(s.time)}</strong>
                  <span>${esc(s.arrival?`→ ${s.arrival}`:s.detail.slice(0,36))}</span>
                </button>`).join('')}
            </div>
          </section>`:'').join('');
    const mount=document.createElement('div');
    mount.innerHTML=`
      <div class="v126-content">
        ${summary?`
          <div class="v126-selected" aria-live="polite">
            <div><small>Salida de referencia</small><b data-selected-depart>${esc(summary.time)}</b></div>
            <div class="arrow">→</div>
            <div class="arr"><small>Llegada aproximada</small><b data-selected-arrive>${esc(summary.arrival||'Sin confirmar')}</b></div>
          </div>`:''}

        <ol class="v126-route guide-route-steps" aria-label="Pasos del trayecto">

          ${data.map((g,gi)=>`
            <li class="v126-step walk">
              <span class="v126-icon" aria-hidden="true"></span>
              <div class="v126-text">
                <div class="v126-label">${gi===0?'Camina a la parada':'Sigue a la siguiente parada'}</div>
                <div class="v126-main">${esc(g.boarding||'Consulta la parada en el mapa')}</div>
                ${g.boardingNote?`<p class="guide-step-note">${esc(g.boardingNote)}</p>`:''}
                ${gi===0&&startMaps?`<div class="guide-step-actions">${startMaps}</div>`:''}
              </div>
            </li>

            <li class="v126-step bus">
              <span class="v126-icon" aria-hidden="true"></span>
              <div class="v126-text">
                <div class="v126-label">Toma el transporte</div>
                <div class="v126-main v126-busrow">
                  <span class="guide-step-vehicle" aria-hidden="true">${/Blue Line/i.test(g.line)?trainSvg():busSvg()}</span>
                  <span data-ride-line="${gi}">${esc(g.schedules[g.initial]?.line||g.line)}</span>
                  ${g.schedules.length?`<span class="v126-time" data-inline="${gi}">${esc(g.schedules[g.initial].time)}</span>`:''}
                </div>
                ${g.rideNote?`<p class="guide-step-note" data-ride-note="${gi}"${g.schedules[g.initial]&&g.schedules[g.initial].line!==g.line?' hidden':''}>${esc(g.rideNote)}</p>`:''}
              </div>
            </li>

            <li class="v126-step stop">
              <span class="v126-icon" aria-hidden="true"></span>
              <div class="v126-text">
                <div class="v126-label">Baja en</div>
                <div class="v126-main">${esc(g.alighting||'Consulta la parada en el mapa')}</div>
                ${g.alightingNote?`<p class="guide-step-note">${esc(g.alightingNote)}</p>`:''}
              </div>
            </li>
          `).join('')}

          <li class="v126-step finish">
            <span class="v126-icon" aria-hidden="true"></span>
            <div class="v126-text">
              <div class="v126-label">Destino</div>
              <div class="v126-main">${esc(destination)}</div>
              ${endMaps?`<div class="guide-step-actions">${endMaps}</div>`:''}
            </div>
          </li>
        </ol>

        ${fullMap?`<div class="v126-map"><button type="button" data-full-route>Ver ruta en el mapa ↗</button></div>`:''}
        ${summary?`<details class="guide-route-extra"><summary>Horarios y alternativas</summary>
          ${schedules}
          ${data.map((g,gi)=>g.schedules.length?`<p class="guide-step-note guide-schedule-note" data-schedule-note="${gi}" aria-live="polite">${esc(g.schedules[g.initial].detail)}</p>`:'').join('')}
        </details>`:''}
        ${intro||planningNote?`<details class="guide-route-extra"><summary>Notas del trayecto</summary>
          ${intro?`<p>${esc(intro)}</p>`:''}
          ${planningNote?`<p>${esc(planningNote)}</p>`:''}
        </details>`:''}
      </div>
    `;

    const content=mount.firstElementChild;
    box.querySelector('h3')?.insertAdjacentElement('afterend',content);

    data.forEach((g,gi)=>{
      const leg=content.querySelector(`[data-leg="${gi}"]`);
      const inline=content.querySelector(`[data-inline="${gi}"]`);
      const rideLine=content.querySelector(`[data-ride-line="${gi}"]`);
      const rideNote=content.querySelector(`[data-ride-note="${gi}"]`);
      const detail=content.querySelector(`[data-schedule-note="${gi}"]`);
      if(!leg) return;

      leg.querySelectorAll('.v126-chip').forEach((chip,i)=>{
        chip.addEventListener('click',()=>{
          leg.querySelectorAll('.v126-chip').forEach(x=>{
            x.classList.toggle('active',x===chip);
            x.setAttribute('aria-pressed',String(x===chip));
          });
          const selected=g.schedules[i];
          if(inline) inline.textContent=selected.time;
          rideLine.textContent=selected.line;
          if(rideNote)rideNote.hidden=selected.line!==g.line;
          detail.textContent=selected.detail;

          if(gi===summaryIndex){
            const d=content.querySelector('[data-selected-depart]');
            const a=content.querySelector('[data-selected-arrive]');
            if(d) d.textContent=selected.time;
            if(a) a.textContent=selected.arrival||'Sin confirmar';
          }
        });
      });
    });

    content.querySelector('[data-full-route]')?.addEventListener('click',()=>fullMap?.click());
    content.querySelectorAll('[data-step-map]').forEach(button=>{
      button.addEventListener('click',()=>maps[Number(button.dataset.stepMap)][1].click());
    });
  }

  document.querySelectorAll('.route-modal').forEach(buildModal);

  render(0);
  mode('route');
})();
