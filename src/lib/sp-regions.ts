/** Regiões de São Paulo para o jantar (habilitação pode variar por campanha). */

export type SpRegion = {
  id: string;
  label: string;
  enabled: boolean;
};

export const SP_DINNER_REGIONS: SpRegion[] = [
  { id: "jardins-itaim-moema", label: "Jardins / Itaim Bibi / Moema", enabled: true },
  { id: "pinheiros-vila-madalena", label: "Pinheiros / Vila Madalena", enabled: true },
  {
    id: "centro-santa-cecilia-perdizes",
    label: "Centro / Santa Cecília / Perdizes / Higienópolis",
    enabled: false,
  },
  { id: "tatuape-mooca-bras", label: "Tatuapé / Mooca / Brás", enabled: false },
];

export function isValidRegionKey(key: string): boolean {
  return SP_DINNER_REGIONS.some((r) => r.id === key && r.enabled);
}
