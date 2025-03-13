export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date); // Create a copy to avoid mutation
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}
export function setStartOfDay(date: Date): Date {
  return new Date(date.setHours(0, 0, 0, 0));
}

export function setEndOfDay(date: Date): Date {
  return new Date(date.setHours(23, 59, 59, 999));
}
