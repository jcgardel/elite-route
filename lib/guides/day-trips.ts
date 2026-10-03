/**
 * GUÍA 2: excursiones de un día desde la Ciudad de México.
 *
 * DE DÓNDE SALEN LOS TIEMPOS. De `lib/distances.ts`, que es la misma fuente
 * que calcula los precios de las páginas de ruta. No se escriben a mano aquí:
 * si un día se corrige la distancia de Valle de Bravo, esta guía y la tarifa
 * se mueven juntas. Lo que sí se escribe es el veredicto de cada destino, que
 * es un juicio y no un dato.
 *
 * LA PARTE INCÓMODA, Y QUÉ SE HACE CON ELLA. San Miguel de Allende son casi
 * ocho horas de carretera ida y vuelta. Ese número se publica entero: un
 * viajero que hace ese viaje sin saberlo vuelve agotado y deja una reseña que
 * cuesta mucho más que la venta.
 *
 * Lo que cambió el 3 de octubre de 2026 es el veredicto, no el dato. La
 * primera versión decía "no lo hagas en un día"; ahora dice cuánto cuesta en
 * horas, a qué hora hay que salir para que funcione, y que con una noche se
 * aprovecha más. El lector tiene la misma información para decidir y la
 * página deja de recomendar en contra de lo que vende. Ver la nota sobre
 * dónde está la línea en ./types.ts.
 *
 * Teotihuacán va aparte porque se reserva distinto: con unos 100 km redondos
 * cabe en el servicio por horas, y por eso tiene su propia página con tabla de
 * precios. Los cinco destinos foráneos se reservan como viaje redondo. Ver
 * `admiteRedondo` en lib/service-limits.ts para la regla exacta.
 *
 * XOCHIMILCO Y LA BASÍLICA, añadidos el 3 de octubre de 2026 a petición del
 * dueño, NO son excursiones foráneas: están dentro de la Ciudad de México. Por
 * eso no entran en la tabla de arriba —que compara horas de carretera para
 * salir de la ciudad— sino en una sección propia, y por eso se reservan por
 * horas y no como viaje redondo: la regla de zona del servicio por horas es
 * CDMX más los aeropuertos de AIFA y Toluca, y los dos caen de lleno dentro.
 *
 * Meterlos en la tabla de foráneas habría sido más fácil y habría mentido: un
 * lector que ve "Xochimilco" junto a "San Miguel de Allende" entiende que hay
 * que salir de la ciudad para llegar, y entonces la guía deja de servir para
 * lo único que sirve, que es decirle cuánto del día se le va en el camino.
 */
import "server-only";

import { LEGS } from "../distances";
import type { Guia } from "./types";

/** Minutos a "2 h 40". La "h" sirve en los dos idiomas: es la unidad. */
function horas(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

/**
 * Una fila de la tabla con los tiempos SACADOS DE `LEGS`, no escritos a mano.
 * Es la misma fuente que calcula los precios de las páginas de ruta, así que
 * una corrección de distancia mueve la tarifa y esta guía a la vez. Lo único
 * escrito aquí es el veredicto, que es un juicio y no un dato.
 *
 * Teotihuacán no está en `LEGS` —no es una ruta con tarifa propia, se vende
 * como día por horas— así que su fila va aparte y aproximada.
 */
function fila(key: keyof typeof LEGS, destino: string, veredicto: string) {
  const min = LEGS[key].min;
  return [destino, horas(min), horas(min * 2), veredicto];
}

export const GUIA_EXCURSIONES: Guia = {
  page: "guideDayTrips",
  contenido: {
    en: {
      kicker: "Travel guide",
      title: "Day Trips from Mexico City with a Driver",
      h1: "Day trips from Mexico City with a private driver",
      description:
        "Nine places within reach of Mexico City — Teotihuacán, Xochimilco, the Basilica of Guadalupe, Tepoztlán, Puebla, Cuernavaca and more — with real drive times, how long each one needs and what time to leave.",
      intro:
        "Mexico City is also an unusually good base for the centre of the country. Just over an hour away stand the pyramids of Teotihuacán; a few hours further out, colonial cities, mountain lakes, Pueblos Mágicos and some of the best tables in Mexico. Some of these work comfortably in half a day. Others deserve an early start and a return after dinner. This guide compares the best day trips from Mexico City, how much time each one really takes, and which ones work best when you travel with a private driver.",
      revisado: "Last checked: October 2026",
      indiceTitulo: "On this page",
      datos: [
        { valor: "9", etiqueta: "destinations compared" },
        { valor: "1–4 h", etiqueta: "drive out, each way" },
        { valor: "3", etiqueta: "ways to book it" },
      ],
      secciones: [
        {
          id: "the-table",
          h2: "The best day trips from Mexico City: time and distance",
          bloques: [
            {
              tipo: "p",
              texto:
                "On a map, most of these destinations look close. In practice, the traffic getting out of Mexico City can reshape the whole day.",
            },
            {
              tipo: "p",
              texto:
                "Teotihuacán allows an unhurried half-day. Puebla deserves a full one. And reaching San Miguel de Allende means accepting that a good part of the experience will happen on the road.",
            },
            {
              tipo: "tabla",
              encabezados: ["Destination", "Drive each way", "On the road, round trip", "Recommendation"],
              filas: [
                ["Teotihuacán", "About 1 h", "About 2 h", "Ideal for half a day or a full day"],
                fila("tepoztlan", "Tepoztlán", "A comfortable half-day escape"),
                fila("cuernavaca", "Cuernavaca", "A comfortable day out"),
                fila("puebla", "Puebla", "Better as a full day"),
                fila("vallebravo", "Valle de Bravo", "A full day, with an early start"),
                fila("queretaro", "Querétaro", "Possible in a day; better with time"),
                fila("sanmiguel", "San Miguel de Allende", "A long day; leave very early"),
              ],
            },
            {
              tipo: "nota",
              texto:
                "These are approximate times in normal conditions. To get the most out of the day, particularly midweek, it is worth leaving early. Xochimilco and the Basilica of Guadalupe are not in this table because they are inside the city — they have their own section below.",
            },
          ],
        },
        {
          id: "teotihuacan",
          h2: "Teotihuacán: the essential day trip from Mexico City",
          bloques: [
            {
              tipo: "p",
              texto:
                "Just over an hour from Mexico City, Teotihuacán is probably the easiest trip to recommend to anyone visiting the capital for the first time.",
            },
            {
              tipo: "p",
              texto:
                "Arriving early changes the experience. The morning lets you walk the Avenue of the Dead, see the pyramids with fewer people around, and cross the site before the heat and the tour groups arrive.",
            },
            {
              tipo: "p",
              texto:
                "Being relatively close to the city also means you can take it slowly: several hours on the site, lunch nearby, or the Basilica of Guadalupe on the way back, since it sits in the same direction.",
            },
            {
              tipo: "p",
              texto:
                "With a private driver the car stays with you throughout, so the timings and the stops follow your group rather than a schedule.",
            },
          ],
        },
        {
          id: "in-the-city",
          h2: "Xochimilco and the Basilica of Guadalupe: two classics inside the city",
          bloques: [
            {
              tipo: "p",
              texto:
                "Not every trip needs a motorway. Xochimilco and the Basilica of Guadalupe are both inside Mexico City, which makes them half-days rather than day trips, and the easiest things here to fit into a schedule that already has something else in it.",
            },
            {
              tipo: "p",
              texto:
                "The Basilica sits in the north of the city and pairs especially well with Teotihuacán, since both lie in the same direction. Xochimilco, in the south, works better alongside Coyoacán or San Ángel.",
            },
            {
              tipo: "tabla",
              encabezados: ["Place", "From the centre", "How long to allow", "Pairs well with"],
              filas: [
                ["Basilica of Guadalupe", "20–30 min north", "1–2 hours", "Teotihuacán — it is on the way"],
                ["Xochimilco", "45–60 min south", "3–4 hours", "Coyoacán and San Ángel"],
              ],
            },
            {
              tipo: "p",
              texto:
                "The Basilica of Guadalupe is one of the great pilgrimage sites of Mexico. The complex holds the modern shrine and the old basilica beside it, easily recognised by the lean it took on as the ground beneath settled. One to two hours is usually enough for an unhurried visit, and entry is free.",
            },
            {
              tipo: "nota",
              texto:
                "The great exception is 12 December, when the scale of the pilgrimage reshapes movement across the whole area. The shrine stays open twenty-four hours that day and the surrounding streets close.",
            },
            {
              tipo: "p",
              texto:
                "Xochimilco preserves part of the lake landscape that defined the Valley of Mexico for centuries. Its canals are travelled aboard flat-bottomed boats called trajineras, and the atmosphere changes considerably with the pier you choose: Nativitas is the liveliest, with music, food and far more visitors, while Cuemanco offers a quieter experience closer to the ecological zone.",
            },
            {
              tipo: "p",
              texto:
                "Allow at least three to four hours for the full experience, including the drive from the central neighbourhoods.",
            },
            {
              tipo: "nota",
              texto:
                "A trajinera is hired by the boat and by the hour — the official rate is around $750 MXN per hour — and costs the same whether two people board or eighteen. Being quoted per person is the most common confusion in Xochimilco: agree the hourly rate and the number of hours before stepping on, because the clock starts when you board.",
            },
          ],
        },
        {
          id: "near",
          h2: "Cuernavaca and Puebla: two classic escapes from Mexico City",
          bloques: [
            {
              tipo: "p",
              texto:
                "To the south, Cuernavaca offers an almost immediate change of climate. The so-called City of Eternal Spring is a straightforward escape for anyone after a long lunch, gardens and an afternoon away from the pace of the capital.",
            },
            {
              tipo: "p",
              texto:
                "Puebla asks for a little more road, but repays it with one of the most appealing historic centres in Mexico and a food scene that justifies the trip on its own.",
            },
            {
              tipo: "p",
              texto:
                "From Mexico City the ideal is to give it the whole day: leave in the morning, walk the historic centre without rushing, keep time for a proper lunch, and head back in the afternoon or after dinner.",
            },
            {
              tipo: "p",
              texto:
                "If the schedule allows, Puebla can be combined with Cholula, a few kilometres away. It is one of the most popular pairings for a day trip from Mexico City, particularly for travellers who want architecture, history and food in a single outing.",
            },
          ],
        },
        {
          id: "far",
          h2: "Valle de Bravo and Querétaro: trips that deserve a full day",
          bloques: [
            {
              tipo: "p",
              texto:
                "Some destinations start to feel like a small journey within the journey. Valle de Bravo is one of them.",
            },
            {
              tipo: "p",
              texto:
                "Surrounded by forest and built around the lake, the town moves at a completely different pace from the capital. The drive from Mexico City runs to about two and a half hours in good conditions, so it is worth leaving early and setting aside practically the whole day. Between a walk through the centre, lunch by the water and something outdoors, six hours in Valle de Bravo go quickly.",
            },
            {
              tipo: "p",
              texto:
                "Santiago de Querétaro asks for a little more road, but it remains possible as a day trip. Its historic centre, squares and colonial architecture are enough to build a full day around, though the journey is more comfortable when the itinerary has some give in it.",
            },
            {
              tipo: "p",
              texto:
                "If you have time for a night, Querétaro is better enjoyed slowly. If not, an early start from Mexico City lets you see the essentials and return the same day.",
            },
          ],
        },
        {
          id: "san-miguel",
          h2: "San Miguel de Allende from Mexico City: is it worth going and back in a day?",
          bloques: [
            {
              tipo: "p",
              texto:
                "It is possible to visit San Miguel de Allende from Mexico City and return the same day, but it has to be taken on as a long one.",
            },
            {
              tipo: "p",
              texto:
                `The distance runs to around ${LEGS.sanmiguel.km} kilometres and the drive can approach four hours each way. To genuinely enjoy the destination, the sensible shape is to leave around six in the morning and keep the return for late in the day.`,
            },
            {
              tipo: "p",
              texto:
                "Once there, the historic centre is made for walking: cobbled streets, colonial façades, galleries, restaurants and the Parroquia de San Miguel Arcángel hold most of the experience.",
            },
            {
              tipo: "nota",
              texto:
                "If your itinerary allows a night or two, San Miguel rewards the stay. In that case it is usually better to book one transfer out and another back on different dates than to keep a car waiting for the duration.",
            },
          ],
        },
        {
          id: "how-to-book",
          h2: "How to arrange a day trip from Mexico City with a private driver",
          bloques: [
            {
              tipo: "p",
              texto:
                "Which arrangement suits you depends on the destination and on how much you want to move once you arrive.",
            },
            {
              tipo: "lista",
              items: [
                "Round trip. The chauffeur collects you in Mexico City, drives you to the destination, stays available for the agreed time and brings you back the same day. It is the most practical option for Puebla, Cuernavaca, Tepoztlán, Valle de Bravo, Querétaro and San Miguel de Allende.",
                "By the hour. The car and chauffeur stay at your disposal for a block of time. This works particularly well for Teotihuacán, Xochimilco or any itinerary with several stops.",
                "Separate transfers. If you are staying a night or more at the destination, it is normally better to book the outbound and the return separately.",
              ],
            },
          ],
        },
        {
          id: "practical",
          h2: "Tips for a day trip from Mexico City",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Leave early. An hour can make a considerable difference getting out of Mexico City, especially midweek.",
                "Plan the return. Deciding roughly when you want to be back lets you enjoy the destination without watching the clock.",
                "Consider the climate. Altitude and temperature change noticeably between Mexico City, Cuernavaca, Valle de Bravo, Puebla and San Miguel de Allende.",
                "Leave some slack. Road times are estimates, and a slightly loose itinerary usually makes for a better day than one packed with stops.",
              ],
            },
          ],
        },
      ],
      faqs: [
        [
          "What day trips from Mexico City can you do in one day?",
          "Teotihuacán, Cuernavaca, Tepoztlán, Puebla, Valle de Bravo and Querétaro all work well as day trips. San Miguel de Allende is possible too, though it needs a very early start. Inside the city, Xochimilco and the Basilica of Guadalupe fit comfortably into half a day.",
        ],
        [
          "What is the best day trip from Mexico City?",
          "Teotihuacán, for most people. It is about an hour each way, so it costs you the least of your trip, and the site itself is extraordinary. Puebla is the best alternative if you have seen the pyramids or care more about food.",
        ],
        [
          "How long is the drive from Mexico City to Teotihuacán?",
          "About an hour in reasonable traffic. Leaving the city after 07:00 can add significantly to that, which is why early starts are worth it.",
        ],
        [
          "Can you do San Miguel de Allende as a day trip from Mexico City?",
          "Yes, with an early start. It is roughly four hours each way, so a six o'clock departure gives you a full afternoon there and a late return. If your trip has room for a night, San Miguel is the destination on this list that most rewards one.",
        ],
        [
          "What is the advantage of a day trip from Mexico City with a private driver?",
          "Flexibility, mainly. With a private driver you choose the departure time, change the pace of the day, add stops and head back when your group is ready. A shared tour is usually cheaper, but it runs to a fixed schedule and a fixed itinerary.",
        ],
        [
          "Does the driver wait while we are there?",
          "Yes, that is what a round trip means — the chauffeur stays and brings you back the same day. A couple of hours of waiting are included and you can add more when you book.",
        ],
        [
          "How much does a trajinera cost in Xochimilco?",
          "The official rate is around $750 MXN per hour, charged per boat rather than per person — the same whether two of you board or eighteen. Agree the rate and the number of hours before boarding.",
        ],
        [
          "Is the Basilica of Guadalupe worth visiting, and does it cost anything?",
          "Entry is free, with no ticket and no required donation, and the new basilica is open daily from 06:00 to 21:00. It is about 20 to 30 minutes north of the centre and needs only an hour or two, which is why it pairs so well with Teotihuacán — it is on the way north.",
        ],
      ],
      cta: {
        titulo: "Your day, at your pace",
        copy: "Choose the destination and we will handle the road. Book a private chauffeur from Mexico City, decide how long you want at each stop, and travel on a price agreed from the start. Private vehicle, professional chauffeur, VAT, fuel and tolls included.",
        boton: "Get a quote",
      },
      relacionadas: [
        { page: "teotihuacan", label: "Teotihuacán day trip: hours, prices and what to expect" },
        { page: "hourly", label: "Hourly chauffeur service: how it works and what it covers" },
        { page: "rates", label: "Round trip prices to the out-of-town destinations" },
        { page: "guideAirport", label: "How to get from Mexico City airport into the city" },
      ],
    },

    es: {
      kicker: "Guía de viaje",
      title: "Excursiones de un día desde la CDMX con chofer",
      h1: "Excursiones de un día desde la Ciudad de México con chofer privado",
      description:
        "Nueve lugares al alcance de la CDMX —Teotihuacán, Xochimilco, la Basílica de Guadalupe, Tepoztlán, Puebla, Cuernavaca y más— con tiempos de camino reales, cuánto tiempo pide cada uno y a qué hora conviene salir.",
      intro:
        "La Ciudad de México es también un excelente punto de partida para descubrir algunos de los destinos más interesantes del centro del país. A poco más de una hora aparecen las pirámides de Teotihuacán; unas horas después, ciudades coloniales, Pueblos Mágicos, lagos entre montañas y algunas de las mejores mesas de México. Algunas escapadas funcionan perfectamente en medio día; otras merecen salir temprano y regresar después de cenar. En esta guía comparamos las mejores excursiones de un día desde CDMX, cuánto tiempo requieren realmente y cuáles funcionan mejor cuando viajas con chofer privado.",
      revisado: "Datos revisados: octubre de 2026",
      indiceTitulo: "En esta página",
      datos: [
        { valor: "9", etiqueta: "destinos comparados" },
        { valor: "1–4 h", etiqueta: "de carretera por sentido" },
        { valor: "3", etiqueta: "formas de reservarlo" },
      ],
      secciones: [
        {
          id: "the-table",
          h2: "Las mejores excursiones de un día desde CDMX: tiempo y distancia",
          bloques: [
            {
              tipo: "p",
              texto:
                "En el mapa, muchos de estos destinos parecen relativamente cercanos. En la práctica, el tráfico de salida de la Ciudad de México puede transformar por completo el día.",
            },
            {
              tipo: "p",
              texto:
                "Teotihuacán permite una escapada tranquila de medio día; Puebla merece una jornada completa; y llegar hasta San Miguel de Allende implica aceptar que buena parte de la experiencia estará también en la carretera.",
            },
            {
              tipo: "tabla",
              encabezados: ["Destino", "Carretera por sentido", "En carretera, ida y vuelta", "Recomendación"],
              filas: [
                ["Teotihuacán", "Cerca de 1 h", "Cerca de 2 h", "Ideal para medio día o día completo"],
                fila("tepoztlan", "Tepoztlán", "Escapada cómoda de medio día"),
                fila("cuernavaca", "Cuernavaca", "Escapada cómoda de un día"),
                fila("puebla", "Puebla", "Mejor como día completo"),
                fila("vallebravo", "Valle de Bravo", "Día completo con salida temprana"),
                fila("queretaro", "Querétaro", "Posible en un día; mejor con tiempo"),
                fila("sanmiguel", "San Miguel de Allende", "Jornada larga; conviene salir muy temprano"),
              ],
            },
            {
              tipo: "nota",
              texto:
                "Estos son tiempos aproximados en condiciones normales. Para aprovechar mejor el día, especialmente entre semana, suele valer la pena salir temprano. Xochimilco y la Basílica de Guadalupe no aparecen en esta tabla porque están dentro de la ciudad: tienen su propia sección más abajo.",
            },
          ],
        },
        {
          id: "teotihuacan",
          h2: "Teotihuacán: la excursión imprescindible desde CDMX",
          bloques: [
            {
              tipo: "p",
              texto:
                "A poco más de una hora de la Ciudad de México, Teotihuacán es probablemente la excursión más fácil de recomendar a quien visita la capital por primera vez.",
            },
            {
              tipo: "p",
              texto:
                "Llegar temprano cambia la experiencia. La mañana permite recorrer la Calzada de los Muertos, observar las pirámides con menos gente y caminar por la zona arqueológica antes de que aumenten el calor y los grupos turísticos.",
            },
            {
              tipo: "p",
              texto:
                "Al estar relativamente cerca de CDMX, Teotihuacán también permite viajar sin prisas. Puedes dedicar varias horas a la zona arqueológica, parar a comer en los alrededores o combinar la visita con la Basílica de Guadalupe en el camino de regreso.",
            },
            {
              tipo: "p",
              texto:
                "Con un chofer privado, el vehículo permanece disponible durante el recorrido, por lo que puedes adaptar los horarios y las paradas al ritmo de tu grupo.",
            },
          ],
        },
        {
          id: "in-the-city",
          h2: "Xochimilco y la Basílica de Guadalupe: dos clásicos dentro de CDMX",
          bloques: [
            {
              tipo: "p",
              texto:
                "No todas las excursiones requieren tomar carretera. Xochimilco y la Basílica de Guadalupe están dentro de la Ciudad de México y pueden convertirse fácilmente en planes de medio día.",
            },
            {
              tipo: "p",
              texto:
                "La Basílica se encuentra al norte de la ciudad y combina especialmente bien con Teotihuacán, ya que ambos destinos quedan en la misma dirección. Xochimilco, al sur, funciona mejor junto con Coyoacán o San Ángel.",
            },
            {
              tipo: "tabla",
              encabezados: ["Lugar", "Desde el centro", "Cuánto tiempo dejar", "Combina bien con"],
              filas: [
                ["Basílica de Guadalupe", "20–30 min al norte", "1–2 horas", "Teotihuacán, que queda de camino"],
                ["Xochimilco", "45–60 min al sur", "3–4 horas", "Coyoacán y San Ángel"],
              ],
            },
            {
              tipo: "p",
              texto:
                "La Basílica de Guadalupe es uno de los grandes centros de peregrinación de México. El complejo reúne el santuario moderno y la antigua basílica, fácilmente reconocible por la inclinación que provocó el hundimiento del suelo. Para una visita tranquila suele bastar entre una y dos horas.",
            },
            {
              tipo: "nota",
              texto:
                "La gran excepción es el 12 de diciembre, cuando la afluencia de peregrinos transforma por completo la movilidad de la zona. Ese día el santuario abre las veinticuatro horas y las calles de alrededor se cierran.",
            },
            {
              tipo: "p",
              texto:
                "Xochimilco conserva una parte del paisaje lacustre que definió al Valle de México durante siglos. Sus canales se recorren a bordo de trajineras y el ambiente cambia considerablemente según el embarcadero elegido: Nativitas es el punto más animado, con música, comida y una mayor concentración de visitantes, mientras que Cuemanco ofrece una experiencia más tranquila y cercana a la zona ecológica.",
            },
            {
              tipo: "p",
              texto:
                "Conviene considerar al menos tres o cuatro horas para la experiencia completa, incluyendo los traslados desde las zonas centrales de CDMX.",
            },
            {
              tipo: "nota",
              texto:
                "La trajinera se renta por lancha y por hora —la tarifa oficial ronda los $750 MXN la hora— y cuesta lo mismo si suben dos personas que si suben dieciocho. Que te coticen por persona es la confusión más común en Xochimilco: conviene acordar la tarifa y el número de horas antes de abordar, porque el tiempo empieza a correr al subir.",
            },
          ],
        },
        {
          id: "near",
          h2: "Cuernavaca y Puebla: dos escapadas clásicas desde Ciudad de México",
          bloques: [
            {
              tipo: "p",
              texto:
                "Hacia el sur, Cuernavaca ofrece un cambio de clima casi inmediato. La llamada Ciudad de la Eterna Primavera es una escapada sencilla para quienes buscan una comida larga, jardines y una tarde lejos del ritmo de la capital.",
            },
            {
              tipo: "p",
              texto:
                "Puebla exige un poco más de carretera, pero recompensa el recorrido con uno de los centros históricos más atractivos de México y una escena gastronómica que justifica por sí sola la visita.",
            },
            {
              tipo: "p",
              texto:
                "Desde CDMX, lo ideal es dedicarle el día completo: salir por la mañana, recorrer el centro histórico sin prisas, reservar tiempo para comer y regresar por la tarde o después de cenar.",
            },
            {
              tipo: "p",
              texto:
                "Si el horario lo permite, Puebla puede combinarse con Cholula, situada a pocos kilómetros. Es una de las combinaciones más populares para una excursión de un día desde Ciudad de México, especialmente para quienes quieren reunir arquitectura, historia y gastronomía en una sola salida.",
            },
          ],
        },
        {
          id: "far",
          h2: "Valle de Bravo y Querétaro: escapadas para dedicarles el día",
          bloques: [
            {
              tipo: "p",
              texto:
                "Hay destinos que empiezan a sentirse como un pequeño viaje dentro del viaje. Valle de Bravo es uno de ellos.",
            },
            {
              tipo: "p",
              texto:
                "Rodeado de bosque y construido alrededor del lago, el pueblo ofrece un ritmo completamente distinto al de la capital. El trayecto desde CDMX ronda las dos horas y media en condiciones favorables, por lo que conviene salir temprano y reservar prácticamente todo el día. Entre una caminata por el centro, una comida junto al lago y alguna actividad al aire libre, seis horas en Valle de Bravo pasan rápido.",
            },
            {
              tipo: "p",
              texto:
                "Santiago de Querétaro requiere un poco más de carretera, pero sigue siendo posible como excursión de un día. Su centro histórico, plazas y arquitectura colonial permiten armar una jornada completa, aunque el viaje resulta más cómodo cuando el itinerario tiene cierta flexibilidad.",
            },
            {
              tipo: "p",
              texto:
                "Si tienes tiempo para pasar una noche, Querétaro se disfruta con más calma. Si no, una salida temprana desde Ciudad de México permite conocer lo esencial y regresar el mismo día.",
            },
          ],
        },
        {
          id: "san-miguel",
          h2: "San Miguel de Allende desde CDMX: ¿vale la pena ir y volver el mismo día?",
          bloques: [
            {
              tipo: "p",
              texto:
                "Sí es posible visitar San Miguel de Allende desde Ciudad de México y regresar el mismo día, pero hay que asumir que será una jornada larga.",
            },
            {
              tipo: "p",
              texto:
                `La distancia ronda los ${LEGS.sanmiguel.km} kilómetros y el trayecto puede acercarse a cuatro horas por sentido. Para disfrutar realmente del destino, lo razonable es salir alrededor de las seis de la mañana y dejar el regreso para después de la tarde.`,
            },
            {
              tipo: "p",
              texto:
                "Una vez allí, el centro histórico se presta para caminar: calles empedradas, fachadas coloniales, galerías, restaurantes y la Parroquia de San Miguel Arcángel concentran buena parte de la experiencia.",
            },
            {
              tipo: "nota",
              texto:
                "Si tu itinerario permite pasar una o dos noches, San Miguel recompensa la estancia. En ese caso suele ser más conveniente contratar un traslado de ida y otro de regreso en fechas distintas que mantener un vehículo esperando durante toda la estancia.",
            },
          ],
        },
        {
          id: "how-to-book",
          h2: "Cómo organizar una excursión desde CDMX con chofer privado",
          bloques: [
            {
              tipo: "p",
              texto:
                "La mejor modalidad depende del destino y de cuánto quieras moverte una vez que llegues.",
            },
            {
              tipo: "lista",
              items: [
                "Viaje redondo. El chofer te recoge en Ciudad de México, te lleva al destino, permanece disponible durante el tiempo acordado y te regresa el mismo día. Es la opción más práctica para Puebla, Cuernavaca, Tepoztlán, Valle de Bravo, Querétaro y San Miguel de Allende.",
                "Servicio por horas. El vehículo y el chofer permanecen a tu disposición durante un bloque de tiempo. Funciona especialmente bien para Teotihuacán, Xochimilco o itinerarios con varias paradas.",
                "Traslados separados. Si vas a pasar una o más noches en el destino, normalmente resulta más conveniente reservar la ida y el regreso por separado.",
              ],
            },
          ],
        },
        {
          id: "practical",
          h2: "Consejos para una excursión de un día desde CDMX",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Sal temprano. Una hora puede marcar una diferencia considerable al salir de Ciudad de México, especialmente entre semana.",
                "Planea el regreso. Definir desde el inicio aproximadamente a qué hora quieres volver permite disfrutar el destino sin estar mirando constantemente el reloj.",
                "Considera el clima. La altitud y la temperatura pueden cambiar bastante entre CDMX, Cuernavaca, Valle de Bravo, Puebla o San Miguel de Allende.",
                "Deja algo de margen. En carretera los tiempos son estimaciones, y un itinerario ligeramente holgado suele convertirse en un mejor día que uno lleno de paradas.",
              ],
            },
          ],
        },
      ],
      faqs: [
        [
          "¿Qué excursiones desde Ciudad de México se pueden hacer en un día?",
          "Teotihuacán, Cuernavaca, Tepoztlán, Puebla, Valle de Bravo y Querétaro funcionan bien como excursiones de un día. San Miguel de Allende también es posible, aunque requiere salir muy temprano. Dentro de CDMX, Xochimilco y la Basílica de Guadalupe pueden hacerse cómodamente en medio día.",
        ],
        [
          "¿Cuál es la mejor excursión de un día desde la CDMX?",
          "Teotihuacán, para casi todo el mundo. Está a una hora por sentido, así que es la que menos día te cuesta, y el sitio es extraordinario. Puebla es la mejor alternativa si ya conoces las pirámides o si te importa más la gastronomía.",
        ],
        [
          "¿Cuánto se hace de la CDMX a Teotihuacán?",
          "Alrededor de una hora con tráfico razonable. Salir de la ciudad después de las 07:00 puede sumarle bastante, y por eso vale la pena madrugar.",
        ],
        [
          "¿Se puede ir a San Miguel de Allende en un día desde la CDMX?",
          "Sí, saliendo temprano. Son unas cuatro horas por sentido, así que una salida a las seis te da una tarde completa allá y un regreso tarde. Si tu viaje tiene espacio para una noche, San Miguel es el destino de esta lista que más lo compensa.",
        ],
        [
          "¿Qué ventaja tiene hacer una excursión desde CDMX con chofer privado?",
          "La principal diferencia es la flexibilidad. Con un chofer privado puedes elegir la hora de salida, modificar el ritmo del día, hacer paradas adicionales y regresar cuando tu grupo esté listo. Un tour compartido suele ser más económico, pero trabaja con horarios e itinerarios predeterminados.",
        ],
        [
          "¿El chofer espera mientras estamos allá?",
          "Sí, eso es un viaje redondo: el chofer se queda y te regresa el mismo día. Incluye un par de horas de espera y puedes añadir más al reservar.",
        ],
        [
          "¿Cuánto cuesta una trajinera en Xochimilco?",
          "La tarifa oficial ronda los $750 MXN por hora y se cobra por lancha, no por persona: cuesta lo mismo si suben dos que si suben dieciocho. Conviene acordar la tarifa y cuántas horas antes de subir.",
        ],
        [
          "¿Vale la pena la Basílica de Guadalupe y cuánto cuesta entrar?",
          "La entrada es libre, sin boleto ni donativo obligatorio, y la basílica nueva abre todos los días de 06:00 a 21:00. Está a unos 20 o 30 minutos al norte del centro y con una o dos horas basta, que es justo por lo que combina tan bien con Teotihuacán: queda de camino al norte.",
        ],
      ],
      cta: {
        titulo: "Tu día, a tu ritmo",
        copy: "Elige el destino y nosotros nos encargamos del camino. Reserva un chofer privado desde Ciudad de México, define el tiempo que quieres pasar en cada lugar y viaja con una tarifa acordada desde el principio. Vehículo privado, chofer profesional, IVA, combustible y casetas incluidos.",
        boton: "Cotizar excursión",
      },
      relacionadas: [
        { page: "teotihuacan", label: "Teotihuacán: horarios, precios y qué esperar" },
        { page: "hourly", label: "Servicio por horas: cómo funciona y qué incluye" },
        { page: "rates", label: "Precios del viaje redondo a los destinos foráneos" },
        { page: "guideAirport", label: "Cómo llegar del aeropuerto de la CDMX a la ciudad" },
      ],
    },
  },
};
