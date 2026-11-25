/* day4-day5-custom-transfer-script */
(function(){
const defs={
 d4hr:{modal:'d4HotelRiverModal',close:'d4hrClose',origin:'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605',dest:'State St & E Wacker Dr, Chicago, IL'},
 d4nav:{modal:'d4NavyModal',close:'d4navClose',origin:'Chinatown Square, Chicago, IL',stop:'State & Cermak (northbound), Chicago, IL',end:'Navy Pier Terminal, Chicago, IL',dest:'Navy Pier, 600 E Grand Ave, Chicago, IL 60611'},
 d4ret:{modal:'d4ReturnModal',close:'d4retClose',origin:'Navy Pier, 600 E Grand Ave, Chicago, IL 60611',stop:'Navy Pier Terminal, Chicago, IL',end:'State & Van Buren (southbound), Chicago, IL',dest:'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605'},
 d5arr:{modal:'d5ArrivalModal',close:'d5arrClose',origin:'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605',stop:'Congress Plaza & Michigan Ave, Chicago, IL',end:'Michigan & Ontario, Chicago, IL',dest:'625 N Michigan Ave, Chicago, IL 60611'},
 d5ret:{modal:'d5ReturnModal',close:'d5retClose',origin:'41.921850,-87.635539',stop:'Stockton & Webster, Chicago, IL',end:'Adams & Wabash, Chicago, IL',dest:'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605'},
 d5zl:{modal:'d5ZooLightsModal',close:'d5zlClose',origin:'Magnificent Mile, Chicago, IL',stop:'Michigan & Huron, Chicago, IL',end:'Stockton & Webster, Chicago, IL',dest:'41.921850,-87.635539'},
 d1oh:{modal:'d1OhareModal',close:'d1ohClose',origin:'Chicago O’Hare International Airport, IL',stop:'O’Hare Blue Line Station, Chicago, IL',end:'Jackson-Blue Station, Chicago, IL',dest:'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605'},
 d6oh:{modal:'d6OhareModal',close:'d6ohClose',origin:'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL 60605',stop:'Jackson-Blue Station, Chicago, IL',end:'O’Hare Blue Line Station, Chicago, IL',dest:'Chicago O’Hare International Airport, IL'}
};
function enc(x){return encodeURIComponent(x)}
function maps(origin,dest,mode){const u='https://www.google.com/maps/dir/?api=1&origin='+enc(origin)+'&destination='+enc(dest)+'&travelmode='+mode;const w=window.open(u,'chicagoMapsWindow');if(!w)window.location.assign(u);else{try{w.focus()}catch(e){}}}
function setup(key,source){const d=defs[key],m=document.getElementById(d.modal);if(!m)return;const close=()=>{m.classList.add('hidden');m.setAttribute('aria-hidden','true')};document.getElementById(d.close)?.addEventListener('click',close);m.addEventListener('click',e=>{if(e.target===m)close()});
 document.addEventListener('click',e=>{if(e.target.closest('.transit-'+source)){e.preventDefault();e.stopImmediatePropagation();m.classList.remove('hidden');m.setAttribute('aria-hidden','false');return;}const b=e.target.closest('[data-'+key+'-map]');if(!b)return;const which=b.dataset[key+'Map'];if(which==='stop')maps(d.origin,d.stop,'walking');else if(which==='river'||which==='zoo'||which==='hotel'||which==='pier')maps(d.end,d.dest,'walking');else maps(d.origin,d.dest,which==='full'?'transit':'walking');},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.getAttribute('aria-hidden')==='false'){e.preventDefault();close()}});
}
setup('d4hr','d4-hotel-river');setup('d4nav','d4-to-navy');setup('d4ret','d4-return');setup('d5arr','d5-arrival');setup('d5ret','d5-return');setup('d5zl','d5-zoolights');setup('d1oh','d1-ohare');setup('d6oh','d6-ohare');
})();
