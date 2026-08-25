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
 */

const GOLD = "#C8A46B";

export function NivelGlyph({
  height = 22,
  color = GOLD,
}: {
  height?: number;
  color?: string;
}) {
  // El trazo engorda al reducir: a 16 px una línea de 3.4 se deshilacha.
  const stroke = height < 26 ? 5 : 4;
  return (
    <svg
      width={Math.round((height * 118) / 52)}
      height={height}
      viewBox="0 0 118 52"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
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
  variant = "inline",
  withGlyph = true,
  withTagline = true,
  color = "#FFFFFF",
  className,
}: {
  /** Tamaño tipográfico del nombre, en px. Todo lo demás escala con él. */
  size?: number;
  /** "inline" para barras de navegación; "filete" centrado, entre reglas. */
  variant?: "inline" | "filete";
  withGlyph?: boolean;
  withTagline?: boolean;
  color?: string;
  className?: string;
}) {
  const name = (
    <span
      style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontWeight: 300,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.26em",
        paddingLeft: "0.26em",
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
        fontSize: Math.max(7, Math.round(size * 0.37)),
        letterSpacing: "0.26em",
        paddingLeft: "0.26em",
        textTransform: "uppercase",
        color: "#8B8B87",
        marginTop: Math.round(size * 0.36),
        whiteSpace: "nowrap",
      }}
    >
      We move your level
    </span>
  ) : null;

  if (variant === "filete") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: Math.round(size * 0.42),
        }}
      >
        {withGlyph && <NivelGlyph height={Math.round(size * 1.15)} />}
        <div style={{ width: size * 6.4, height: 1, background: "rgba(200,164,107,0.55)" }} />
        {name}
        <div style={{ width: size * 3.2, height: 1, background: "rgba(200,164,107,0.55)" }} />
        {tagline}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", gap: Math.round(size * 0.66) }}
    >
      {withGlyph && <NivelGlyph height={Math.round(size * 1.25)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {name}
        {tagline}
      </div>
    </div>
  );
}
