/* day2-modal-map-buttons */
(function(){
  function openMap(origin,destination,mode,waypoint){
    let u='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination)+'&travelmode='+mode;
    if(waypoint) u+='&waypoints='+encodeURIComponent(waypoint);
    const w=window.open(u,'chicagoMapsWindow');
    if(!w) window.location.assign(u); else { try{w.focus()}catch(e){} }
  }

  function handleMapElement(b){
    if(!b)return;
    const sa=b.dataset.saMap;
    const su=b.dataset.suMap;

    if(sa){
      if(sa==='stop') return openMap('24 E Ida B Wells Dr, Chicago, IL','State & Harrison, Chicago, IL','walking');
      if(sa==='shedd') return openMap('Solidarity Drive & Aquarium, Chicago, IL','Shedd Aquarium, Chicago, IL','walking');
      if(sa==='full') return openMap('24 E Ida B Wells Dr, Chicago, IL','Shedd Aquarium, Chicago, IL','transit');
    }

    if(su){
      if(su==='shedd-hotel') return openMap('Shedd Aquarium, Chicago, IL','HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL','transit');
      if(su==='hotel-united') return openMap('HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL','United Center, 1901 W Madison St, Chicago, IL','transit','Madison & Dearborn/State, Chicago, IL');
      if(su==='full') return openMap('Shedd Aquarium, Chicago, IL','United Center, 1901 W Madison St, Chicago, IL','transit', 'HI Chicago, 24 E Ida B. Wells Drive, Chicago, IL');
    }
  }

  document.addEventListener('click',function(e){
    const b=e.target.closest('[data-sa-map],[data-su-map]');
    if(!b)return;
    e.preventDefault();
    handleMapElement(b);
  }, true);

  document.addEventListener('keydown',function(e){
    if((e.key==='Enter'||e.key===' ') && e.target.closest('[data-su-map],[data-sa-map]')){
      e.preventDefault();
      handleMapElement(e.target.closest('[data-su-map],[data-sa-map]'));
    }
  }, true);
})();
