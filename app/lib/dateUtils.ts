export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setHours(0, 0, 0, 0);
  if (day !== 1) result.setDate(result.getDate() - day + 1);
  return result;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfMonthGrid(date: Date): Date {
  return startOfWeek(startOfMonth(date));
}

export function formatDutchDate(date: Date): string {
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDutchWeekday(date: Date): string {
  return date.toLocaleDateString("nl-NL", { weekday: "short" });
}

export function formatDutchMonthYear(date: Date): string {
  return date.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}
