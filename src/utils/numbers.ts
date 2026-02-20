import i18n from '@/utils/plugins/i18n';

/**
 * Formats a number value with locale-specific formatting.
 * For integers, uses thousand separators.
 * For decimals, formats to 2 decimal places with comma separator.
 * @param value - The number to format
 * @param locale - The locale string for formatting
 * @returns A formatted string representation of the number
 */
export function formatValue(value: number, locale?: string): string {
  if (value % 1 === 0) return value.toLocaleString(locale || 'en-US');
  return (value || 0).toLocaleString(locale || 'en-US', {
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a number value with locale-specific formatting, handling special values.
 * @param value - The number to format
 * @param locale - The locale string for formatting
 * @returns A formatted string representation of the number
 */
export function formatNumber(value: number, locale?: string): string {
  // Handle special values
  if (value === Infinity) return '∞';
  if (value === -Infinity) return '-∞';
  if (Number.isNaN(value)) return 'NaN';

  return (value || 0).toLocaleString(locale || i18n.global.locale || 'en-US');
}

/**
 * Formats a percentage value with consistent formatting and locale-specific formatting.
 * Returns "0%" for zero values, otherwise formats as absolute value with 2 decimal places.
 * @param value - The percentage value to format
 * @param locale - The locale string for formatting
 * @returns A formatted percentage string
 */
export function formatPercentage(value: number, locale?: string): string {
  if (value === 0) return '0%';
  return `${Math.abs(value).toLocaleString(locale || 'en-US', {
    maximumFractionDigits: 2,
  })}%`;
}

/**
 * Formats a percentage value with fixed 2 decimal places (widget-specific formatting).
 * @param value - The percentage value to format
 * @param locale - The locale string for formatting
 * @returns A formatted percentage string with 2 decimal places
 */
export function formatPercentageFixed(value: number, locale?: string): string {
  return (
    (value || 0).toLocaleString(locale || 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '%'
  );
}

/**
 * Formats a currency value with proper symbol and locale.
 * @param value - The currency value
 * @param currencySymbol - The currency symbol to use
 * @param locale - The locale string for formatting
 * @returns A formatted currency string
 */
export function formatCurrency(
  value: number,
  currencySymbol: string,
  locale?: string,
): string {
  return `${currencySymbol} ${Number(value || 0).toLocaleString(
    locale || 'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

/**
 * Calculates and formats the percentage of a value relative to a total.
 * @param val - The value (can be number or string)
 * @param total - The total value (can be number or string)
 * @param precision - Number of decimal places (default: 2)
 * @returns A formatted percentage string
 */
export function getPercentageOf(
  val: number | string,
  total: number | string,
  precision: number = 2,
): string {
  if (typeof val === 'string') {
    val = Number(val.replace(/[.,]/g, ''));
  }

  if (typeof total === 'string') {
    total = Number(total.replace(/[.,]/g, ''));
  }

  if (total === 0) return formatToPercent(0);

  const percentage = (val / total) * 100;

  return formatToPercent(percentage, precision);
}

/**
 * Formats a number as a percentage with specified precision.
 * Note: This uses a dynamic locale, different from formatPercentage which uses absolute values.
 * @param val - The number to format as percentage
 * @param precision - Number of decimal places (default: 2)
 * @returns A formatted percentage string
 */
export function formatToPercent(val: number, precision: number = 2): string {
  const formatedPercent = val.toLocaleString(i18n.global.locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return `${formatedPercent}%`;
}
