window.tripTransitReferences=(()=>{
  const stop=(name,id,side,query)=>({name,id,side,query:query||name});
  const leg=(route,direction,destination,board,exit,tip)=>({route,direction,destination,board,exit,tip});
  const photo=(file,width,height,alt,caption,credit,source,license,licenseUrl,edited=true)=>({file,width,height,alt,caption,credit,source,license,licenseUrl,edited});
  const franklin=photo('washington-franklin.jpg',960,540,'Parada Washington y Franklin del Loop Link con marquesina','Washington & Franklin en 2021: busca la marquesina del Loop Link en Washington. La foto es orientativa; confirma el poste #445.','AlphaBeta135','Washington-Franklin_bus_stop_(October_2021).jpg','CC BY 4.0','https://creativecommons.org/licenses/by/4.0/');
  const zooReturn=stop('Stockton & Webster',1082,'Esquina noroeste · lado opuesto al zoo');
  const armitage=stop('Stockton & Armitage',1084,'Lado oeste de Stockton');
  const skydeck=stop('Adams & S. Wacker',1108,'Esquina noreste');
  const navy=stop('Navy Pier Terminal',758,'Terminal de buses, no el muelle de barcos');
  const south29=leg(29,'Southbound','95th/Dan Ryan',navy,stop('State & Van Buren',1430,'Esquina noroeste'), 'En la terminal busca el 29 hacia el sur, no un 124 ni un bus que esté fuera de servicio.');
  const sheddDiagram={file:'shedd-bus-sides.svg',alt:'Solidarity Drive: la parada de ida #4591 queda al sur; el poste de regreso #4595 queda al norte.',caption:'Paradas del acuario: ida al sur de Solidarity Drive y regreso al norte. Esquema sin escala.'};
  const zooDiagram={file:'zoolights-gate.svg',alt:'Stockton & Webster: baja en #1143 del lado del zoo; para regresar, usa #1082 en la esquina noroeste.',caption:'Ida y regreso en Stockton con Webster · esquema sin escala.'};
  return {
    sheddArrivalModal:{
      trigger:'transit-shedd-arrival',
      legs:[leg(146,'Southbound','Museum Campus',
        stop('State & Harrison/Ida B Wells Drive',1431,'Lado oeste de State Street','State St & Harrison St'),
        stop('Solidarity Drive & Aquarium',4591,'Lado sur de Solidarity Drive','Solidarity Drive & Aquarium'),
        'Para ir al acuario es el 146 hacia el sur. No subas al que va hacia Berwyn; ese corresponde al regreso.')],diagram:sheddDiagram
    },
    sheddUnitedModal:{
      trigger:'transit-shedd-united',
      legs:[leg(146,'Northbound','Berwyn (Red Line)',
        stop('Solidarity Drive & Aquarium',4595,'Lado norte de Solidarity Drive'),
        stop('State & Harrison/Ida B Wells Drive',15052,'Lado este de State Street','State St & Harrison St'),
        'Esta es la parada del lado contrario al que usaste al llegar al acuario. El regreso primero pasa por el hotel.'),
      leg(20,'Westbound','Austin o Pulaski',
        stop('Madison & Dearborn/State',18126,'Lado norte de Madison, entre Dearborn y State','Madison & Dearborn'),
        stop('Madison & United Center (1900 W)',468,'Lado norte de Madison','Madison & United Center'),
        'Ambos destinos pasan por el United Center. La arena queda al otro lado de Madison; cruza por un paso peatonal.')],diagram:sheddDiagram
    },
    ucHotelModal:{
      trigger:'transit-uc-hotel',
      legs:[leg(126,'Eastbound','Congress Plaza',stop('Jackson & Damen',42,'Esquina suroeste'),stop('Michigan & Van Buren/Ida B. Wells',73,'Lado oeste de Michigan Ave','Michigan Ave & Van Buren St'),'Consulta el 126 antes de caminar hasta Jackson.'),
        leg(19,'Eastbound','United Center Express · después del partido',stop('Madison & United Center',17537,'Lado sur de Madison'),stop('Washington & State',448,'Esquina sureste'),'Si prefieres el 19, pregunta al personal antes de alejarte de la arena. Solo opera después del evento; no tiene una hora fija de salida.')]
    },
    zooArrivalModal:{
      trigger:'transit-zoo-arrival',
      legs:[leg(22,'Northbound','Howard',stop('Dearborn & Ida B Wells Drive',1877,'Esquina noreste'),stop('Clark & Armitage',1907,'Lado este de Clark Street'),'Después de bajar, usa el cruce peatonal y sigue la guía de Lincoln Park Zoo hacia Stockton y West Gate.')]
    },
    zooSkyModal:{
      trigger:'transit-zoo-sky',
      legs:[156,151].map(route=>({
        ...leg(route,'Southbound','Union Station',armitage,skydeck,'Armitage y Webster son alternativas para el mismo bus, no un transbordo. Desde Adams & S. Wacker camina hacia la entrada Skydeck en Jackson Blvd.'),
        alternate:zooReturn
      }))
    },
    skyNavyModal:{
      trigger:'transit-sky-navy',
      legs:[leg(124,'Eastbound','Navy Pier',stop('Washington & Franklin',445,'Esquina suroeste · marquesina del Loop Link'),
        stop('Navy Pier Terminal',14161,'Terminal de buses'),'Busca la marquesina de Washington, no el poste del lado opuesto. El letrero del bus debe decir Navy Pier.')],photo:franklin
    },
    navyHotelModal:{trigger:'transit-navy-hotel',legs:[south29]},
    d4NavyModal:{
      trigger:'transit-d4-to-navy',
      legs:[leg(29,'Northbound','Navy Pier',stop('State & Cermak',2343,'Esquina sureste'),navy,'No es la entrada elevada de la Red Line. Espera en el poste #2343 y confirma que el bus diga Navy Pier.')]
    },
    d4ReturnModal:{trigger:'transit-d4-return',legs:[south29]},
    d5ArrivalModal:{
      trigger:'transit-d5-arrival',
      legs:[leg(147,'Northbound','Howard Station',stop('Congress Plaza & Michigan',74,'Esquina sureste','Congress Plaza & Michigan Ave'),
        stop('Michigan & Ontario',1124,'Esquina sureste'),'La parada hacia Howard está en Congress Plaza & Michigan; no esperes en Wabash.')]
    },
    d5ZooLightsModal:{
      trigger:'transit-d5-zoolights',
      legs:[leg(151,'Northbound','Devon/Clark',stop('Michigan & Huron',1125,'Esquina sureste'),
        stop('Stockton & Webster',1143,'Lado este de Stockton · lado del zoo'),'Desde la bajada sigue la señal West Gate. Para volver, no te quedes en el poste de la ida.')],diagram:zooDiagram
    },
    d5ReturnModal:{
      trigger:'transit-d5-return',
      legs:[leg(151,'Southbound','Union Station',zooReturn,stop('Adams & Wabash',77,'Esquina noreste'),'Sal por West Gate y cruza con cuidado a la esquina noroeste. No esperes donde bajaste al llegar.')],diagram:zooDiagram
    }
  };
})();
