/** Number and string formatting helpers for the UI. */

/** Trims trailing zeros: 12.50 -> 12.5, 12.00 -> 12 */
export function trimNumber(value: number, maxDecimals = 1): string {
  if (!Number.isFinite(value)) return '0';
  return Number(value.toFixed(maxDecimals)).toString();
}

export function formatWeight(value: number | null | undefined, suffix = 'kg'): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${trimNumber(value)} ${suffix}`;
}

export function formatMacro(value: number): string {
  return trimNumber(value);
}

export function formatQuantity(value: number, short: string): string {
  return `${trimNumber(value, 2)} ${short}`;
}

export function formatCount(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

/** `1.2 MB`, `840 kB` */
export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} kB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/** Signed delta with a unit, e.g. `-1.4 kg`. */
export function formatDelta(value: number, suffix: string): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${trimNumber(value)} ${suffix}`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
