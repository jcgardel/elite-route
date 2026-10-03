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
        "Mexico City is surrounded by places worth a day of your trip — pyramids an hour away, colonial cities, a lake town in the mountains — and two of the best are inside the city itself. The question is never whether they are worth seeing; it is how much of the day the road takes. Here is what each one really asks of you.",
      revisado: "Last checked: October 2026",
      indiceTitulo: "On this page",
      datos: [
        { valor: "9", etiqueta: "destinations compared" },
        { valor: "1–4 h", etiqueta: "drive out, each way" },
        { valor: "2", etiqueta: "ways to book it" },
      ],
      secciones: [
        {
          id: "the-table",
          h2: "Leaving the city: what actually fits in a day",
          bloques: [
            {
              tipo: "tabla",
              encabezados: ["Destination", "Drive each way", "On the road, round trip", "Verdict"],
              filas: [
                ["Teotihuacán", "About 1 h", "About 2 h", "The easy one. Half a day if you want."],
                fila("tepoztlan", "Tepoztlán", "Easy. A town you walk in an afternoon."),
                fila("cuernavaca", "Cuernavaca", "Comfortable. Lunch and an afternoon."),
                fila("puebla", "Puebla", "Works, but commit to the full day."),
                fila("vallebravo", "Valle de Bravo", "Long day. Leave early."),
                fila("queretaro", "Querétaro", "A committed day. Rewarding with a night."),
                fila("sanmiguel", "San Miguel de Allende", "The long one. Start before dawn."),
              ],
            },
            {
              tipo: "nota",
              texto:
                "Those are driving times in reasonable conditions, not promises. Leaving Mexico City after 07:00 or coming back into it between 18:00 and 20:00 can add an hour to any of them. The direction of the traffic matters more than the distance. Xochimilco and the Basilica of Guadalupe are not in this table because they are inside the city — they have their own section below.",
            },
          ],
        },
        {
          id: "teotihuacan",
          h2: "Teotihuacán — the one everybody should do",
          bloques: [
            {
              tipo: "p",
              texto:
                "The pyramids are about an hour from the city, which makes this the only destination on the list that does not cost you a whole day. Leave at 07:00 and you are walking the Avenue of the Dead before the heat and the tour buses arrive; you can be back for a late lunch.",
            },
            {
              tipo: "p",
              texto:
                "Because the round trip is only about 100 km, it books differently from everything else here: as a day by the hour rather than a transfer, which means the car stays with you and you set the pace. That is usually nine or ten hours and it is the cheapest way to do it.",
            },
          ],
        },
        {
          id: "in-the-city",
          h2: "Two more, without leaving the city",
          bloques: [
            {
              tipo: "p",
              texto:
                "Xochimilco and the Basilica of Guadalupe are the two destinations most visitors assume are out-of-town trips. They are not — both are inside Mexico City, which makes them half-days rather than day trips, and the easiest things on this page to fit into a schedule that already has something else in it.",
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
                "The Basilica is the most visited Catholic shrine in the Americas and entry is free — no ticket, no required donation. The new basilica opens daily from 06:00 to 21:00 with Mass every hour. Next to it stands the old one, visibly leaning: it sank unevenly into the lakebed clay the city is built on, and rather than demolish it, engineers stabilised it and left it standing. Twenty minutes is enough to see both; an hour if you want to sit.",
            },
            {
              tipo: "nota",
              texto:
                "Avoid 12 December unless the pilgrimage is the reason you are going. Around nine million people come that day. The basilica stays open 24 hours, the surrounding streets close, and nothing about the visit resembles any other day of the year.",
            },
            {
              tipo: "p",
              texto:
                "Xochimilco is the other one: canals left over from the lake city that stood here before the Spanish arrived, and flat-bottomed boats called trajineras poled along them. It takes longer than people plan for — the ride alone is usually two hours, and it is an hour each way from the centre in traffic.",
            },
            {
              tipo: "nota",
              texto:
                "The trajinera is rented BY THE BOAT, BY THE HOUR — the official regulated rate is around $750 MXN per hour — and the price is the same whether two people board or eighteen. Being quoted a price per person is the single most common way visitors are overcharged here. Agree the hourly rate and the number of hours before you step on, because the clock starts when you board.",
            },
            {
              tipo: "p",
              texto:
                "Which pier you choose changes the day completely. Nativitas is the busiest and the most festive, with food and music and boats full of parties. Cuemanco is quieter, closer to the ecological zone, and the one to pick if you want the canals rather than the party.",
            },
          ],
        },
        {
          id: "near",
          h2: "Cuernavaca and Puebla — the comfortable ones",
          bloques: [
            {
              tipo: "p",
              texto:
                "Cuernavaca is an hour and a half south and noticeably warmer than the capital, which is the entire reason people from Mexico City go there on weekends. Three hours of driving for a full afternoon is a fair trade.",
            },
            {
              tipo: "p",
              texto:
                "Puebla is two hours east and the single best food argument for leaving the city. Four hours on the road means you should treat it as a whole day rather than an outing — leave by 08:00, come back after dinner, and it works well.",
            },
          ],
        },
        {
          id: "far",
          h2: "Valle de Bravo and Querétaro — long but possible",
          bloques: [
            {
              tipo: "p",
              texto:
                "Valle de Bravo is a lake town in the mountains, about two hours and forty minutes away on roads that get slow near the end. It is a genuinely long day: five and a half hours of driving leaves you roughly six hours there if you leave at seven and are back by nine.",
            },
            {
              tipo: "p",
              texto:
                "Querétaro is a little further and the maths get tighter: people do it in a day regularly, and it works if you start early and treat the drive as part of the trip rather than a cost. With a night there you see considerably more of it, so if your schedule has any flexibility, that is the version to take.",
            },
          ],
        },
        {
          id: "san-miguel",
          h2: "San Miguel de Allende — the long one, and how to do it well",
          bloques: [
            {
              tipo: "p",
              texto:
                `This is the one that needs planning rather than improvising. San Miguel is ${LEGS.sanmiguel.km} km away: close to four hours each way, almost eight hours in the car over the day. Leave at six in the morning and you get a full afternoon there and are back late — which is a real day out, as long as you know that is what you signed up for.`,
            },
            {
              tipo: "nota",
              texto:
                "If your trip allows it, San Miguel rewards a night or two more than any other destination on this list. If it does not, the day version works — it just has to start before dawn and be agreed in advance, not decided over breakfast.",
            },
            {
              tipo: "p",
              texto:
                "If you are staying the night — for a wedding, or simply because San Miguel deserves it — book two separate transfers on different days rather than a round trip. There is no sense paying for a car to wait while you sleep.",
            },
          ],
        },
        {
          id: "how-to-book",
          h2: "How this is usually arranged",
          bloques: [
            {
              tipo: "p",
              texto:
                "There are two sensible shapes for these trips, and which one you want depends on whether you need the car while you are there.",
            },
            {
              tipo: "lista",
              items: [
                "A round trip: the chauffeur drives you out, waits, and brings you back the same day. Waiting hours are included, and you can add more when you book. This is how the five out-of-town destinations work.",
                "A day by the hour: the car and chauffeur stay with you for a block of hours and you decide the route as you go. This is how Teotihuacán, Xochimilco and the Basilica work, and it is the better option whenever you want to stop somewhere on the way — or combine two places, like the Basilica on the way north to the pyramids.",
              ],
            },
            {
              tipo: "p",
              texto:
                "Two separate one-way transfers are the third option, and they are what you want when you are staying the night — there is no sense paying for a car to wait fourteen hours.",
            },
          ],
        },
        {
          id: "practical",
          h2: "Four things that make these days better",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Leave early. Not for the destination — for the traffic getting out of Mexico City. The difference between 07:00 and 09:00 is often an hour.",
                "Carry cash in pesos. Tolls on these highways are real money and not everywhere takes cards.",
                "Mexico City sits at 2,240 m and some of these destinations are a lot lower. If you have just arrived and are feeling the altitude, a day in Cuernavaca is a surprisingly effective cure.",
                "Agree the return time before you set off, not at the end of lunch. It is the single thing that decides whether the day feels relaxed or rushed.",
              ],
            },
          ],
        },
      ],
      faqs: [
        [
          "What is the best day trip from Mexico City?",
          "Teotihuacán, for most people. It is about an hour each way, so it costs you the least of your trip, and the site itself is extraordinary. Puebla is the best alternative if you have seen the pyramids or care more about food.",
        ],
        [
          "Can you do San Miguel de Allende as a day trip from Mexico City?",
          "Yes, with an early start. It is roughly four hours each way, so a six o'clock departure gives you a full afternoon there and a late return. If your trip has room for a night, San Miguel is the destination on this list that most rewards one.",
        ],
        [
          "How long is the drive from Mexico City to Teotihuacán?",
          "About an hour in reasonable traffic. Leaving the city after 07:00 can add significantly to that, which is why early starts are worth it.",
        ],
        [
          "Is it better to hire a driver or take a tour bus?",
          "A tour bus is cheaper and a driver is yours. With a driver you leave when you want, stop where you want and come back when you are ready, which on a long day out of the city is most of the value. For Teotihuacán specifically, the gap is smaller because the trip is short.",
        ],
        [
          "How much does a trajinera cost in Xochimilco?",
          "The official regulated rate is around $750 MXN per hour, and it is charged per boat, not per person — the same whether two of you board or eighteen. If someone quotes you a price per person, that is the most common way visitors are overcharged there. Agree the rate and the number of hours before boarding.",
        ],
        [
          "Is the Basilica of Guadalupe worth visiting, and does it cost anything?",
          "Entry is free, with no ticket and no required donation, and the new basilica is open daily from 06:00 to 21:00. It is about 20 to 30 minutes north of the centre and needs only an hour or two, which is why it pairs so well with Teotihuacán — it is on the way north.",
        ],
        [
          "Does the driver wait while we are there?",
          "Yes, that is what a round trip means — the chauffeur stays and brings you back the same day. A couple of hours of waiting are included and you can add more when you book.",
        ],
      ],
      cta: {
        titulo: "Plan the day around what you want to see",
        copy: "Pick your destination in the quote form, choose round trip, and set how long you want the chauffeur to wait. Fixed price, VAT, tolls and fuel included — no surprises at the end of the day.",
        boton: "Get a quote",
      },
      relacionadas: [
        { page: "teotihuacan", label: "Teotihuacán day trip: hours, prices and what to expect" },
        { page: "rates", label: "Round trip prices to all five destinations" },
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
