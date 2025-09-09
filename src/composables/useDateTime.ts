import { useI18n } from 'vue-i18n';

import { formatDateAndTimeLocalized } from '@/utils/time';

/**
 * Composable for date and time formatting
 * Provides utilities to format date and time based on the current locale
 */
export function useDateTime() {
  const { locale } = useI18n();

  const formatDateAndTimeWithLocale = (date: Date) => {
    return formatDateAndTimeLocalized(date, locale.value);
  };

  return {
    formatDateAndTimeWithLocale,
  };
}
