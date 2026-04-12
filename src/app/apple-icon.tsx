import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon (Safari → Adicionar ao ecrã inicial). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f5",
          fontSize: 48,
          fontWeight: 600,
          color: "#c45c4a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        MOV
      </div>
    ),
    { ...size },
  );
}
