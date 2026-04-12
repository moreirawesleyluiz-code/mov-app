/** Lista para o seletor de cidade (perfil). Ordem alfabética aproximada. */
export const BRAZIL_CITY_OPTIONS: string[] = [
  "Belo Horizonte",
  "Brasília",
  "Campinas",
  "Curitiba",
  "Florianópolis",
  "Fortaleza",
  "Porto Alegre",
  "Recife",
  "Rio de Janeiro",
  "Salvador",
  "São Paulo",
  "São José dos Campos",
].sort((a, b) => a.localeCompare(b, "pt-BR"));
