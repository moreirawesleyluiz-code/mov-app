import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Ícone para favicon, manifest PWA e atalho “Adicionar à tela inicial”. */
export default function Icon() {
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
          fontSize: 140,
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
