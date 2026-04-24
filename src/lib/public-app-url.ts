const DEV_FALLBACK = "http://localhost:3456";

function isHttpOrHttps(u: URL): boolean {
  return u.protocol === "http:" || u.protocol === "https:";
}

/**
 * Garante origem com esquema `http`/`https` (evita `new URL` “válido” mas errado, ex. `localhost:3456` → protocolo
 * `localhost:` e `metadataBase` a partir do RSC a falhar com 500).
 */
function normalizeToOrigin(raw: string): string | null {
  const s = raw.trim().replace(/\/$/, "");
  if (!s) return null;
  // Só tratar como URL absoluta se tiver "://" (evita "localhost:3456" ser lido como esquema "localhost:").
  const withScheme = s.includes("://")
    ? s
    : `${process.env.NODE_ENV !== "production" ? "http" : "https"}://${s}`;
  try {
    const u = new URL(withScheme);
    if (!isHttpOrHttps(u)) return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Origem pública do site (esquema + host, sem barra final — na prática: `URL.origin`).
 * Usado em e-mails de reset, `metadataBase`, etc.
 *
 * Produção (ex.): `https://se-mov.com` — defina `NEXT_PUBLIC_APP_URL` e `APP_URL` iguais ao domínio canónico
 * (MOV canónico sem `www`). Pode ser só o host (ex. `se-mov.com`); o esquema é assumido (https em produção).
 * Em Vercel pode usar-se `VERCEL_URL` se ainda não houver variável. Desenvolvimento: `http://localhost:3456`.
 */
export function getPublicAppOrigin(): string {
  const fromEnv = [process.env.NEXT_PUBLIC_APP_URL, process.env.APP_URL, process.env.AUTH_URL]
    .map((s) => s?.trim().replace(/\/$/, ""))
    .find((v) => v);
  if (fromEnv) {
    const o = normalizeToOrigin(fromEnv);
    if (o) return o;
  }
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) {
    return `https://${vercel}`;
  }
  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK;
  }
  if (process.env.VERCEL) {
    console.error(
      "[MOV] produção: defina NEXT_PUBLIC_APP_URL (e APP_URL) com o domínio canónico. VERCEL_URL não estava definido no runtime.",
    );
  } else {
    console.error(
      "[MOV] produção: defina NEXT_PUBLIC_APP_URL (e APP_URL) com o domínio canónico; ligação de e-mail e metadados usam a URL pública errada se omitido.",
    );
  }
  return DEV_FALLBACK;
}
