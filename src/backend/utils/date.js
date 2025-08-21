export function daysBetween(a, b) {
  const start = new Date(a);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(b);
  end.setUTCHours(0, 0, 0, 0);
  const ms = Math.abs(end.getTime() - start.getTime());
  return Math.floor(ms / 86400000);
}

export function isoWeekLabel(isoString) {
  const d = new Date(isoString);
  // Move date to Thursday of the same week to get the correct year for that week
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${year}-W${String(weekNo).padStart(2, '0')}`;
}
