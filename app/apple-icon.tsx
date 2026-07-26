import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#C8A46B",
            fontWeight: 700,
            fontSize: 74,
            letterSpacing: 2,
          }}
        >
          ER
        </div>
        <div
          style={{
            width: 84,
            height: 2,
            background: "#C8A46B",
            marginTop: 10,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
