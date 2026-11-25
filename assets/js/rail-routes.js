window.tripRailRoutes=(()=>{
  const cta='https://www.transitchicago.com/';
  const hotel='HI Chicago Hostel, 24 E Ida B Wells Dr, Chicago, IL';
  const arena='United Center, Chicago, IL';
  const zoo='41.921850,-87.635539';
  const pier='Navy Pier, 600 E Grand Ave, Chicago, IL';
  const square='Chinatown Square, 2133 S China Pl, Chicago, IL';
  const sky='Skydeck entrance, Jackson Blvd, Chicago, IL';
  const station=(name,address,slug)=>({name,address,url:`${cta}station/${slug}/`});
  const harrison=station('Harrison','608 S State St, Chicago','harr');
  const jackson=station('Jackson · Red Line','230 S State St, Chicago','jacr');
  const roosevelt=station('Roosevelt','1167 S State St, Chicago','roos');
  const adams=station('Adams/Wabash','201 S Wabash Ave, Chicago','adam');
  const damen=station('Damen · Green Line','154 N Damen Ave, Chicago','dmgr');
  const fullerton=station('Fullerton','943 W Fullerton Ave, Chicago','full');
  const grand=station('Grand · Red Line','521 N State St, Chicago','grre');
  const chicago=station('Chicago · Red Line','800 N State St, Chicago','chir');
  const cermak=station('Cermak–Chinatown','138 W Cermak Rd, Chicago','chna');
  const walk=(origin,destination)=>'https://www.google.com/maps/dir/?'+new URLSearchParams({api:'1',origin,destination,travelmode:'walking'});
  const leg=(line,from,start,heading,end,to,finish,access)=>({
    line,points:[
      ['Camina a la estación',`${start.name} · ${start.address}${access?' · '+access:''}`],
      [`${line} hacia ${heading}`,`Baja en ${end.name}.`],
      ['Al salir',finish]
    ],links:[['Caminar a la estación',walk(from,start.address)],[`Ver estación ${start.name}`,start.url],[`Ver estación ${end.name}`,end.url],['Caminar desde la bajada',walk(end.address,to)]]
  });
  const chinaPier=leg('Red Line',square,cermak,'Howard',grand,pier,'Toma Grand Avenue hacia el este hasta el letrero de Navy Pier. Calcula unos 20–25 min a pie; no hay estación en el muelle.','desde Archer busca el acceso CTA, no la estación de Green Line en Cermak');
  const pierHotel=leg('Red Line',pier,grand,'95th/Dan Ryan',jackson,hotel,'Sal por Jackson hacia State Street y camina al sur hasta Ida B. Wells.');
  const zooHotel=leg('Red Line',zoo,fullerton,'95th/Dan Ryan',jackson,hotel,'Sal por Jackson hacia State Street y continúa al sur hasta Ida B. Wells. Del zoo a Fullerton hay alrededor de una milla a pie.','entrada principal en el lado sur de Fullerton');
  return {
    transitShedd:{trigger:'transit-shedd-arrival',label:'Red Line + caminata larga',first:false,note:'El 146 te deja junto al acuario. Si prefieres el tren, Roosevelt queda a unos 20 min a pie del Shedd; con hielo o poco margen usa el bus.',legs:[leg('Red Line',hotel,harrison,'95th/Dan Ryan',roosevelt,'Shedd Aquarium, Chicago, IL','Sigue Roosevelt hacia el este y el sendero peatonal señalizado hacia Museum Campus. Usa el plano del campus para reconocer el acceso. ')],links:[['Plano del Museum Campus','https://www.fieldmuseum.org/landing/maps-and-guides']]},
    bulls:{trigger:'transit-shedd-united',label:'146 al hotel + Green Line al partido',first:true,note:'Desde el acuario haz primero el tramo 146 hasta HI Chicago. Después de cambiarte, usa el tren; el 20 queda como alternativa desde el hotel. Adams/Wabash no tiene ascensor; si lo necesitas, consulta Washington/Wabash y sus alertas.',legs:[leg('Green Line',hotel,adams,'Harlem/Lake',damen,arena,'Sal a Damen/Lake y camina por Damen hacia el sur hasta Madison. Busca la puerta indicada en tu boleto.')],links:[['Washington/Wabash y ascensores','https://www.transitchicago.com/travel-information/station/washingtonwabash/']]},
    bullsReturn:{trigger:'transit-uc-hotel',label:'Green Line · Damen → Adams/Wabash',first:true,note:'Revisa el último Green Line antes de salir de la arena. Si no hay servicio o prefieres caminar menos al final del partido, usa el 19 Express o el 126 según disponibilidad.',legs:[leg('Green Line',arena,damen,'Cottage Grove o Ashland/63rd',adams,hotel,'Ambos destinos pasan por Adams/Wabash. Desde ahí camina al sur hacia HI Chicago.','entrada en la esquina suroeste de Damen & Lake')]},
    zoo:{trigger:'transit-zoo-arrival',label:'Red Line + caminata al zoo',first:false,note:'Desde Fullerton hay alrededor de una milla a pie. El 22 es más directo si hace frío o hay hielo.',legs:[leg('Red Line',hotel,jackson,'Howard',fullerton,zoo,'Camina hacia el este y usa el pin de West Gate para el tramo final.')]},
    pier:{trigger:'transit-d4-to-navy',label:'Red Line · Cermak–Chinatown → Grand',first:true,note:'Sal de Chinatown con margen para la caminata y los fuegos de las 8:00 p. m. El 29 sigue disponible si el clima no ayuda.',legs:[chinaPier]},
    pierReturn:{trigger:'transit-d4-return',label:'Red Line · Grand → Jackson',first:true,note:'Después de los fuegos, Grand exige caminar por Grand Ave hasta State. Si hace mucho frío, el 29 sale del propio muelle.',legs:[pierHotel]},
    pierReturnFriday:{trigger:'transit-navy-hotel',label:'Red Line · Grand → Jackson',first:true,note:'Grand queda a unos 20–25 min a pie desde el acceso del muelle. Si el clima no ayuda, el 29 sale de la terminal de Navy Pier.',legs:[pierHotel]},
    mile:{trigger:'transit-d5-arrival',label:'Red Line · Jackson → Grand',first:true,note:'Desde la estación Grand camina a Michigan Ave; el 147 sigue como opción para bajar directamente en Michigan & Ontario.',legs:[leg('Red Line',hotel,jackson,'Howard',grand,'625 N Michigan Ave, Chicago, IL','Camina al este por Grand hasta Michigan Ave y gira al norte hacia Ontario.','busca Red Line en State, no Blue Line en Dearborn')]},
    zooLights:{trigger:'transit-d5-zoolights',label:'Red Line + caminata a West Gate',first:false,note:'Para ZooLights el 151 deja más cerca de West Gate; usa el tren si la caminata de alrededor de una milla desde Fullerton te resulta cómoda.',legs:[leg('Red Line','676 N Michigan Ave, Chicago, IL',chicago,'Howard',fullerton,zoo,'Desde Fullerton camina al este y termina en Stockton & Webster. Usa el pin de West Gate, no la dirección administrativa.')]},
    zooLightsReturn:{trigger:'transit-d5-return',label:'Red Line · Fullerton → Jackson',first:false,note:'Desde West Gate hay alrededor de una milla a pie a Fullerton. En una noche fría, el 151 desde el #1082 sigue siendo más directo.',legs:[zooHotel]},
    zooSky:{trigger:'transit-zoo-sky',label:'Red Line + caminata a Skydeck',first:false,note:'Úsalo si sales con margen. Si ya se acerca tu entrada a las 4:00 p. m., compara primero con el 156 o 151: el tren suma una caminata desde el parque y otra desde Jackson.',legs:[leg('Red Line','Nature Boardwalk at Lincoln Park Zoo, Chicago, IL',fullerton,'95th/Dan Ryan',jackson,sky,'Camina al oeste por Jackson Blvd hasta Skydeck. Usa el acceso de visitantes, no el lobby de oficinas.')]},
    chinaOutbound:{label:'Red Line · Lake → Cermak–Chinatown',first:true,note:'El Water Taxi queda como paseo opcional. Si no está operando o quieres ir directo, elige el tren.',legs:[leg('Red Line','Wrigley Building, Chicago, IL',station('Lake · Red Line','188 N State St, Chicago','lake'),'95th/Dan Ryan',cermak,square,'Sal hacia Archer o Cermak y camina al norte hacia Chinatown Square. El elevado State/Lake está cerrado; usa el acceso del metro señalizado Lake / Red Line.')]},
  };
})();
