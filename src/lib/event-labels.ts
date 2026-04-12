export function eventTypeLabel(type: string) {
  const map: Record<string, string> = {
    CLASSICO: "MOV Clássico",
    SENSORIAL: "MOV Sensorial",
    EXCLUSIVO: "MOV Exclusivo",
    COMUNIDADE: "Comunidade",
    ROLÊ: "Rolê",
  };
  return map[type] ?? type;
}
