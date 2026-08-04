import { describe, expect, it, vi } from 'vitest';

import { CURRENCY_CODES, getCurrencyOptions } from '@/utils/currency';

describe('currency utils', () => {
  describe('CURRENCY_CODES', () => {
    it('contains 18 currency codes in alphabetical order', () => {
      expect(CURRENCY_CODES).toHaveLength(18);
      expect([...CURRENCY_CODES]).toEqual([...CURRENCY_CODES].sort());
    });

    it('includes the previously supported currencies', () => {
      expect(CURRENCY_CODES).toEqual(
        expect.arrayContaining(['ARS', 'BRL', 'EUR', 'USD']),
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
