import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const appOrigin =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.AUTH_URL ??
  "http://localhost:3456";

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
      <head>
        {/* Estático em /public — pedido separado do bundle Tailwind (útil se o CSS de /_next falhar no browser embutido) */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/mov-fallback.css" />
      </head>
      <body className="min-h-screen bg-movApp-bg font-sans text-movApp-ink antialiased [color-scheme:light]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
