import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useI18n } from 'vue-i18n';

/**
 * Formats a number of seconds into a human-readable time string.
 * @param seconds - The number of seconds to format.
 * @returns A readable time string formatted as '1h 10m 30s'.
 */
export function formatSecondsToHumanString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = '';

  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `;
  }
  if (remainingSeconds > 0 || formattedTime === '') {
    formattedTime += `${remainingSeconds}s`;
  }

  return formattedTime.trim();
}

/**
 * Creates a Promise that resolves after a specified time.
 * @param ms - The number of milliseconds to wait before resolving.
 * @returns A Promise that resolves after the specified time.
 */
export function asyncTimeout(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

interface DateRange {
  start: string;
  end: string;
  dmFormat: string;
}

/**
 * Gets the date range for the last N days.
 * @param days - The number of days to look back.
 * @returns An object containing the start and end dates in 'yyyy-MM-dd' format,
 *          and a formatted string representation of the date range.
 */
export function getLastNDays(days: number): DateRange {
  const startDate = subDays(new Date(), days - 1);
  const endDate = new Date();

  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  const startDM = format(startDate, 'dd/MM');
  const endDM = format(endDate, 'dd/MM');

  return {
    start,
    end,
    dmFormat: `${startDM} - ${endDM}`,
  };
}

/**
 * Gets the date range for the previous month.
 * @returns An object containing the start and end dates of the previous month in 'yyyy-MM-dd' format,
 *          and a formatted string representation of the date range.
 */
export function getLastMonthRange(): DateRange {
  const startDate = startOfMonth(subMonths(new Date(), 1));
  const endDate = endOfMonth(subMonths(new Date(), 1));

  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  const startDM = format(startDate, 'dd/MM');
  const endDM = format(endDate, 'dd/MM');

  return {
    start,
    end,
    dmFormat: `${startDM} - ${endDM}`,
  };
}

/**
 * Gets the date for yesterday.
 * @returns An object containing yesterday's date in 'yyyy-MM-dd' format,
 *          and a formatted string representation of the date.
 */
export function getYesterdayDate(): DateRange {
  const yesterday = subDays(new Date(), 1);

  const yesterdayISO = format(yesterday, 'yyyy-MM-dd');
  const yesterdayDM = format(yesterday, 'dd/MM');

  return {
    start: yesterdayISO,
    end: yesterdayISO,
    dmFormat: `${yesterdayDM}`,
  };
}

interface RangeTranslation {
  range: DateRange;
  translation: string;
}

interface MatchResult {
  label: string;
  value: {
    start: string;
    end: string;
  };
}

/**
 * Finds a matching predefined date range for the given model value.
 * @param modelValue - The current date range to match against.
 * @param t - The i18n translation function.
 * @returns A MatchResult object if a match is found, or null if no match is found.
 */
export function findMatchingDate(
  modelValue: { start: string; end: string },
  t: ReturnType<typeof useI18n>,
): MatchResult | null {
  const rangeTranslations: RangeTranslation[] = [
    {
      range: getYesterdayDate(),
      translation: t('select_date.yesterday', {
        date: getYesterdayDate().dmFormat,
      }),
    },
    {
      range: getLastNDays(7),
      translation: t('select_date.last_days', {
        value: 7,
        date: getLastNDays(7).dmFormat,
      }),
    },
    {
      range: getLastNDays(14),
      translation: t('select_date.last_days', {
        value: 14,
        date: getLastNDays(14).dmFormat,
      }),
    },
    {
      range: getLastNDays(30),
      translation: t('select_date.last_days', {
        value: 30,
        date: getLastNDays(30).dmFormat,
      }),
    },
    {
      range: getLastNDays(90),
      translation: t('select_date.last_days', {
        value: 90,
        date: getLastNDays(90).dmFormat,
      }),
    },
    {
      range: getLastMonthRange(),
      translation: t('select_date.previous_month', {
        date: getLastMonthRange().dmFormat,
      }),
    },
  ];

  const date =
    rangeTranslations.find(
      ({ range }) =>
        modelValue.start === range.start && modelValue.end === range.end,
    ) ?? null;

  if (date)
    return {
      label: date.translation,
      value: {
        start: date.range.start,
        end: date.range.end,
      },
    };

  return null;
}