/**
 * Preserva filtros da lista ao navegar para o detalhe do utilizador (e voltar).
 * Centralizado para evitar divergência entre `/admin` e `/admin/users/[id]`.
 */

export function buildAdminListSearchParams(
  sp: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const q = new URLSearchParams();
  const pick = (k: string) => {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    if (typeof s === "string" && s.trim() !== "") q.set(k, s);
  };
  pick("q");
  pick("city");
  pick("role");
  pick("state");
  pick("sub");
  pick("mov");
  pick("from");
  pick("to");
  return q;
}

export function adminListHref(sp: Record<string, string | string[] | undefined>): string {
  const qs = buildAdminListSearchParams(sp).toString();
  return qs ? `/admin?${qs}` : "/admin";
}

export function adminUserDetailHref(
  userId: string,
  sp: Record<string, string | string[] | undefined>,
  hash?: string,
): string {
  const qs = buildAdminListSearchParams(sp).toString();
  const base = `/admin/users/${userId}`;
  const h = hash ? `#${hash.replace(/^#/, "")}` : "";
  return qs ? `${base}?${qs}${h}` : `${base}${h}`;
}
