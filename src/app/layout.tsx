/** Estilos globais (Tailwind + base) — deve permanecer importado neste layout raiz. */
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { getPublicAppOrigin } from "@/lib/public-app-url";
import { Providers } from "./providers";

const appOrigin = getPublicAppOrigin();

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(appOrigin),
  title: "MOV — Onde histórias reais começam",
  description:
    "Comunidade de conexões reais em São Paulo. Se Mov, experiências presenciais e agenda social curada.",
  applicationName: "MOV",
  appleWebApp: {
    capable: true,
    title: "MOV",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-movApp-bg font-sans text-movApp-ink antialiased [color-scheme:light]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
