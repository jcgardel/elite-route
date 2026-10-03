/**
 * GUÍA 2: excursiones de un día desde la Ciudad de México.
 *
 * DE DÓNDE SALEN LOS TIEMPOS. De `lib/distances.ts`, que es la misma fuente
 * que calcula los precios de las páginas de ruta. No se escriben a mano aquí:
 * si un día se corrige la distancia de Valle de Bravo, esta guía y la tarifa
 * se mueven juntas. Lo que sí se escribe es el veredicto de cada destino, que
 * es un juicio y no un dato.
 *
 * LA PARTE INCÓMODA, Y POR QUÉ SE QUEDA. San Miguel de Allende son 290 km por
 * sentido: casi ocho horas de carretera ida y vuelta. La guía dice que NO es
 * una buena excursión de un día, aunque el sitio venda ese traslado y ahora
 * también el viaje redondo. Decirlo cuesta alguna reserva y gana la única
 * cosa que hace que una guía sirva para algo: que el lector crea lo demás.
 * Un viajero que hace ese viaje engañado vuelve agotado y deja una reseña que
 * cuesta mucho más que la venta.
 *
 * Teotihuacán va aparte porque se reserva distinto: con unos 100 km redondos
 * cabe en el servicio por horas, y por eso tiene su propia página con tabla de
 * precios. Los cinco destinos foráneos pasan de 90 km por sentido y se
 * reservan como viaje redondo. Ver `admiteRedondo` en lib/service-limits.ts.
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
        "Six destinations within reach of Mexico City, with honest drive times, which ones genuinely work as a day trip, which one does not, and what time to leave.",
      intro:
        "Mexico City is surrounded by places worth a day of your trip — pyramids an hour away, colonial cities, a lake town in the mountains. The question is never whether they are worth seeing; it is whether they fit in a day. Some do comfortably. One does not, and we will say which.",
      revisado: "Last checked: October 2026",
      indiceTitulo: "On this page",
      datos: [
        { valor: "6", etiqueta: "destinations compared" },
        { valor: "1–4 h", etiqueta: "drive, each way" },
        { valor: "1", etiqueta: "we tell you to skip" },
      ],
      secciones: [
        {
          id: "the-table",
          h2: "What actually fits in a day",
          bloques: [
            {
              tipo: "tabla",
              encabezados: ["Destination", "Drive each way", "On the road, round trip", "Verdict"],
              filas: [
                ["Teotihuacán", "About 1 h", "About 2 h", "The easy one. Half a day if you want."],
                fila("cuernavaca", "Cuernavaca", "Comfortable. Lunch and an afternoon."),
                fila("puebla", "Puebla", "Works, but commit to the full day."),
                fila("vallebravo", "Valle de Bravo", "Long day. Leave early."),
                fila("queretaro", "Querétaro", "Stretching it. Better as an overnight."),
                fila("sanmiguel", "San Miguel de Allende", "Not a day trip. Stay the night."),
              ],
            },
            {
              tipo: "nota",
              texto:
                "Those are driving times in reasonable conditions, not promises. Leaving Mexico City after 07:00 or coming back into it between 18:00 and 20:00 can add an hour to any of them. The direction of the traffic matters more than the distance.",
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
                "Querétaro is a little further and the maths get tighter. It can be done, and people do it, but you will spend more of the day in the car than most travellers expect. If your schedule has any flexibility, it is a much better overnight.",
            },
          ],
        },
        {
          id: "san-miguel",
          h2: "San Miguel de Allende — do not do this in a day",
          bloques: [
            {
              tipo: "p",
              texto:
                `We will sell you the trip, and we would rather you did not take it as a day trip. San Miguel is ${LEGS.sanmiguel.km} km away: close to four hours each way, almost eight hours in the car. Leave at six in the morning and you are back near midnight, having spent less time in San Miguel than on the road to it.`,
            },
            {
              tipo: "nota",
              texto:
                "San Miguel is worth two nights. If you only have one day free, spend it on Teotihuacán or Puebla and save San Miguel for a trip where you can stay.",
            },
            {
              tipo: "p",
              texto:
                "If you are going anyway — people do, for a wedding or a single appointment — book it as two separate transfers on different days rather than a round trip. It costs the same kind of money and you arrive able to stand up.",
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
                "A day by the hour: the car and chauffeur stay with you for a block of hours and you decide the route as you go. This is how Teotihuacán works, and it is the better option whenever you want to stop somewhere on the way.",
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
          "You can, but you should not. It is roughly four hours each way — about eight hours in the car — which leaves very little day at the other end. San Miguel deserves an overnight.",
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
        "Seis destinos al alcance de la CDMX, con tiempos de carretera honestos, cuáles funcionan de verdad en un día, cuál no, y a qué hora conviene salir.",
      intro:
        "La Ciudad de México está rodeada de sitios que valen un día del viaje: pirámides a una hora, ciudades coloniales, un pueblo junto a un lago en la montaña. La pregunta nunca es si vale la pena ir; es si cabe en un día. Algunos sí, con holgura. Uno no, y vamos a decir cuál.",
      revisado: "Datos revisados: octubre de 2026",
      indiceTitulo: "En esta página",
      datos: [
        { valor: "6", etiqueta: "destinos comparados" },
        { valor: "1–4 h", etiqueta: "de carretera por sentido" },
        { valor: "1", etiqueta: "que te decimos que no hagas" },
      ],
      secciones: [
        {
          id: "the-table",
          h2: "Qué cabe de verdad en un día",
          bloques: [
            {
              tipo: "tabla",
              encabezados: ["Destino", "Carretera por sentido", "En carretera, ida y vuelta", "Veredicto"],
              filas: [
                ["Teotihuacán", "Como 1 h", "Como 2 h", "El fácil. Media jornada si quieres."],
                fila("cuernavaca", "Cuernavaca", "Cómodo. Comida y una tarde."),
                fila("puebla", "Puebla", "Funciona, pero dedícale el día entero."),
                fila("vallebravo", "Valle de Bravo", "Día largo. Hay que salir temprano."),
                fila("queretaro", "Querétaro", "Muy justo. Mejor con una noche."),
                fila("sanmiguel", "San Miguel de Allende", "No es excursión de un día. Quédate a dormir."),
              ],
            },
            {
              tipo: "nota",
              texto:
                "Son tiempos de manejo en condiciones razonables, no promesas. Salir de la CDMX después de las 07:00 o regresar entre las 18:00 y las 20:00 puede sumarle una hora a cualquiera. Pesa más la dirección del tráfico que la distancia.",
            },
          ],
        },
        {
          id: "teotihuacan",
          h2: "Teotihuacán, el que debería hacer todo el mundo",
          bloques: [
            {
              tipo: "p",
              texto:
                "Las pirámides están a cosa de una hora, y eso lo convierte en el único destino de la lista que no te cuesta el día completo. Saliendo a las 07:00 caminas la Calzada de los Muertos antes del calor y de los autobuses de turistas, y puedes volver a comer tarde.",
            },
            {
              tipo: "p",
              texto:
                "Como el viaje redondo son apenas unos 100 km, se reserva distinto a todo lo demás de esta página: como día por horas y no como traslado, así que el coche se queda contigo y el ritmo lo pones tú. Suelen ser nueve o diez horas y es la forma más barata de hacerlo.",
            },
          ],
        },
        {
          id: "near",
          h2: "Cuernavaca y Puebla, los cómodos",
          bloques: [
            {
              tipo: "p",
              texto:
                "Cuernavaca está hora y media al sur y hace notablemente más calor que en la capital, que es exactamente la razón por la que los capitalinos van los fines de semana. Tres horas de carretera por una tarde completa es un trato justo.",
            },
            {
              tipo: "p",
              texto:
                "Puebla está a dos horas al este y es el mejor argumento gastronómico que existe para salir de la ciudad. Cuatro horas de camino significan tratarlo como día completo y no como paseo: salir a las 08:00, volver después de cenar, y funciona muy bien.",
            },
          ],
        },
        {
          id: "far",
          h2: "Valle de Bravo y Querétaro, largos pero posibles",
          bloques: [
            {
              tipo: "p",
              texto:
                "Valle de Bravo es un pueblo junto a un lago en la montaña, a unas dos horas y cuarenta minutos por carreteras que se ponen lentas al final. Es un día largo de verdad: cinco horas y media de manejo te dejan unas seis horas allá si sales a las siete y vuelves a las nueve.",
            },
            {
              tipo: "p",
              texto:
                "Querétaro está un poco más lejos y las cuentas se aprietan. Se puede, y hay quien lo hace, pero vas a pasar más del día dentro del coche de lo que casi nadie espera. Si tu agenda tiene algo de flexibilidad, funciona mucho mejor con una noche.",
            },
          ],
        },
        {
          id: "san-miguel",
          h2: "San Miguel de Allende: no lo hagas en un día",
          bloques: [
            {
              tipo: "p",
              texto:
                `Te vendemos el viaje, y preferiríamos que no lo hicieras en un día. San Miguel está a ${LEGS.sanmiguel.km} km: casi cuatro horas por sentido, casi ocho horas dentro del coche. Sales a las seis de la mañana y vuelves cerca de medianoche, habiendo pasado menos tiempo en San Miguel que en la carretera para llegar.`,
            },
            {
              tipo: "nota",
              texto:
                "San Miguel merece dos noches. Si sólo tienes un día libre, gástalo en Teotihuacán o en Puebla y deja San Miguel para un viaje en el que puedas quedarte.",
            },
            {
              tipo: "p",
              texto:
                "Si vas de todos modos —pasa, por una boda o una cita concreta—, resérvalo como dos traslados sencillos en días distintos y no como viaje redondo. Cuesta un dinero parecido y llegas pudiéndote sostener en pie.",
            },
          ],
        },
        {
          id: "how-to-book",
          h2: "Cómo se suele armar",
          bloques: [
            {
              tipo: "p",
              texto:
                "Hay dos formas sensatas de hacer estos viajes, y cuál te conviene depende de si necesitas el coche mientras estás allá.",
            },
            {
              tipo: "lista",
              items: [
                "Viaje redondo: el chofer te lleva, te espera y te regresa el mismo día. Incluye horas de espera y puedes añadir más al reservar. Así funcionan los cinco destinos foráneos.",
                "Día por horas: el coche y el chofer se quedan contigo un bloque de horas y vas decidiendo la ruta sobre la marcha. Así funciona Teotihuacán, y es mejor opción siempre que quieras parar en algún sitio del camino.",
              ],
            },
            {
              tipo: "p",
              texto:
                "Dos traslados sencillos por separado son la tercera opción, y es la que quieres cuando te quedas a dormir: no tiene sentido pagar por un coche que espera catorce horas.",
            },
          ],
        },
        {
          id: "practical",
          h2: "Cuatro cosas que mejoran estos días",
          bloques: [
            {
              tipo: "lista",
              items: [
                "Sal temprano. No por el destino, sino por el tráfico para salir de la CDMX. Entre las 07:00 y las 09:00 suele haber una hora de diferencia.",
                "Lleva efectivo en pesos. Las casetas de estas carreteras son dinero de verdad y no en todas aceptan tarjeta.",
                "La Ciudad de México está a 2,240 m y varios de estos destinos están bastante más abajo. Si acabas de llegar y te pesa la altura, un día en Cuernavaca es un remedio sorprendentemente eficaz.",
                "Acuerda la hora de regreso antes de salir, no al final de la comida. Es lo único que decide si el día se siente tranquilo o apurado.",
              ],
            },
          ],
        },
      ],
      faqs: [
        [
          "¿Cuál es la mejor excursión de un día desde la CDMX?",
          "Teotihuacán, para casi todo el mundo. Está a una hora por sentido, así que es la que menos día te cuesta, y el sitio es extraordinario. Puebla es la mejor alternativa si ya conoces las pirámides o si te importa más la comida.",
        ],
        [
          "¿Se puede ir a San Miguel de Allende en un día desde la CDMX?",
          "Se puede, pero no deberías. Son unas cuatro horas por sentido —cerca de ocho dentro del coche—, lo que deja muy poco día del otro lado. San Miguel merece quedarse a dormir.",
        ],
        [
          "¿Cuánto se hace de la CDMX a Teotihuacán?",
          "Alrededor de una hora con tráfico razonable. Salir de la ciudad después de las 07:00 puede sumarle bastante, y por eso vale la pena madrugar.",
        ],
        [
          "¿Conviene más un chofer o un tour en autobús?",
          "El autobús es más barato y el chofer es tuyo. Con chofer sales cuando quieres, paras donde quieres y vuelves cuando estás listo, que en un día largo fuera de la ciudad es casi todo el valor. Para Teotihuacán en concreto la diferencia es menor, porque el viaje es corto.",
        ],
        [
          "¿El chofer espera mientras estamos allá?",
          "Sí, eso es un viaje redondo: el chofer se queda y te regresa el mismo día. Incluye un par de horas de espera y puedes añadir más al reservar.",
        ],
      ],
      cta: {
        titulo: "Arma el día alrededor de lo que quieres ver",
        copy: "Elige tu destino en el cotizador, marca viaje redondo y define cuántas horas quieres que el chofer espere. Precio fijo con IVA, casetas y combustible incluidos; sin sorpresas al final del día.",
        boton: "Cotizar",
      },
      relacionadas: [
        { page: "teotihuacan", label: "Teotihuacán: horarios, precios y qué esperar" },
        { page: "rates", label: "Precios del viaje redondo a los cinco destinos" },
        { page: "guideAirport", label: "Cómo llegar del aeropuerto de la CDMX a la ciudad" },
      ],
    },
  },
};
