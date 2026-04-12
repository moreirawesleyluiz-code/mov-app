import type { NextConfig } from "next";

/**
 * `next dev` (webpack) gera:
 *   `installChunk(require("./" + __webpack_require__.u(chunkId)))`
 * com `u()` a devolver `611.js` (em `.next/server/chunks/`) ou `vendor-chunks/…` (em `.next/server/vendor-chunks/`).
 * Só o primeiro caso precisa do prefixo `chunks/`. O `chunkFilename` abaixo ajuda o build de produção;
 * em dev, este plugin substitui o loader por um resolver mínimo.
 */
type WebpackFromNext = {
  Compilation: { PROCESS_ASSETS_STAGE_OPTIMIZE: number };
  sources: { RawSource: new (s: string) => { source: () => string } };
};

type WebpackCompilationAssets = {
  getAssets: () => { name: string; source: { source: () => string } }[];
  updateAsset: (name: string, source: unknown) => void;
  hooks: {
    processAssets: { tap: (opts: { name: string; stage: number }, fn: () => void) => void };
  };
};

const DEV_WEBPACK_RUNTIME_CHUNK_LOADER =
  /installChunk\(require\("\.\/" \+ __webpack_require__\.u\(chunkId\)\)\)/;

const DEV_WEBPACK_RUNTIME_CHUNK_LOADER_FIX =
  'installChunk(require((function(u){return u.startsWith("chunks/")?"./"+u:u.indexOf("/")>=0?"./"+u:"./chunks/"+u})(__webpack_require__.u(chunkId))))';

function fixServerWebpackRuntimeChunkPath(webpack: WebpackFromNext) {
  return {
    apply(compiler: { hooks: { thisCompilation: { tap: (name: string, fn: (c: unknown) => void) => void } } }) {
      compiler.hooks.thisCompilation.tap("MovFixServerWebpackRuntimeChunkPath", (compilation) => {
        const c = compilation as WebpackCompilationAssets;
        c.hooks.processAssets.tap(
          {
            name: "MovFixServerWebpackRuntimeChunkPath",
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
          },
          () => {
            const { RawSource } = webpack.sources;
            for (const { name, source } of c.getAssets()) {
              if (!name.endsWith("webpack-runtime.js")) continue;
              const src = source.source().toString();
              if (!DEV_WEBPACK_RUNTIME_CHUNK_LOADER.test(src)) continue;
              const next = src.replace(DEV_WEBPACK_RUNTIME_CHUNK_LOADER, DEV_WEBPACK_RUNTIME_CHUNK_LOADER_FIX);
              if (next !== src) {
                c.updateAsset(name, new RawSource(next));
              }
            }
          },
        );
      });
    },
  };
}

const nextConfig: NextConfig = {
  /**
   * Em dev, `localhost` e `127.0.0.1` são origens diferentes. Pedidos a `/_next/*` vindos de
   * 127.0.0.1 podem ser bloqueados ou falhar de forma inconsistente; o runtime webpack no cliente
   * acusa então `Cannot read properties of undefined (reading 'call')` quando um chunk não carrega.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
   */
  allowedDevOrigins: ["127.0.0.1"],
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
  // Evita que o Turbopack empacote o Prisma com um DMMF incompleto ("Unknown argument `regionKey`", etc.)
  serverExternalPackages: ["@prisma/client", "prisma"],
  /**
   * Produção: `chunkFilename` alinha chunks numéricos com `.next/server/chunks/`.
   * Desenvolvimento: o plugin ajusta o runtime webpack (não aplica a `next dev --turbopack`).
   */
  webpack: (config, { isServer, webpack }) => {
    if (isServer && config.output) {
      config.output.chunkFilename = "chunks/[id].js";
    }
    if (isServer) {
      config.plugins = config.plugins ?? [];
      config.plugins.push(fixServerWebpackRuntimeChunkPath(webpack));
    }
    return config;
  },
};

export default nextConfig;
