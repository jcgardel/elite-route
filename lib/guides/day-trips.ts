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
        "Eight places within reach of Mexico City — Teotihuacán, Xochimilco, the Basilica of Guadalupe, Puebla, Cuernavaca and more — with real drive times, how long each one needs and what time to leave.",
      intro:
        "Mexico City is surrounded by places worth a day of your trip — pyramids an hour away, colonial cities, a lake town in the mountains — and two of the best are inside the city itself. The question is never whether they are worth seeing; it is how much of the day the road takes. Here is what each one really asks of you.",
      revisado: "Last checked: October 2026",
      indiceTitulo: "On this page",
      datos: [
        { valor: "8", etiqueta: "destinations compared" },
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
        "Ocho lugares al alcance de la CDMX —Teotihuacán, Xochimilco, la Basílica de Guadalupe, Puebla, Cuernavaca y más— con tiempos de camino reales, cuánto tiempo pide cada uno y a qué hora conviene salir.",
      intro:
        "La Ciudad de México está rodeada de sitios que valen un día del viaje —pirámides a una hora, ciudades coloniales, un pueblo junto a un lago en la montaña— y dos de los mejores están dentro de la propia ciudad. La pregunta nunca es si vale la pena ir; es cuánto del día se lleva el camino. Esto es lo que pide cada uno.",
      revisado: "Datos revisados: octubre de 2026",
      indiceTitulo: "En esta página",
      datos: [
        { valor: "8", etiqueta: "destinos comparados" },
        { valor: "1–4 h", etiqueta: "de carretera por sentido" },
        { valor: "2", etiqueta: "formas de reservarlo" },
      ],
      secciones: [
        {
          id: "the-table",
          h2: "Salir de la ciudad: qué cabe de verdad en un día",
          bloques: [
            {
              tipo: "tabla",
              encabezados: ["Destino", "Carretera por sentido", "En carretera, ida y vuelta", "Veredicto"],
              filas: [
                ["Teotihuacán", "Como 1 h", "Como 2 h", "El fácil. Media jornada si quieres."],
                fila("cuernavaca", "Cuernavaca", "Cómodo. Comida y una tarde."),
                fila("puebla", "Puebla", "Funciona, pero dedícale el día entero."),
                fila("vallebravo", "Valle de Bravo", "Día largo. Hay que salir temprano."),
                fila("queretaro", "Querétaro", "Día comprometido. Mejor con una noche."),
                fila("sanmiguel", "San Miguel de Allende", "El largo. Hay que salir de madrugada."),
              ],
            },
            {
              tipo: "nota",
              texto:
                "Son tiempos de manejo en condiciones razonables, no promesas. Salir de la CDMX después de las 07:00 o regresar entre las 18:00 y las 20:00 puede sumarle una hora a cualquiera. Pesa más la dirección del tráfico que la distancia. Xochimilco y la Basílica de Guadalupe no están en esta tabla porque están dentro de la ciudad: tienen su propia sección más abajo.",
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
          id: "in-the-city",
          h2: "Dos más, sin salir de la ciudad",
          bloques: [
            {
              tipo: "p",
              texto:
                "Xochimilco y la Basílica de Guadalupe son los dos destinos que casi todo visitante da por foráneos. No lo son: los dos están dentro de la Ciudad de México, lo que los convierte en medias jornadas y no en excursiones, y en lo más fácil de esta página para encajar en un día que ya tiene algo más.",
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
                "La Basílica es el santuario católico más visitado de América y la entrada es libre: sin boleto y sin donativo obligatorio. La basílica nueva abre todos los días de 06:00 a 21:00, con misa cada hora. Al lado está la antigua, visiblemente inclinada: se hundió de forma despareja en el suelo de lo que fue el lago, y en lugar de demolerla la estabilizaron y ahí sigue. Veinte minutos bastan para ver las dos; una hora si quieres sentarte.",
            },
            {
              tipo: "nota",
              texto:
                "Evita el 12 de diciembre salvo que la peregrinación sea justamente a lo que vas. Ese día llegan alrededor de nueve millones de personas. La basílica abre 24 horas, las calles de alrededor se cierran y la visita no se parece en nada a la de cualquier otro día del año.",
            },
            {
              tipo: "p",
              texto:
                "Xochimilco es el otro: canales que quedaron de la ciudad lacustre que había aquí antes de que llegaran los españoles, y trajineras empujadas con pértiga por ellos. Se lleva más tiempo del que la gente calcula —el paseo solo suele ser de dos horas, y es una hora por sentido desde el centro con tráfico—.",
            },
            {
              tipo: "nota",
              texto:
                "La trajinera se renta POR LANCHA Y POR HORA —la tarifa oficial ronda los $750 MXN la hora— y cuesta lo mismo si suben dos personas que si suben dieciocho. Que te coticen por persona es la forma más común en que le cobran de más a un visitante aquí. Acuerda la tarifa por hora y cuántas horas antes de subir, porque el reloj empieza a correr al abordar.",
            },
            {
              tipo: "p",
              texto:
                "El embarcadero que elijas cambia el día por completo. Nativitas es el más concurrido y el más fiestero, con comida, música y lanchas llenas de grupos. Cuemanco es más tranquilo, más cerca de la zona ecológica, y es el que hay que elegir si lo que quieres son los canales y no la fiesta.",
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
                "Querétaro está un poco más lejos y las cuentas se aprietan: hay quien lo hace en el día con frecuencia, y funciona si sales temprano y tomas la carretera como parte del viaje y no como un costo. Con una noche allá ves bastante más, así que si tu agenda tiene algo de flexibilidad, ésa es la versión que conviene.",
            },
          ],
        },
        {
          id: "san-miguel",
          h2: "San Miguel de Allende: el largo, y cómo hacerlo bien",
          bloques: [
            {
              tipo: "p",
              texto:
                `Éste es el que hay que planear en lugar de improvisar. San Miguel está a ${LEGS.sanmiguel.km} km: casi cuatro horas por sentido, casi ocho horas de coche a lo largo del día. Saliendo a las seis de la mañana tienes una tarde completa allá y vuelves tarde, que es un día de verdad, siempre que sepas de antemano a lo que te apuntaste.`,
            },
            {
              tipo: "nota",
              texto:
                "Si tu viaje lo permite, San Miguel compensa quedarse una o dos noches más que cualquier otro destino de esta lista. Si no lo permite, la versión de un día funciona: sólo tiene que empezar de madrugada y quedar acordada de antemano, no decidirse en el desayuno.",
            },
            {
              tipo: "p",
              texto:
                "Si te quedas a dormir —por una boda, o sencillamente porque San Miguel lo merece—, resérvalo como dos traslados sencillos en días distintos y no como viaje redondo. No tiene sentido pagar por un coche que espera mientras duermes.",
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
                "Día por horas: el coche y el chofer se quedan contigo un bloque de horas y vas decidiendo la ruta sobre la marcha. Así funcionan Teotihuacán, Xochimilco y la Basílica, y es mejor opción siempre que quieras parar en algún sitio del camino, o combinar dos lugares, como la Basílica camino al norte hacia las pirámides.",
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
          "Sí, saliendo temprano. Son unas cuatro horas por sentido, así que una salida a las seis te da una tarde completa allá y un regreso tarde. Si tu viaje tiene espacio para una noche, San Miguel es el destino de esta lista que más lo compensa.",
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
          "¿Cuánto cuesta una trajinera en Xochimilco?",
          "La tarifa oficial ronda los $750 MXN por hora y se cobra por lancha, no por persona: cuesta lo mismo si suben dos que si suben dieciocho. Si alguien te cotiza por persona, ésa es la forma más común en que le cobran de más a un visitante. Acuerda la tarifa y cuántas horas antes de subir.",
        ],
        [
          "¿Vale la pena la Basílica de Guadalupe y cuánto cuesta entrar?",
          "La entrada es libre, sin boleto ni donativo obligatorio, y la basílica nueva abre todos los días de 06:00 a 21:00. Está a unos 20 o 30 minutos al norte del centro y con una o dos horas basta, que es justo por lo que combina tan bien con Teotihuacán: queda de camino al norte.",
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
