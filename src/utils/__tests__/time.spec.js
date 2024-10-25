import { describe, it, expect, vi } from 'vitest';
import {
  formatSecondsToHumanString,
  asyncTimeout,
  getLastNDays,
  getLastMonthRange,
  getYesterdayDate,
  findMatchingDate,
} from '@/utils/time';

import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key, options) => `Translated: ${key} ${JSON.stringify(options)}`,
  }),
}));

describe('Date Utilities', () => {
  describe('formatSecondsToHumanString', () => {
    it('formats seconds correctly', () => {
      expect(formatSecondsToHumanString(3661)).toBe('1h 1m 1s');
      expect(formatSecondsToHumanString(3600)).toBe('1h');
      expect(formatSecondsToHumanString(60)).toBe('1m');
      expect(formatSecondsToHumanString(1)).toBe('1s');
      expect(formatSecondsToHumanString(0)).toBe('0s');
    });
  });

  describe('asyncTimeout', () => {
    it('resolves after specified time', async () => {
      const start = Date.now();
      await asyncTimeout(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(95);
    });
  });

  describe('getLastNDays', () => {
    it('returns correct date range for last N days', () => {
      const result = getLastNDays(7);
      const expectedEnd = format(new Date(), 'yyyy-MM-dd');
      const expectedStart = format(subDays(new Date(), 6), 'yyyy-MM-dd');
      expect(result.start).toBe(expectedStart);
      expect(result.end).toBe(expectedEnd);
      expect(result.dmFormat).toMatch(/\d{2}\/\d{2} - \d{2}\/\d{2}/);
    });
  });

  describe('getLastMonthRange', () => {
    it('returns correct date range for last month', () => {
      const result = getLastMonthRange();
      const lastMonth = subMonths(new Date(), 1);
      const expectedStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
      const expectedEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
      expect(result.start).toBe(expectedStart);
      expect(result.end).toBe(expectedEnd);
      expect(result.dmFormat).toMatch(/\d{2}\/\d{2} - \d{2}\/\d{2}/);
    });
  });

  describe('getYesterdayDate', () => {
    it('returns correct date for yesterday', () => {
      const result = getYesterdayDate();
      const yesterday = subDays(new Date(), 1);
      const expected = format(yesterday, 'yyyy-MM-dd');
      expect(result.start).toBe(expected);
      expect(result.end).toBe(expected);
      expect(result.dmFormat).toMatch(/\d{2}\/\d{2}/);
    });
  });

  describe('findMatchingDate', () => {
    const mockT = (key, options) =>
      `Translated: ${key} ${JSON.stringify(options)}`;

    it('finds matching date for yesterday', () => {
      const yesterday = getYesterdayDate();
      const result = findMatchingDate(
        { start: yesterday.start, end: yesterday.end },
        mockT,
      );
      expect(result).not.toBeNull();
      expect(result.label).toContain('select_date.yesterday');
      expect(result.value).toEqual({
        start: yesterday.start,
        end: yesterday.end,
      });
    });

    it('finds matching date for last 7 days', () => {
      const last7Days = getLastNDays(7);
      const result = findMatchingDate(
        { start: last7Days.start, end: last7Days.end },
        mockT,
      );
      expect(result).not.toBeNull();
      expect(result.label).toContain('select_date.last_days');
      expect(result.value).toEqual({
        start: last7Days.start,
        end: last7Days.end,
      });
    });

    it('finds matching date for last month', () => {
      const lastMonth = getLastMonthRange();
      const result = findMatchingDate(
        { start: lastMonth.start, end: lastMonth.end },
        mockT,
      );
      expect(result).not.toBeNull();
      expect(result.label).toContain('select_date.previous_month');
      expect(result.value).toEqual({
        start: lastMonth.start,
        end: lastMonth.end,
      });
    });

    it('returns null for non-matching date range', () => {
      const result = findMatchingDate(
        { start: '2023-01-01', end: '2023-01-31' },
        mockT,
      );
      expect(result).toBeNull();
    });
  });
});
