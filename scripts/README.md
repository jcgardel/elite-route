# Revisar las distancias

```bash
npm run revisar-distancias
```

Tarda unos tres minutos. No cambia nada: mide y presenta.

---

## Por qué hace falta

Las tablas del sitio publican un **precio fijo por ruta**, calculado con una
distancia escrita en `lib/distances.ts`. El cotizador y el checkout miden la
ruta **real** en el momento de reservar.

Esos dos números se separan solos. Entre el 5 y el 12 de octubre de 2026,
AICM–Santa Fe pasó de 28.2 a 25.0 km sin que nadie tocara nada: Google cambió
la ruta que elige.

El guion existe para que esa separación se detecte a tiempo y no la descubra un
cliente comparando la tabla con su cotización.

## Cada cuánto

**Una vez al mes** es suficiente. También conviene correrlo:

- después de cualquier cambio en `lib/distances.ts`, para confirmar que quedó
  donde se esperaba;
- si un cliente reporta que el precio cotizado no coincide con el publicado.

## Cómo leer la salida

Cada fila compara lo declarado con lo medido y traduce la diferencia a pesos,
en **Executive con recargo de aeropuerto**, que es la categoría donde el cambio
se nota más.

La columna final dice `ok`, `REVISAR` o `—`.

| Marca | Qué significa |
|---|---|
| `ok` | Dentro del umbral. No hacer nada. |
| `REVISAR` | Pasa del 5 % de desviación o de $150 en Executive. |
| `—` | Foránea: se mide para vigilarla, pero el dueño decidió no corregirla. |

## Qué hacer con un REVISAR

**1. Repetir la medición en otro momento.** Una sola lectura no es prueba.
Google cambia de ruta por obras, cortes o tráfico, y a veces resuelve el mismo
texto a un punto distinto. El 12 de octubre de 2026, "AIFA → Ángel" dio 53.7 km
en una medición y 41.6 km en otra el mismo día. Quedarse con el número que se
repite.

**2. Enseñarle la tabla al dueño.** Los precios se validan con él **antes** de
tocar `lib/distances.ts`. Es la regla de este proyecto y no tiene excepciones:
de esos números salen todos los precios publicados del sitio.

**3. Si aprueba, corregir y comprobar.** Cambiar el número en
`lib/distances.ts`, y después verificar que las cuatro superficies siguen
coherentes: las fichas de ruta, `/tarifas`, `/b2b` y el cotizador.

**4. Pedir reindexación** de las páginas cuyo precio cambió. Ver el historial de
Search Console en la memoria del proyecto.

## Lo que este guion NO puede arreglar

Tres desviaciones son estructurales. No son fallos y no se corrigen midiendo
mejor:

**La distancia es direccional.** AICM → Zócalo son 8.5 km; Zócalo → AICM son
11.4. El código guarda **un** número por ruta y lo usa en las dos columnas, así
que una de las dos siempre se desvía.

**Las páginas genéricas publican un precio para una ciudad entera.** Desde el
AIFA, el Zócalo y Santa Fe están a distancias muy distintas. "AIFA → CDMX" y
"Toluca → CDMX" se miden contra el **Ángel de la Independencia**, el punto
representativo que eligió el dueño el 5 de octubre de 2026.

**A distancias cortas manda el mínimo de la categoría.** Ahí una desviación de
kilómetros no mueve el precio ni un peso: por eso Centro aparece con diferencia
de kilómetros y `+$0`.

## Las direcciones son puntos identificables a propósito

El nombre de una colonia a secas resuelve mal: "Santa Fe, Ciudad de Mexico"
llegó a devolver **19.9 km** desde el AICM, que es imposible. Por eso la lista
usa Zócalo, Masaryk, Centro Santa Fe, Plaza Satélite, Jardín Centenario, Parque
Hundido y Centro Comercial Interlomas.

Si se cambia un destino de la lista, que sea por otro igual de concreto. Una
medición mala aquí se convierte en una tarifa mala en todo el sitio.

## Decisiones ya tomadas que conviene no rehacer

- **Las foráneas no se corrigen** (3 y 5 de octubre de 2026). Siguen declarando
  más kilómetros que Google y publicando por encima de lo que cobra el
  cotizador. Está razonado en `lib/distances.ts`.
- **El punto de CDMX es el Ángel**, manteniendo "CDMX" como nombre de página.
- **`delvalle` fue el caso que probó que no había política**: declaraba 18 km
  contra 19.1 reales, el único por debajo, y al corregirlo subió de precio.
