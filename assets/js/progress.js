(function(){
 const KEY='chicago-itinerary-v4-completed';
 const PACK_KEY='chicago-itinerary-v4-packlist';
 const TRIP_START=new Date('2026-12-02T09:12:00');

 const state=JSON.parse(localStorage.getItem(KEY)||'{}');
 const packState=JSON.parse(localStorage.getItem(PACK_KEY)||'{}');

 const stops=[...document.querySelectorAll('.stop')];
 const boxes=[...document.querySelectorAll('.stop input[type=checkbox]')];
 const days=[...document.querySelectorAll('.day')];
 const filters=[...document.querySelectorAll('.filter')];
 const searchInput=document.getElementById('searchInput');
 const progressText=document.getElementById('progressText');
 const progressBar=document.getElementById('progressBar');
 const topBtn=document.getElementById('topBtn');
 const countdownEl=document.getElementById('countdown');

 const toast=document.createElement('div');
 toast.className='toast';
 document.body.appendChild(toast);

 let activeFilter='all';
 let searchTerm='';

 function showToast(message){
   toast.textContent=message;
   toast.classList.add('show');
   clearTimeout(showToast.timer);
   showToast.timer=setTimeout(function(){toast.classList.remove('show');},1700);
 }

 function saveState(){
   localStorage.setItem(KEY,JSON.stringify(state));
   render();
 }

 function savePack(){
   localStorage.setItem(PACK_KEY,JSON.stringify(packState));
 }

 function updateHeroStats(){
   const free=stops.filter(function(stop){return stop.classList.contains('free');}).length;
   const paid=stops.filter(function(stop){return stop.classList.contains('paid');}).length;
   const daysCount=document.getElementById('daysCount');
   const stopsCount=document.getElementById('stopsCount');
   const freeCount=document.getElementById('freeCount');
   const paidCount=document.getElementById('paidCount');
   if(daysCount){daysCount.textContent=String(days.length);}
   if(stopsCount){stopsCount.textContent=String(stops.length);}
   if(freeCount){freeCount.textContent=String(free);}
   if(paidCount){paidCount.textContent=String(paid);}
 }

 function updateCountdown(){
   if(!countdownEl){return;}
   const now=new Date();
   const diffMs=TRIP_START-now;
   if(diffMs<=0){
     countdownEl.textContent='El viaje ya comenzo. Disfruta Chicago.';
     return;
   }
   const totalHours=Math.floor(diffMs/3600000);
   const daysLeft=Math.floor(totalHours/24);
   const hoursLeft=totalHours%24;
   countdownEl.textContent='Faltan '+daysLeft+' dias y '+hoursLeft+' horas para despegar.';
 }

 function matchesFilter(stop){
   const key=stop.dataset.key;
   const done=!!state[key];
   if(activeFilter==='done'){return done;}
   if(activeFilter==='pending'){return !done;}
   if(activeFilter==='free'){return stop.classList.contains('free');}
   if(activeFilter==='paid'){return stop.classList.contains('paid');}
   return true;
 }

 function matchesSearch(stop){
   if(!searchTerm){return true;}
   return stop.textContent.toLowerCase().indexOf(searchTerm)!==-1;
 }

 function ensureDayPlaceholder(day){
   let empty=day.querySelector('.emptyday');
   if(!empty){
     empty=document.createElement('div');
     empty.className='emptyday';
     empty.textContent='No hay actividades que coincidan con tu busqueda o filtro.';
     const timeline=day.querySelector('.timeline');
     if(timeline){timeline.insertAdjacentElement('afterend',empty);}
   }
   return empty;
 }

 function applyVisibility(){
   days.forEach(function(day){
     let visibleCount=0;
     day.querySelectorAll('.stop').forEach(function(stop){
       const visible=matchesFilter(stop)&&matchesSearch(stop);
       stop.classList.toggle('hidden',!visible);
       if(visible){visibleCount++;}
     });
     const empty=ensureDayPlaceholder(day);
     if(empty){
       const filtering = !!searchTerm || activeFilter!=='all';
       empty.hidden=!filtering || visibleCount!==0 || day.classList.contains('collapsed');
     }
   });
 }

 function render(){
   let done=0;
   boxes.forEach(function(box){
     const stop=box.closest('.stop');
     const key=stop.dataset.key;
     box.checked=!!state[key];
     stop.classList.toggle('done',!!state[key]);
     if(state[key]){done++;}
   });
   const total=boxes.length;
   if(progressText){progressText.textContent=done+' / '+total;}
   if(progressBar){progressBar.style.width=(total?done/total*100:0)+'%';}
   applyVisibility();
   updateHeroStats();
 }

 function markDayDone(dayNumber){
   document.querySelectorAll('#day'+dayNumber+' .stop input[type=checkbox]').forEach(function(box){
     state[box.closest('.stop').dataset.key]=true;
   });
   saveState();
   showToast('Dia '+dayNumber+' marcado como hecho');
 }

 function resetAll(){
   if(!confirm('¿Reiniciar todas las actividades marcadas?')){return;}
   Object.keys(state).forEach(function(key){delete state[key];});
   saveState();
   showToast('Progreso reiniciado');
 }

 function jumpToNextPending(){
   const next=stops.find(function(stop){
     const key=stop.dataset.key;
     return !state[key]&&!stop.classList.contains('hidden');
   });
   if(!next){
     showToast('No hay pendientes con el filtro actual.');
     return;
   }
   next.scrollIntoView({behavior:'smooth',block:'center'});
   next.classList.add('flash');
   setTimeout(function(){next.classList.remove('flash');},1300);
 }

 function sharePlan(){
   const done=boxes.filter(function(box){return box.checked;}).length;
   const total=boxes.length;
   const text='Itinerario Chicago: '+done+'/'+total+' actividades completadas.';
   if(navigator.share){
     navigator.share({title:'Itinerario Chicago',text:text}).catch(function(){});
     return;
   }
   if(navigator.clipboard&&navigator.clipboard.writeText){
     navigator.clipboard.writeText(text).then(function(){
       showToast('Resumen copiado para compartir');
     }).catch(function(){
       showToast(text);
     });
     return;
   }
   showToast(text);
 }

 function addCopyButtons(){
   document.querySelectorAll('.address').forEach(function(addressBlock){
     const value=addressBlock.querySelector('.value');
     if(!value||addressBlock.querySelector('.copyAddr')){return;}
     const btn=document.createElement('button');
     btn.type='button';
     btn.className='copyAddr';
     btn.textContent='Copiar direccion';
     btn.addEventListener('click',function(){
       const text=value.textContent.trim();
       if(navigator.clipboard&&navigator.clipboard.writeText){
         navigator.clipboard.writeText(text).then(function(){
           showToast('Direccion copiada');
         }).catch(function(){
           showToast('No se pudo copiar automaticamente');
         });
         return;
       }
       showToast('Copia manual: '+text);
     });
     addressBlock.appendChild(btn);
   });
 }

 function setupCollapsers(){
   days.forEach(function(day){
     const head=day.querySelector('.dayhead');
     if(!head||head.querySelector('.collapseToggle')){return;}
     const btn=document.createElement('button');
     btn.type='button';
     btn.className='collapseToggle';
     btn.textContent='Compactar';
     btn.addEventListener('click',function(){
       const collapsed=day.classList.toggle('collapsed');
       btn.textContent=collapsed?'Expandir':'Compactar';
       const empty=day.querySelector('.emptyday');
       if(empty){
         const filtering = !!searchTerm || activeFilter!=='all';
         empty.hidden=collapsed || !filtering || !!day.querySelector('.stop:not(.hidden)');
       }
     });
     head.appendChild(btn);
   });
 }

 function setupDayFood(){
   const panel=document.getElementById('day1FoodPanel');
   const toggle=document.getElementById('day1FoodToggle');
   if(!panel||!toggle){return;}
   toggle.addEventListener('click',function(){
     const open=panel.classList.toggle('open');
     toggle.setAttribute('aria-expanded',open?'true':'false');
   });
   const buttons=[...panel.querySelectorAll('[data-food-category]')].filter(function(b){return b.classList.contains('foodCategoryBtn');});
   const options=[...panel.querySelectorAll('.foodOption')];
   buttons.forEach(function(btn){
     btn.addEventListener('click',function(){
       const cat=btn.dataset.foodCategory;
       buttons.forEach(function(b){b.classList.toggle('active',b===btn);});
       options.forEach(function(card){
         card.hidden=!(cat==='all'||card.dataset.foodCategory===cat);
       });
     });
   });
   const first=buttons.find(function(b){return b.classList.contains('active');});
   if(first){first.click();}
 }

 function setupPacklist(){
   document.querySelectorAll('[data-pack]').forEach(function(box){
     const key=box.getAttribute('data-pack');
     box.checked=!!packState[key];
     box.addEventListener('change',function(){
       packState[key]=box.checked;
       savePack();
     });
   });
 }

 function setupTopButton(){
   if(!topBtn){return;}
   function toggle(){
     topBtn.classList.toggle('show',window.scrollY>420);
   }
   window.addEventListener('scroll',toggle,{passive:true});
   topBtn.addEventListener('click',function(){
     window.scrollTo({top:0,behavior:'smooth'});
   });
   toggle();
 }

 boxes.forEach(function(box){
   box.addEventListener('change',function(){
     state[box.closest('.stop').dataset.key]=box.checked;
     saveState();
   });
 });

 document.querySelectorAll('.dayDone').forEach(function(btn){
   btn.addEventListener('click',function(){markDayDone(btn.dataset.day);});
 });

 if(searchInput){
   searchInput.addEventListener('input',function(){
     searchTerm=searchInput.value.trim().toLowerCase();
     applyVisibility();
   });
 }

 filters.forEach(function(btn){
   btn.addEventListener('click',function(){
     activeFilter=btn.dataset.filter;
     filters.forEach(function(item){item.classList.toggle('active',item===btn);});
     applyVisibility();
   });
 });

 const nextPendingBtn=document.getElementById('nextPendingBtn');
 if(nextPendingBtn){nextPendingBtn.addEventListener('click',jumpToNextPending);}

 const shareBtn=document.getElementById('shareBtn');
 if(shareBtn){shareBtn.addEventListener('click',sharePlan);}

 const resetBtn=document.getElementById('resetBtn');
 if(resetBtn){resetBtn.addEventListener('click',resetAll);}

 function setupCurrency(){
   const rate=document.getElementById('fxRate'), usd=document.getElementById('usdAmount'), out=document.getElementById('fxResult');
   if(!rate||!usd||!out){return;}
   const savedRate=localStorage.getItem('chicago_fx_rate');
   const savedUsd=localStorage.getItem('chicago_fx_usd');
   if(savedRate!==null) rate.value=savedRate;
   if(savedUsd!==null) usd.value=savedUsd;
   function fmt(n){return new Intl.NumberFormat('es-CR',{maximumFractionDigits:0}).format(n);}
   function calc(){
     const r=parseFloat(String(rate.value).replace(',','.'))||0;
     const u=parseFloat(String(usd.value).replace(',','.'))||0;
     localStorage.setItem('chicago_fx_rate', rate.value);
     localStorage.setItem('chicago_fx_usd', usd.value);
     out.innerHTML='$'+fmt(u)+' USD = ₡'+fmt(u*r)+' <small>aprox.</small>';
   }
   rate.addEventListener('input',calc); usd.addEventListener('input',calc); calc();
 }

 addCopyButtons();
 setupCurrency();
 setupCollapsers();
 setupDayFood();
 setupPacklist();
 setupTopButton();
 updateCountdown();
 setInterval(updateCountdown,60000);
 render();
})();
