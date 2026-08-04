export const CURRENCY_CODES = [
  'ARS',
  'BRL',
  'CAD',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'IDR',
  'INR',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'PEN',
  'PHP',
  'PLN',
  'RON',
  'SEK',
  'SGD',
  'THB',
  'TWD',
  'USD',
  'UYU',
  'VND',
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type CurrencyOption = {
  label: string;
  value: CurrencyCode;
};

type TranslateFn = (key: string) => string;

export function getCurrencyOptions(t: TranslateFn): CurrencyOption[] {
  return CURRENCY_CODES.map((code) => ({
    label: t(`currency_options.${code}`),
    value: code,
  }));
}
