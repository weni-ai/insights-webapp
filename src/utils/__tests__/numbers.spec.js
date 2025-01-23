import { describe, it, expect, vi } from 'vitest';

import { formatValue, formatPercentage } from '@/utils/numbers';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, options) => `Translated: ${key} ${JSON.stringify(options)}`,
  }),
}));

describe('Number Utilities', () => {
  describe('formatValue', () => {
    it('formats integers correctly with locale-specific thousand separators', () => {
      expect(formatValue(1000)).toBe('1,000');
      expect(formatValue(123456789, 'de-DE')).toBe('123.456.789');
    });

    it('formats decimals correctly with locale-specific formatting', () => {
      expect(formatValue(1234.56)).toBe('1,234.56');
      expect(formatValue(1234.5678, 'fr-FR')).toBe('1 234,57');
    });

    it('formats zero correctly', () => {
      expect(formatValue(0)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('formats positive numbers as percentages', () => {
      expect(formatPercentage(12.345)).toBe('12.35%');
      expect(formatPercentage(0.1)).toBe('0.1%');
    });

    it('formats negative numbers as positive percentages', () => {
      expect(formatPercentage(-5.678)).toBe('5.68%');
      expect(formatPercentage(-0.1)).toBe('0.1%');
    });

    it('formats zero correctly', () => {
      expect(formatPercentage(0)).toBe('0%');
    });
  });
});
