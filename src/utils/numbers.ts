/**
 * Formats a number value with locale-specific formatting.
 * For integers, uses thousand separators.
 * For decimals, formats to 2 decimal places with comma separator.
 * @param value - The number to format
 * @returns A formatted string representation of the number
 */
export function formatValue(value: number, locale?: string): string {
  if (value % 1 === 0) return value.toLocaleString(locale || 'en-US');
  return (value || 0).toLocaleString(locale || 'en-US', {
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a percentage value with consistent formatting and locale-specific formatting.
 * Returns "0%" for zero values, otherwise formats as absolute value with 2 decimal places.
 * @param value - The percentage value to format
 * @returns A formatted percentage string
 */
export function formatPercentage(value: number, locale?: string): string {
  if (value === 0) return '0%';
  return `${Math.abs(value).toLocaleString(locale || 'en-US', {
    maximumFractionDigits: 2,
  })}%`;
}
