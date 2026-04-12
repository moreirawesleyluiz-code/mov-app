/** Formatação para cartões estilo Timeleft (pt-BR). */

export function formatDinnerWeekdayDate(date: Date) {
  const s = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDinnerTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
