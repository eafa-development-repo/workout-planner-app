/** Date helpers. All dates are stored as `YYYY-MM-DD` local calendar days. */

export type DateInput = Date | string | null | undefined;

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Local calendar day at midnight. */
export function startOfDay(date: Date = new Date()): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** `YYYY-MM-DD` in local time (not UTC, so the day always matches the device). */
export function toDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const parsed = parseDateKey(key);
  return !Number.isNaN(parsed.getTime());
}

/** e.g. `12 Mar 2026` */
export function formatDateKey(key: string | null | undefined): string {
  if (!key) return '—';
  const date = parseDateKey(key);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** e.g. `12 Mar` */
export function formatShortDateKey(key: string | null | undefined): string {
  if (!key) return '—';
  const date = parseDateKey(key);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Today at midnight, ready to feed a date picker. */
export function today(): Date {
  return startOfDay();
}

/** Relative day label used in the weight history list. */
export function relativeDayLabel(key: string): string {
  const target = parseDateKey(key).getTime();
  const todayTime = startOfDay().getTime();
  const diffDays = Math.round((todayTime - target) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDateKey(key);
}

/** Duration summary for a workout, e.g. `12 days` or `Single day`. */
export function formatDuration(start: string | null, end: string | null): string | null {
  if (!start) return null;
  const from = parseDateKey(start).getTime();
  const to = end ? parseDateKey(end).getTime() : startOfDay().getTime();
  const days = Math.max(0, Math.round((to - from) / 86_400_000) + 1);
  if (days === 1) return 'Single day';
  return `${days} days`;
}
