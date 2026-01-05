import { describe, it, expect } from 'vitest';

import {
  formatValue,
  formatPercentage,
  formatNumber,
  formatPercentageFixed,
  formatCurrency,
  getPercentageOf,
  formatToPercent,
} from '@/utils/numbers';

describe('Number Utilities', () => {
  describe('formatValue', () => {
    it('formats integers correctly with locale-specific thousand separators', () => {
      expect(formatValue(1000)).toBe('1,000');
      expect(formatValue(123456789, 'de-DE')).toBe('123.456.789');
    });

    it('formats decimals correctly with locale-specific formatting', () => {
      expect(formatValue(1234.56)).toBe('1,234.56');
      // Different environments may use different space characters for fr-FR locale
      const frResult = formatValue(1234.5678, 'fr-FR');
      expect(frResult).toMatch(/1\s?234,57/);
    });

    it('formats zero correctly', () => {
      expect(formatValue(0)).toBe('0');
    });
  });

  describe('formatNumber', () => {
    it('formats regular numbers correctly', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1234567, 'de-DE')).toBe('1.234.567');
    });

    it('handles zero correctly', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('handles null/undefined values', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });

    it('handles special values', () => {
      expect(formatNumber(Infinity)).toBe('∞');
      expect(formatNumber(-Infinity)).toBe('-∞');
      expect(formatNumber(NaN)).toBe('NaN');
    });

    it('handles negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
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

  describe('formatPercentageFixed', () => {
    it('formats percentages with fixed 2 decimal places', () => {
      expect(formatPercentageFixed(75.5)).toBe('75.50%');
      expect(formatPercentageFixed(33.333333)).toBe('33.33%');
    });

    it('handles zero percentage', () => {
      expect(formatPercentageFixed(0)).toBe('0.00%');
    });

    it('handles null/undefined values', () => {
      expect(formatPercentageFixed(null)).toBe('0.00%');
      expect(formatPercentageFixed(undefined)).toBe('0.00%');
    });

    it('uses custom locale when provided', () => {
      expect(formatPercentageFixed(75.5, 'pt-BR')).toBe('75,50%');
    });

    it('handles negative numbers', () => {
      expect(formatPercentageFixed(-25.5)).toBe('-25.50%');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency with USD symbol correctly', () => {
      expect(formatCurrency(1234.567, '$')).toBe('$ 1,234.57');
    });

    it('formats currency with EUR symbol correctly', () => {
      expect(formatCurrency(1234.567, '€')).toBe('€ 1,234.57');
    });

    it('handles zero values', () => {
      expect(formatCurrency(0, '$')).toBe('$ 0.00');
    });

    it('handles null/undefined values', () => {
      expect(formatCurrency(null, '$')).toBe('$ 0.00');
      expect(formatCurrency(undefined, '$')).toBe('$ 0.00');
    });

    it('uses custom locale when provided', () => {
      expect(formatCurrency(1234.567, '$', 'pt-BR')).toBe('$ 1.234,57');
    });

    it('handles large numbers', () => {
      expect(formatCurrency(1234567.89, '$')).toBe('$ 1,234,567.89');
    });

    it('handles small decimal numbers', () => {
      expect(formatCurrency(0.01, '$')).toBe('$ 0.01');
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-100.5, '$')).toBe('$ -100.50');
    });
  });

  describe('getPercentageOf', () => {
    it('calculates percentage correctly', () => {
      expect(getPercentageOf(25, 100)).toBe('25.00%');
      expect(getPercentageOf(33, 99)).toBe('33.33%');
    });

    it('handles string inputs', () => {
      expect(getPercentageOf('25', '100')).toBe('25.00%');
      expect(getPercentageOf('1,000', '2,000')).toBe('50.00%');
    });

    it('handles zero total', () => {
      expect(getPercentageOf(10, 0)).toBe('0.00%');
    });

    it('handles custom precision', () => {
      expect(getPercentageOf(33.333, 100, 1)).toBe('33.3%');
      expect(getPercentageOf(33.333, 100, 3)).toBe('33.333%');
    });

    it('handles mixed string and number inputs', () => {
      expect(getPercentageOf(25, '100')).toBe('25.00%');
      expect(getPercentageOf('25', 100)).toBe('25.00%');
    });
  });

  describe('formatToPercent', () => {
    it('formats percentage with default precision', () => {
      expect(formatToPercent(75.5)).toBe('75.50%');
      expect(formatToPercent(33.333)).toBe('33.33%');
    });

    it('formats percentage with custom precision', () => {
      expect(formatToPercent(75.5, 1)).toBe('75.5%');
      expect(formatToPercent(33.333, 3)).toBe('33.333%');
    });

    it('handles zero values', () => {
      expect(formatToPercent(0)).toBe('0.00%');
    });

    it('handles negative values', () => {
      expect(formatToPercent(-25.5)).toBe('-25.50%');
    });

    it('handles large numbers', () => {
      expect(formatToPercent(1234.567)).toBe('1,234.57%');
    });
  });
});
