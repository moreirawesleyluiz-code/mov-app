import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Em dev, `localhost` e `127.0.0.1` são origens diferentes para pedidos a `/_next/*`.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
   */
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [
      {
        source: "/admin",
        headers: [{ key: "Cache-Control", value: "private, no-store, must-revalidate" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, must-revalidate" }],
      },
    ];
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
