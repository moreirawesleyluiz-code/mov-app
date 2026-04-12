/** Lista para seleção de país no onboarding — nomes em PT-BR, código ISO 3166-1 alpha-2 */

export type CountryItem = {
  code: string;
  name: string;
  flag: string;
};

export const ONBOARDING_COUNTRIES: CountryItem[] = [
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colômbia", flag: "🇨🇴" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "UY", name: "Uruguai", flag: "🇺🇾" },
  { code: "PY", name: "Paraguai", flag: "🇵🇾" },
  { code: "FR", name: "França", flag: "🇫🇷" },
  { code: "IT", name: "Itália", flag: "🇮🇹" },
  { code: "ES", name: "Espanha", flag: "🇪🇸" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "IE", name: "Irlanda", flag: "🇮🇪" },
  { code: "CH", name: "Suíça", flag: "🇨🇭" },
  { code: "NL", name: "Países Baixos", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "AU", name: "Austrália", flag: "🇦🇺" },
  { code: "NZ", name: "Nova Zelândia", flag: "🇳🇿" },
  { code: "JP", name: "Japão", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "KR", name: "Coreia do Sul", flag: "🇰🇷" },
  { code: "IN", name: "Índia", flag: "🇮🇳" },
  { code: "ZA", name: "África do Sul", flag: "🇿🇦" },
  { code: "AO", name: "Angola", flag: "🇦🇴" },
  { code: "MZ", name: "Moçambique", flag: "🇲🇿" },
  { code: "CV", name: "Cabo Verde", flag: "🇨🇻" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "AE", name: "Emirados Árabes", flag: "🇦🇪" },
].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export function findCountryByCode(code: string): CountryItem | undefined {
  return ONBOARDING_COUNTRIES.find((c) => c.code === code);
}
