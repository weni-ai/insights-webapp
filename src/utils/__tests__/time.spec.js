import { describe, it, expect, vi } from 'vitest';
import {
  formatSecondsToHumanString,
  formatSecondsToTime,
  asyncTimeout,
  getLastNDays,
  getLastMonthRange,
  getYesterdayDate,
  findMatchingDate,
  formatTimeWithDayNight,
  formatTimeStringWithDayNight,
  formatDateAndTimeLocalized,
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

  describe('formatSecondsToTime', () => {
    describe('Edge Cases', () => {
      it('handles null and undefined values', () => {
        expect(formatSecondsToTime(null)).toBe('-');
        expect(formatSecondsToTime(undefined)).toBe('-');
      });

      it('handles zero value', () => {
        expect(formatSecondsToTime(0)).toBe('0s');
      });

      it('handles negative values by taking absolute value', () => {
        expect(formatSecondsToTime(-30)).toBe('30s');
        expect(formatSecondsToTime(-90)).toBe('1m 30s');
        expect(formatSecondsToTime(-3661)).toBe('1h 01m 01s');
      });

      it('handles decimal values by flooring them', () => {
        expect(formatSecondsToTime(30.7)).toBe('30s');
        expect(formatSecondsToTime(90.9)).toBe('1m 30s');
        expect(formatSecondsToTime(3661.5)).toBe('1h 01m 01s');
      });
    });

    describe('Seconds Only (< 60s)', () => {
      it('formats seconds without padding when less than 60', () => {
        expect(formatSecondsToTime(1)).toBe('1s');
        expect(formatSecondsToTime(5)).toBe('5s');
        expect(formatSecondsToTime(30)).toBe('30s');
        expect(formatSecondsToTime(59)).toBe('59s');
      });
    });

    describe('Minutes and Seconds (1m - 59m)', () => {
      it('formats minutes and seconds with padded seconds', () => {
        expect(formatSecondsToTime(60)).toBe('1m 00s');
        expect(formatSecondsToTime(61)).toBe('1m 01s');
        expect(formatSecondsToTime(90)).toBe('1m 30s');
        expect(formatSecondsToTime(125)).toBe('2m 05s');
        expect(formatSecondsToTime(3599)).toBe('59m 59s');
      });

      it('formats exact minute values', () => {
        expect(formatSecondsToTime(120)).toBe('2m 00s');
        expect(formatSecondsToTime(300)).toBe('5m 00s');
        expect(formatSecondsToTime(600)).toBe('10m 00s');
      });
    });

    describe('Hours, Minutes and Seconds (≥ 1h)', () => {
      it('formats hours with padded minutes and seconds', () => {
        expect(formatSecondsToTime(3600)).toBe('1h 00m 00s');
        expect(formatSecondsToTime(3661)).toBe('1h 01m 01s');
        expect(formatSecondsToTime(3730)).toBe('1h 02m 10s');
        expect(formatSecondsToTime(7200)).toBe('2h 00m 00s');
        expect(formatSecondsToTime(7265)).toBe('2h 01m 05s');
      });

      it('formats large hour values correctly', () => {
        expect(formatSecondsToTime(36000)).toBe('10h 00m 00s');
        expect(formatSecondsToTime(86400)).toBe('24h 00m 00s');
        expect(formatSecondsToTime(90061)).toBe('25h 01m 01s');
      });

      it('handles hours with zero minutes but non-zero seconds', () => {
        expect(formatSecondsToTime(3605)).toBe('1h 00m 05s');
        expect(formatSecondsToTime(7230)).toBe('2h 00m 30s');
      });

      it('handles hours with non-zero minutes but zero seconds', () => {
        expect(formatSecondsToTime(3660)).toBe('1h 01m 00s');
        expect(formatSecondsToTime(7320)).toBe('2h 02m 00s');
      });
    });

    describe('Real-world Time Metrics Scenarios', () => {
      it('formats typical waiting times (30s - 5min)', () => {
        expect(formatSecondsToTime(30)).toBe('30s');
        expect(formatSecondsToTime(90)).toBe('1m 30s');
        expect(formatSecondsToTime(180)).toBe('3m 00s');
        expect(formatSecondsToTime(300)).toBe('5m 00s');
      });

      it('formats typical first response times (10s - 2min)', () => {
        expect(formatSecondsToTime(10)).toBe('10s');
        expect(formatSecondsToTime(45)).toBe('45s');
        expect(formatSecondsToTime(75)).toBe('1m 15s');
        expect(formatSecondsToTime(120)).toBe('2m 00s');
      });

      it('formats typical chat duration times (3min - 30min)', () => {
        expect(formatSecondsToTime(180)).toBe('3m 00s');
        expect(formatSecondsToTime(600)).toBe('10m 00s');
        expect(formatSecondsToTime(900)).toBe('15m 00s');
        expect(formatSecondsToTime(1800)).toBe('30m 00s');
      });

      it('formats maximum expected chat durations (30min - 2h)', () => {
        expect(formatSecondsToTime(1800)).toBe('30m 00s');
        expect(formatSecondsToTime(3600)).toBe('1h 00m 00s');
        expect(formatSecondsToTime(5400)).toBe('1h 30m 00s');
        expect(formatSecondsToTime(7200)).toBe('2h 00m 00s');
      });
    });

    describe('Boundary Values', () => {
      it('handles boundary between seconds and minutes', () => {
        expect(formatSecondsToTime(59)).toBe('59s');
        expect(formatSecondsToTime(60)).toBe('1m 00s');
        expect(formatSecondsToTime(61)).toBe('1m 01s');
      });

      it('handles boundary between minutes and hours', () => {
        expect(formatSecondsToTime(3599)).toBe('59m 59s');
        expect(formatSecondsToTime(3600)).toBe('1h 00m 00s');
        expect(formatSecondsToTime(3601)).toBe('1h 00m 01s');
      });
    });

    describe('Padding Consistency', () => {
      it('ensures consistent zero-padding for minutes when hours are present', () => {
        expect(formatSecondsToTime(3605)).toBe('1h 00m 05s');
        expect(formatSecondsToTime(3665)).toBe('1h 01m 05s');
        expect(formatSecondsToTime(4205)).toBe('1h 10m 05s');
      });

      it('ensures consistent zero-padding for seconds when minutes/hours are present', () => {
        expect(formatSecondsToTime(65)).toBe('1m 05s');
        expect(formatSecondsToTime(3605)).toBe('1h 00m 05s');
        expect(formatSecondsToTime(605)).toBe('10m 05s');
      });

      it('does not pad single units', () => {
        expect(formatSecondsToTime(5)).toBe('5s');
        expect(formatSecondsToTime(65)).toBe('1m 05s');
        expect(formatSecondsToTime(605)).toBe('10m 05s');
      });
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

  describe('formatTimeWithDayNight', () => {
    it('correctly identifies morning time (AM)', () => {
      const morningDate = new Date();
      morningDate.setHours(9, 15, 0);

      const result = formatTimeWithDayNight(morningDate);

      expect(result.hour).toBe(9);
      expect(result.minute).toBe(15);
      expect(result.isDayTime).toBe(true);
      expect(result.period).toBe('AM');
    });

    it('correctly identifies evening time (PM)', () => {
      const eveningDate = new Date();
      eveningDate.setHours(20, 30, 0);

      const result = formatTimeWithDayNight(eveningDate);

      expect(result.hour).toBe(20);
      expect(result.minute).toBe(30);
      expect(result.isDayTime).toBe(false);
      expect(result.period).toBe('PM');
    });

    it('handles boundary cases correctly', () => {
      const dayStartDate = new Date();
      dayStartDate.setHours(6, 0, 0);

      const dayStartResult = formatTimeWithDayNight(dayStartDate);
      expect(dayStartResult.isDayTime).toBe(true);
      expect(dayStartResult.period).toBe('AM');

      const beforeDayDate = new Date();
      beforeDayDate.setHours(5, 59, 0);

      const beforeDayResult = formatTimeWithDayNight(beforeDayDate);
      expect(beforeDayResult.isDayTime).toBe(false);
      expect(beforeDayResult.period).toBe('PM');

      const beforeNightDate = new Date();
      beforeNightDate.setHours(17, 59, 0);

      const beforeNightResult = formatTimeWithDayNight(beforeNightDate);
      expect(beforeNightResult.isDayTime).toBe(true);
      expect(beforeNightResult.period).toBe('AM');

      const nightStartDate = new Date();
      nightStartDate.setHours(18, 0, 0);

      const nightStartResult = formatTimeWithDayNight(nightStartDate);
      expect(nightStartResult.isDayTime).toBe(false);
      expect(nightStartResult.period).toBe('PM');
    });
  });

  describe('formatTimeStringWithDayNight', () => {
    it('formats time string correctly with 12-hour format', () => {
      const morningDate = new Date();
      morningDate.setHours(9, 15, 0);

      const result = formatTimeStringWithDayNight(morningDate, false);

      expect(result).toContain('9:15');
      expect(result).toContain('AM');
    });

    it('formats time string correctly with 24-hour format', () => {
      const morningDate = new Date();
      morningDate.setHours(9, 15, 0);

      const result = formatTimeStringWithDayNight(morningDate, true);

      expect(result).toBe('09:15 AM');
    });

    it('formats PM time correctly', () => {
      const afternoonDate = new Date();
      afternoonDate.setHours(14, 30, 0);

      const result12h = formatTimeStringWithDayNight(afternoonDate, false);
      const result24h = formatTimeStringWithDayNight(afternoonDate, true);

      expect(result12h).toContain('2:30');
      expect(result12h).toContain('PM');
      expect(result24h).toBe('14:30 AM');
    });

    it('handles midnight and noon correctly', () => {
      const midnightDate = new Date();
      midnightDate.setHours(0, 0, 0);

      const midnightResult = formatTimeStringWithDayNight(midnightDate, true);
      expect(midnightResult).toBe('00:00 PM');

      const noonDate = new Date();
      noonDate.setHours(12, 0, 0);

      const noonResult = formatTimeStringWithDayNight(noonDate, true);
      expect(noonResult).toBe('12:00 AM');
    });
  });

  describe('formatDateAndTimeLocalized', () => {
    it('formats date and time with default locale (en)', () => {
      const testDate = new Date(2025, 8, 15, 14, 30, 0); // September 15, 2025, 14:30
      const result = formatDateAndTimeLocalized(testDate);

      expect(result.time).toBe('14:30');
      expect(result.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('formats date and time with English locale using P token', () => {
      const testDate = new Date(2025, 8, 15, 14, 30, 0); // September 15, 2025, 14:30
      const result = formatDateAndTimeLocalized(testDate, 'en');

      expect(result.time).toBe('14:30');
      expect(result.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(typeof result.date).toBe('string');
      expect(result.date.length).toBeGreaterThan(0);
    });

    it('formats date and time with Portuguese locale using P token', () => {
      const testDate = new Date(2025, 8, 15, 14, 30, 0); // September 15, 2025, 14:30
      const result = formatDateAndTimeLocalized(testDate, 'pt-br');

      expect(result.time).toBe('14:30');
      expect(result.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(typeof result.date).toBe('string');
      expect(result.date.length).toBeGreaterThan(0);
    });

    it('formats date and time with Spanish locale using P token', () => {
      const testDate = new Date(2025, 8, 15, 14, 30, 0); // September 15, 2025, 14:30
      const result = formatDateAndTimeLocalized(testDate, 'es');

      expect(result.time).toBe('14:30');
      expect(result.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(typeof result.date).toBe('string');
      expect(result.date.length).toBeGreaterThan(0);
    });

    it('handles different times correctly with localization', () => {
      const morningDate = new Date(2025, 0, 1, 9, 5, 0); // January 1, 2025, 09:05
      const morningResult = formatDateAndTimeLocalized(morningDate, 'en');

      expect(morningResult.time).toBe('09:05');
      expect(morningResult.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);

      const eveningDate = new Date(2025, 11, 31, 23, 59, 0); // December 31, 2025, 23:59
      const eveningResult = formatDateAndTimeLocalized(eveningDate, 'pt-br');

      expect(eveningResult.time).toBe('23:59');
      expect(eveningResult.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('falls back to en locale for unknown locale', () => {
      const testDate = new Date(2025, 8, 15, 14, 30, 0); // September 15, 2025, 14:30
      const result = formatDateAndTimeLocalized(testDate, 'unknown-locale');

      expect(result.time).toBe('14:30');
      expect(result.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(typeof result.date).toBe('string');
      expect(result.date.length).toBeGreaterThan(0);
    });

    it('ensures time format is consistent across locales', () => {
      const testDate = new Date(2025, 8, 15, 5, 7, 0); // September 15, 2025, 05:07

      const enResult = formatDateAndTimeLocalized(testDate, 'en');
      const ptResult = formatDateAndTimeLocalized(testDate, 'pt-br');
      const esResult = formatDateAndTimeLocalized(testDate, 'es');

      expect(enResult.time).toBe('05:07');
      expect(ptResult.time).toBe('05:07');
      expect(esResult.time).toBe('05:07');

      expect(enResult.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(ptResult.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(esResult.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('handles edge case dates correctly', () => {
      const leapYearDate = new Date(2024, 1, 29, 12, 0, 0); // February 29, 2024 (leap year)
      const result = formatDateAndTimeLocalized(leapYearDate, 'pt-br');

      expect(result.time).toBe('12:00');
      expect(result.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);

      const newYearDate = new Date(2025, 0, 1, 0, 0, 0); // January 1, 2025, 00:00
      const newYearResult = formatDateAndTimeLocalized(newYearDate, 'es');

      expect(newYearResult.time).toBe('00:00');
      expect(newYearResult.date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });
});
