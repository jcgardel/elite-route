/**
 * Identidad Elite Route: el logotipo compuesto en vivo con las tipografías
 * que el sitio ya carga, no una imagen.
 *
 * Sustituye al PNG cromado de 1024×1024 y 106 KB que se pintaba a 176 px:
 * aquel venía de otra familia visual (plata, sans ancha, swoosh) y no de la
 * del sitio, se convertía en una mancha gris a tamaño de favicon y era el
 * archivo más pesado de la página. Esto pesa cero bytes de red, es nítido en
 * cualquier pantalla y se puede leer y traducir.
 *
 * Dos piezas que trabajan juntas:
 *   · el logotipo — “ELITE ROUTE” en Cormorant Garamond muy espaciado;
 *   · el símbolo  — el lema dibujado: una línea que arranca abajo, sube de
 *     nivel y sigue arriba, rematada en un punto. Es lo único que aguanta
 *     el cuadrado (favicon, foto de perfil, emblema del auto).
 *
 * TODAS las medidas de dentro son múltiplos de `em`, colgadas de una variable
 * `--bm`. Antes eran píxeles calculados en JavaScript, y eso obligaba a las
 * páginas a encoger el logotipo con `transform: scale()`, que reduce lo que
 * se ve pero **no lo que ocupa**: flex seguía reservando el ancho entero y en
 * un teléfono la barra se desbordaba. Ahora basta con cambiar `--bm` y todo
 * —nombre, símbolo, lema y separaciones— sigue al mismo tiempo.
 */

const GOLD = "#C8A46B";

/** Proporción del símbolo, del viewBox: 118 de ancho por 52 de alto. */
const GLYPH_RATIO = 118 / 52;

export function NivelGlyph({
  /** Alto en em, relativo al tamaño del nombre. */
  em = 1.25,
  /** El trazo engorda al reducir: a 16 px una línea de 3.4 se deshilacha. */
  stroke = 5,
  color = GOLD,
}: {
  em?: number;
  stroke?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 118 52"
      fill="none"
      aria-hidden="true"
      style={{
        // Alto en em y ancho derivado de la proporción: si se dejara en
        // `auto`, algunos motores resuelven el ancho del viewBox en píxeles.
        height: `${em}em`,
        width: `${(em * GLYPH_RATIO).toFixed(3)}em`,
        flexShrink: 0,
        display: "block",
      }}
    >
      <path
        d="M4 42 H34 L64 12 H104"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="110" cy="12" r={stroke * 1.2} fill={color} />
    </svg>
  );
}

export default function BrandMark({
  size = 19,
  compact,
  variant = "inline",
  withGlyph = true,
  withTagline = true,
  color = "#FFFFFF",
  className,
}: {
  /** Tamaño tipográfico del nombre, en px. Todo lo demás escala con él. */
  size?: number;
  /**
   * Tamaño por debajo de 700 px. Sin esto el logotipo mide lo mismo en un
   * teléfono que en un escritorio, que es justo lo que desbordaba la barra.
   */
  compact?: number;
  /** "inline" para barras de navegación; "filete" centrado, entre reglas. */
  variant?: "inline" | "filete";
  withGlyph?: boolean;
  withTagline?: boolean;
  color?: string;
  className?: string;
}) {
  // La clase sale de las medidas, así que dos logotipos iguales comparten
  // regla y el bloque repetido es idéntico e inofensivo. La variable no puede
  // ir en el `style` del elemento: un valor en línea gana a cualquier media
  // query y el tamaño compacto nunca llegaría a aplicarse.
  const cls = compact ? `er-bm-${size}-${compact}` : `er-bm-${size}`;
  // El espaciado entre letras también se afloja al encoger. A 0.26em el
  // nombre gasta casi 40 px sólo en aire entre letras, y en una barra de
  // teléfono ese aire es justo lo que falta; a tamaño pequeño una letra tan
  // suelta además se lee peor, no mejor.
  const css = compact
    ? `.${cls}{--bm:${size}px;--bm-track:0.26em}` +
      `@media (max-width:700px){.${cls}{--bm:${compact}px;--bm-track:0.16em}}`
    : `.${cls}{--bm:${size}px;--bm-track:0.26em}`;

  const stroke = size < 26 ? 5 : 4;

  const name = (
    <span
      style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontWeight: 300,
        fontSize: "1em",
        lineHeight: 1,
        letterSpacing: "var(--bm-track)",
        paddingLeft: "var(--bm-track)",
        color,
        whiteSpace: "nowrap",
      }}
    >
      ELITE ROUTE
    </span>
  );

  const tagline = withTagline ? (
    <span
      className="er-brand-tagline"
      style={{
        fontFamily: "var(--font-barlow-condensed), sans-serif",
        fontWeight: 600,
        // El lema no baja de 7 px: por debajo deja de leerse.
        fontSize: "max(7px, 0.37em)",
        letterSpacing: "var(--bm-track)",
        paddingLeft: "var(--bm-track)",
        textTransform: "uppercase",
        color: "#8B8B87",
        marginTop: "0.36em",
        whiteSpace: "nowrap",
      }}
    >
      We move your level
    </span>
  ) : null;

  const root = (inner: React.ReactNode, style: React.CSSProperties) => (
    <>
      <style>{css}</style>
      <div
        className={className ? `${cls} ${className}` : cls}
        style={{ fontSize: "var(--bm)", ...style }}
      >
        {inner}
      </div>
    </>
  );

  if (variant === "filete") {
    return root(
      <>
        {withGlyph && <NivelGlyph em={1.15} stroke={stroke} />}
        <div style={{ width: "6.4em", height: 1, background: "rgba(200,164,107,0.55)" }} />
        {name}
        <div style={{ width: "3.2em", height: 1, background: "rgba(200,164,107,0.55)" }} />
        {tagline}
      </>,
      { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.42em" },
    );
  }

  return root(
    <>
      {withGlyph && <NivelGlyph em={1.25} stroke={stroke} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {name}
        {tagline}
      </div>
    </>,
    { display: "flex", alignItems: "center", gap: "0.66em" },
  );
}
