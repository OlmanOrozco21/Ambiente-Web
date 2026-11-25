# Chicago en diciembre

Guía estática de viaje para Chicago y Wisconsin, del 2 al 11 de diciembre de 2026. No requiere npm, un backend ni un paso de compilación.

## Vista previa local

Desde PowerShell, en la carpeta del proyecto:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abre [http://127.0.0.1:8000](http://127.0.0.1:8000). Para detener el servidor, usa `Ctrl+C`.

## Dónde editar

| Si quieres cambiar… | Empieza aquí |
| --- | --- |
| Actividades, horas y direcciones | [`index.html`](./index.html), secciones `day1` a `day10` |
| Colores, tarjetas y diseño móvil | [`assets/css/mobile.css`](./assets/css/mobile.css) |
| Vista por día y presentación de paradas | [`assets/js/itinerary.js`](./assets/js/itinerary.js) |
| Progreso y preferencias de mapas | [`assets/js/progress.js`](./assets/js/progress.js) y [`assets/js/maps.js`](./assets/js/maps.js) |
| Listado de traslados y categorías de comida | [`assets/js/transport.js`](./assets/js/transport.js) y [`assets/js/food.js`](./assets/js/food.js) |
| Recomendaciones cercanas y fuentes para contrastar direcciones | [`assets/js/food-picks.js`](./assets/js/food-picks.js) |
| Diseño de los paneles de comida y transporte | [`assets/css/guide-panels.css`](./assets/css/guide-panels.css) |

El HTML sigue siendo la fuente de los datos del viaje. Los scripts clásicos se cargan en orden: mantienen la compatibilidad con los paneles y rutas originales. No cambies su orden ni añadas `async` sin revisar sus dependencias.

La portada usa una [ilustración SVG local](./assets/img/chicago-winter.svg). La vista del día destaca la primera parada pendiente en el orden del itinerario, no una recomendación en tiempo real.

Los pasos de transporte se nutren de los bloques `.zs-route` de [index.html](./index.html). La vista de detalle muestra primero el recorrido; las alternativas y las notas se abren por separado. Si el plan original señala una salida recomendada, añade `data-recommended` a esa fila `.zs-time` para seleccionarla al abrir el detalle. Las horas siguen siendo referencias, no información de servicio en vivo.

Las **42 paradas** tienen **Guía de la parada** y **Fotos y esquemas**, cerradas por defecto. El botón de cámara abre directamente un esquema de orientación específico (sin escala), las fotos reales acreditadas que estén disponibles y, cuando aplica, un enlace a un plano o galería oficial. **Qué hacer y dónde comer** y **Notas y enlaces** se abren por separado y solo aparecen cuando tienen contenido.

Los datos ampliados se vinculan por `data-key` en [`arrival-guides.js`](./assets/js/arrival-guides.js) y los renderiza [`itinerary.js`](./assets/js/itinerary.js). Los esquemas no están a escala, los accesos pueden cambiar y los enlaces externos necesitan conexión. En el United Center, la nota opcional de fila y asientos se guarda solo en el navegador que la escribe y se borra guardándola vacía; no reemplaza el boleto móvil.

Las guías con **Qué hacer** y **Dónde comer** separan las prioridades de visita de las opciones de comida. Cuando hay un acceso concreto, arriba aparece su pin o plano. Los horarios de concesiones y las salidas de CTA no se actualizan automáticamente; los regresos de ZooLights, Navy Pier y United Center enlazan al rastreador oficial.

En **Traslados del día → Cómo reconocer las paradas del bus**, CTA Bus Tracker abre el poste indicado. **Pin de CTA** usa las coordenadas de [`cta-stop-pins.js`](./assets/js/cta-stop-pins.js), extraídas del [GTFS oficial](https://www.transitchicago.com/developers/gtfs/). **Vista de calle cercana** abre Street View en esas coordenadas; no es una foto certificada del poste. Si no hay pin en el archivo se mantiene **Ver cruce**. Las estaciones de tren enlazan a la página oficial de CTA; las fotos locales incluyen la fuente y la licencia.

Para el sábado, el acceso recomendado al Riverwalk es a pie desde HI Chicago, por la rampa al este de State Street en Upper Wacker. La ruta CTA 26 no circula los sábados. El muelle del Water Taxi está en la orilla norte, al oeste del puente DuSable; sus enlaces usan el pin del operador.

En Chicago se prioriza el tren donde resulte práctico. Las opciones están en [`rail-routes.js`](./assets/js/rail-routes.js) y separan estación, sentido y caminata. El sábado 5, la Red Line lleva de Cermak–Chinatown a Grand para los [fuegos de las 8:00 pm en Navy Pier](https://navypier.org/pier-events/winter-fireworks/); hay que caminar al este por Grand. El [bus 29](https://www.transitchicago.com/bus/29/) queda como alternativa para ida y regreso si hace frío. La salida de Chinatown a las 6:15 pm y la llegada al muelle a las 7:30 pm son objetivos.

Desde el Riverwalk, el tren sale de Lake Red Line hacia Cermak–Chinatown; el Water Taxi queda como paseo opcional si el operador confirma servicio. El lunes 7 se mantiene la recogida en O’Hare y el traslado en carro a Janesville. El martes 8 queda para el esquí nocturno en Crystal Ridge y el viernes 11 para el regreso, sin visitas. Guarda en el teléfono las reservas y capturas de los pasos de transporte que necesites; los mapas y horarios en vivo requieren conexión.

En pantallas pequeñas, el selector de etapa muestra solo los días de Chicago o los de Wisconsin y regreso, y recuerda el último día seleccionado de cada etapa mientras la página está abierta. Las transiciones respetan la preferencia de movimiento reducido; el indicador de carga de comida aparece durante el cálculo de distancia, sin bloquear la navegación.

Las tarjetas, las guías y los paneles de Comida y Transporte comparten los colores, radios y tipografía definidos en [`mobile.css`](./assets/css/mobile.css). Chicago usa acentos azules y Wisconsin, verdes; el cambio de etapa no cambia la estructura de los controles.

En móvil, las acciones de trayecto, mapa, fotos y completar usan controles compactos de al menos 44 px con nombre accesible; los enlaces a horarios y entradas conservan su texto. El cambio de día anima el encabezado y las tarjetas, y completar una parada anima su marcador.

## GitHub Pages

Sube el proyecto completo (`index.html`, `assets` y `.nojekyll`) al repositorio. En **Settings → Pages**, selecciona **Deploy from a branch** y la rama y carpeta donde guardaste esos archivos. Si Pages ya publica esa carpeta, basta con subir la nueva estructura. Las rutas relativas permiten servir el sitio bajo el nombre del repositorio.

Una vez publicado, abre la URL de Pages desde el teléfono y prueba una galería, Comida y Transporte. El progreso y la nota de asientos de la vista previa local no se transfieren al sitio publicado. Si el sitio es público, cualquiera con el enlace puede consultar el itinerario, las fechas y el hospedaje que figuran en la guía. Mapas, imágenes externas y cálculos de distancia necesitan conexión.

En **Comida → Cerca de tu ruta**, cada recomendación indica la parada cercana y enlaza a su fuente. Las opciones heredadas sin fuente se marcan como no verificadas. Los locales dentro de recintos pueden compartir dirección: consulta la nota de acceso y confirma los horarios antes de salir.

En Comida, **Desde esta parada** permite elegir entre puntos concretos del día activo, como Chinatown Square o Navy Pier. **Mapa a pie** abre indicaciones peatonales desde el origen elegido. Desde una parada o **HI Chicago**, **Calcular a pie** muestra kilómetros y minutos de un recorrido peatonal, si está disponible; no se utiliza distancia en línea recta. Con **Mi ubicación**, el cálculo se consulta en Google Maps y la guía no recoge tu ubicación.
