import { describe, expect, it, vi } from 'vitest';

import { CURRENCY_CODES, getCurrencyOptions } from '@/utils/currency';

describe('currency utils', () => {
  describe('CURRENCY_CODES', () => {
    it('contains 30 currency codes in alphabetical order', () => {
      expect(CURRENCY_CODES).toHaveLength(30);
      expect([...CURRENCY_CODES]).toEqual([...CURRENCY_CODES].sort());
    });

    it('includes the previously supported currencies', () => {
      expect(CURRENCY_CODES).toEqual(
        expect.arrayContaining(['ARS', 'BRL', 'EUR', 'USD']),
      );
    });

    it('includes major Asian currencies', () => {
      expect(CURRENCY_CODES).toEqual(
        expect.arrayContaining([
          'CNY',
          'HKD',
          'IDR',
          'INR',
          'JPY',
          'KRW',
          'MYR',
          'PHP',
          'SGD',
          'THB',
          'TWD',
          'VND',
        ]),
      );
    });
  });

  describe('getCurrencyOptions', () => {
    it('maps each currency code to a translated option', () => {
      const t = vi.fn((key) => key);

      const options = getCurrencyOptions(t);

      expect(options).toHaveLength(CURRENCY_CODES.length);
      expect(options).toEqual(
        CURRENCY_CODES.map((code) => ({
          label: `currency_options.${code}`,
          value: code,
        })),
      );
      expect(t).toHaveBeenCalledTimes(CURRENCY_CODES.length);
    });
  });
});
