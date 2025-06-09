import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { formatSecondsToHumanString } from '@/utils/time';
import { currencySymbols } from '@/utils/currency';
import {
  formatCurrency,
  formatPercentageFixed,
  formatNumber,
} from '@/utils/numbers';

/**
 * Composable for widget data formatting
 * Provides utilities to format widget data based on configuration
 */
export function useWidgetFormatting() {
  const { t, locale } = useI18n();
  const dashboardsStore = useDashboards();
  const { currentDashboard } = storeToRefs(dashboardsStore);

  /**
   * Format currency value with proper symbol and locale
   * @param {number} value - The currency value
   * @param {string} localeValue - The locale string
   * @returns {string} - Formatted currency string
   */
  const formatCurrencyValue = (
    value,
    localeValue = locale.value || 'en-US',
  ) => {
    const symbol =
      currencySymbols[currentDashboard.value?.config?.currency_type];
    return formatCurrency(value, symbol, localeValue);
  };

  /**
   * Format percentage value with fixed 2 decimal places
   * @param {number} value - The percentage value
   * @param {string} localeValue - The locale string
   * @returns {string} - Formatted percentage string
   */
  const formatPercentageValue = (
    value,
    localeValue = locale.value || 'en-US',
  ) => {
    return formatPercentageFixed(value, localeValue);
  };

  /**
   * Format number value with locale
   * @param {number} value - The number value
   * @param {string} localeValue - The locale string
   * @returns {string} - Formatted number string
   */
  const formatNumberValue = (value, localeValue = locale.value || 'en-US') => {
    return formatNumber(value, localeValue);
  };

  /**
   * Get formatted widget data based on configuration
   * @param {Object} widget - The widget object
   * @returns {string} - Formatted data string
   */
  const getWidgetFormattedData = (widget) => {
    const { config, data } = widget;

    if (
      config?.operation === 'recurrence' ||
      config?.data_suffix === '%' ||
      config?.operation === 'percentage'
    ) {
      return formatPercentageValue(data?.value);
    }

    if (config?.data_type === 'sec') {
      return formatSecondsToHumanString(Math.round(data?.value));
    }

    if (config?.currency) {
      return formatCurrencyValue(data?.value);
    }

    return formatNumberValue(data?.value);
  };

  /**
   * Get hover tooltip data for specific dashboard contexts
   * @param {Object} widget - The widget object
   * @returns {string} - Tooltip text or empty string
   */
  const getHoverTooltipData = (widget) => {
    const isHumanServiceDashboard =
      currentDashboard.value?.name === 'human_service_dashboard.title';

    if (isHumanServiceDashboard && widget.type === 'card') {
      const defaultTranslations = (key) => `human_service_dashboard.${key}`;

      const getTooltipTranslations = {
        in_progress: t('human_service_dashboard.tooltips.in_progress'),
        [defaultTranslations('response_time')]: t(
          'human_service_dashboard.tooltips.response_time',
        ),
        [defaultTranslations('interaction_time')]: t(
          'human_service_dashboard.tooltips.interaction_time',
        ),
        [defaultTranslations('waiting_time')]: t(
          'human_service_dashboard.tooltips.waiting_time',
        ),
        [defaultTranslations('awaiting_service')]: t(
          'human_service_dashboard.tooltips.awaiting_service',
        ),
        closeds: t('human_service_dashboard.tooltips.closeds'),
      };

      return getTooltipTranslations[widget.name] || '';
    }

    return '';
  };

  /**
   * Format VTEX data with proper currency formatting
   * @param {Object} vtexData - The VTEX data object
   * @returns {Object} - Formatted VTEX data object
   */
  const formatVtexData = (vtexData) => {
    const { total_value, average_ticket, orders } = vtexData;
    const existOrders = orders !== '';
    const existTotalValue = total_value !== '';
    const existAverageTicketValue = average_ticket !== '';

    const numbersNormalization = (value) => formatCurrencyValue(value);

    return {
      ...vtexData,
      orders: existOrders ? formatNumberValue(orders) : orders,
      total_value: existTotalValue
        ? numbersNormalization(total_value)
        : total_value,
      average_ticket: existAverageTicketValue
        ? numbersNormalization(average_ticket)
        : average_ticket,
    };
  };

  return {
    formatCurrency: formatCurrencyValue,
    formatPercentage: formatPercentageValue,
    formatNumber: formatNumberValue,
    getWidgetFormattedData,
    getHoverTooltipData,
    formatVtexData,
  };
}
