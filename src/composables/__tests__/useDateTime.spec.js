import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDateTime } from '@/composables/useDateTime';
import { formatDateAndTimeLocalized } from '@/utils/time';

const mockI18n = {
  locale: { value: 'en' },
};

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}));

vi.mock('@/utils/time', () => ({
  formatDateAndTimeLocalized: vi.fn(),
}));

const mockFormatDateAndTimeLocalized = formatDateAndTimeLocalized;

describe('useDateTime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockI18n.locale.value = 'en';
  });

  describe('formatDateAndTimeWithLocale', () => {
    it('calls formatDateAndTimeLocalized with correct parameters for English locale', () => {
      mockI18n.locale.value = 'en';
      mockFormatDateAndTimeLocalized.mockReturnValue({
        time: '14:30',
        date: '09/15/2025',
      });

      const { formatDateAndTimeWithLocale } = useDateTime();
      const testDate = new Date(2025, 8, 15, 14, 30, 0);

      const result = formatDateAndTimeWithLocale(testDate);

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledWith(
        testDate,
        'en',
      );
      expect(result).toEqual({
        time: '14:30',
        date: '09/15/2025',
      });
    });

    it('calls formatDateAndTimeLocalized with correct parameters for Portuguese locale', () => {
      mockI18n.locale.value = 'pt-br';
      mockFormatDateAndTimeLocalized.mockReturnValue({
        time: '14:30',
        date: '15/09/2025',
      });

      const { formatDateAndTimeWithLocale } = useDateTime();
      const testDate = new Date(2025, 8, 15, 14, 30, 0);

      const result = formatDateAndTimeWithLocale(testDate);

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledWith(
        testDate,
        'pt-br',
      );
      expect(result).toEqual({
        time: '14:30',
        date: '15/09/2025',
      });
    });

    it('calls formatDateAndTimeLocalized with correct parameters for Spanish locale', () => {
      mockI18n.locale.value = 'es';
      mockFormatDateAndTimeLocalized.mockReturnValue({
        time: '14:30',
        date: '15/09/2025',
      });

      const { formatDateAndTimeWithLocale } = useDateTime();
      const testDate = new Date(2025, 8, 15, 14, 30, 0);

      const result = formatDateAndTimeWithLocale(testDate);

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledWith(
        testDate,
        'es',
      );
      expect(result).toEqual({
        time: '14:30',
        date: '15/09/2025',
      });
    });

    it('handles different date inputs correctly', () => {
      mockI18n.locale.value = 'en';
      mockFormatDateAndTimeLocalized.mockReturnValue({
        time: '09:05',
        date: '01/01/2025',
      });

      const { formatDateAndTimeWithLocale } = useDateTime();
      const morningDate = new Date(2025, 0, 1, 9, 5, 0);

      formatDateAndTimeWithLocale(morningDate);

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledWith(
        morningDate,
        'en',
      );
    });

    it('handles midnight correctly', () => {
      mockI18n.locale.value = 'pt-br';
      mockFormatDateAndTimeLocalized.mockReturnValue({
        time: '00:00',
        date: '01/01/2025',
      });

      const { formatDateAndTimeWithLocale } = useDateTime();
      const midnightDate = new Date(2025, 0, 1, 0, 0, 0);

      const result = formatDateAndTimeWithLocale(midnightDate);

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledWith(
        midnightDate,
        'pt-br',
      );
      expect(result.time).toBe('00:00');
    });

    it('handles late night time correctly', () => {
      mockI18n.locale.value = 'es';
      mockFormatDateAndTimeLocalized.mockReturnValue({
        time: '23:59',
        date: '31/12/2025',
      });

      const { formatDateAndTimeWithLocale } = useDateTime();
      const lateNightDate = new Date(2025, 11, 31, 23, 59, 0);

      const result = formatDateAndTimeWithLocale(lateNightDate);

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledWith(
        lateNightDate,
        'es',
      );
      expect(result.time).toBe('23:59');
    });

    it('works with leap year dates', () => {
      mockI18n.locale.value = 'pt-br';
      mockFormatDateAndTimeLocalized.mockReturnValue({
        time: '12:00',
        date: '29/02/2024',
      });

      const { formatDateAndTimeWithLocale } = useDateTime();
      const leapYearDate = new Date(2024, 1, 29, 12, 0, 0);

      formatDateAndTimeWithLocale(leapYearDate);

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledWith(
        leapYearDate,
        'pt-br',
      );
    });

    it('returns the exact result from formatDateAndTimeLocalized', () => {
      const expectedResult = {
        time: '15:45',
        date: '22/03/2025',
      };

      mockI18n.locale.value = 'pt-br';
      mockFormatDateAndTimeLocalized.mockReturnValue(expectedResult);

      const { formatDateAndTimeWithLocale } = useDateTime();
      const testDate = new Date(2025, 2, 22, 15, 45, 0);

      const result = formatDateAndTimeWithLocale(testDate);

      expect(result).toBe(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('calls formatDateAndTimeLocalized only once per invocation', () => {
      mockI18n.locale.value = 'en';
      mockFormatDateAndTimeLocalized.mockReturnValue({
        time: '10:30',
        date: '05/05/2025',
      });

      const { formatDateAndTimeWithLocale } = useDateTime();
      const testDate = new Date(2025, 4, 5, 10, 30, 0);

      formatDateAndTimeWithLocale(testDate);

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledTimes(1);
    });

    it('uses current locale value from i18n', () => {
      const { formatDateAndTimeWithLocale } = useDateTime();
      const testDate = new Date(2025, 0, 1, 12, 0, 0);

      mockI18n.locale.value = 'en';
      formatDateAndTimeWithLocale(testDate);
      expect(mockFormatDateAndTimeLocalized).toHaveBeenLastCalledWith(
        testDate,
        'en',
      );

      mockI18n.locale.value = 'pt-br';
      formatDateAndTimeWithLocale(testDate);
      expect(mockFormatDateAndTimeLocalized).toHaveBeenLastCalledWith(
        testDate,
        'pt-br',
      );

      mockI18n.locale.value = 'es';
      formatDateAndTimeWithLocale(testDate);
      expect(mockFormatDateAndTimeLocalized).toHaveBeenLastCalledWith(
        testDate,
        'es',
      );

      expect(mockFormatDateAndTimeLocalized).toHaveBeenCalledTimes(3);
    });
  });

  describe('composable structure', () => {
    it('returns an object with formatDateAndTimeWithLocale function', () => {
      const result = useDateTime();

      expect(result).toHaveProperty('formatDateAndTimeWithLocale');
      expect(typeof result.formatDateAndTimeWithLocale).toBe('function');
    });

    it('returns the same function reference on multiple calls', () => {
      const result1 = useDateTime();
      const result2 = useDateTime();

      expect(typeof result1.formatDateAndTimeWithLocale).toBe('function');
      expect(typeof result2.formatDateAndTimeWithLocale).toBe('function');
    });
  });
});
