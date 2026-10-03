export interface NumericParseResult {
  value: number | null;
  error: string | null;
}

/**
 * Parse a user supplied decimal number. Accepts comma as decimal separator so
 * the field behaves naturally on locales that use it.
 */
export function parseDecimal(input: string): NumericParseResult {
  const normalized = input.trim().replace(',', '.');
  if (normalized === '') return { value: null, error: null };
  if (!/^-?\d*\.?\d*$/.test(normalized)) {
    return { value: null, error: 'Enter a valid number' };
  }
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { value: null, error: 'Enter a valid number' };
  return { value, error: null };
}

/** Parse and require the value to be strictly greater than zero. */
export function parsePositiveDecimal(input: string, fieldLabel: string): NumericParseResult {
  const { value, error } = parseDecimal(input);
  if (error) return { value: null, error };
  if (value === null) return { value: null, error: `${fieldLabel} is required` };
  if (value <= 0) return { value: null, error: `${fieldLabel} must be greater than 0` };
  return { value, error: null };
}

/** Parse and require a whole number greater than zero. */
export function parsePositiveInteger(input: string, fieldLabel: string): NumericParseResult {
  const { value, error } = parseDecimal(input);
  if (error) return { value: null, error };
  if (value === null) return { value: null, error: `${fieldLabel} is required` };
  if (!Number.isInteger(value)) return { value: null, error: `${fieldLabel} must be a whole number` };
  if (value <= 0) return { value: null, error: `${fieldLabel} must be greater than 0` };
  return { value, error: null };
}

export function parseNonNegativeInteger(input: string, fieldLabel: string): NumericParseResult {
  const trimmed = input.trim();
  if (trimmed === '') return { value: null, error: null };
  const { value, error } = parseDecimal(trimmed);
  if (error) return { value: null, error };
  if (value === null) return { value: null, error: null };
  if (!Number.isInteger(value)) return { value: null, error: `${fieldLabel} must be a whole number` };
  if (value < 0) return { value: null, error: `${fieldLabel} cannot be negative` };
  return { value, error: null };
}

export function parseNonNegativeDecimal(input: string, fieldLabel: string): NumericParseResult {
  const trimmed = input.trim();
  if (trimmed === '') return { value: null, error: null };
  const { value, error } = parseDecimal(trimmed);
  if (error) return { value: null, error };
  if (value === null) return { value: null, error: null };
  if (value < 0) return { value: null, error: `${fieldLabel} cannot be negative` };
  return { value, error: null };
}

export function parseOptionalPositiveDecimal(input: string, fieldLabel: string): NumericParseResult {
  if (input.trim() === '') return { value: null, error: null };
  return parsePositiveDecimal(input, fieldLabel);
}

export function requiredText(input: string, fieldLabel: string): { value: string; error: string | null } {
  const trimmed = input.trim();
  if (!trimmed) return { value: '', error: `${fieldLabel} is required` };
  if (trimmed.length > 200) return { value: trimmed, error: `${fieldLabel} is too long` };
  return { value: trimmed, error: null };
}

export function optionalText(input: string, fieldLabel: string, max = 500): { value: string | null; error: string | null } {
  const trimmed = input.trim();
  if (!trimmed) return { value: null, error: null };
  if (trimmed.length > max) return { value: trimmed, error: `${fieldLabel} must be ${max} characters or fewer` };
  return { value: trimmed, error: null };
}

export function requiredChoice<T extends string>(value: T | null, fieldLabel: string): { value: T; error: string | null } | { value: null; error: string } {
  if (!value) return { value: null, error: `${fieldLabel} is required` };
  return { value, error: null };
}

/** Collects the first error per field so each input can show it inline. */
export function firstError(errors: Record<string, string | null | undefined>): string | null {
  for (const message of Object.values(errors)) {
    if (message) return message;
  }
  return null;
}
