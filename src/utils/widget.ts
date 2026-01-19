import { formatPercentage, formatNumber } from './numbers';
import i18n from './plugins/i18n';

/**
 * Get the tooltip for a widget crosstab
 * @param events - The events object
 * @returns The tooltip string
 */
export const getWidgetCrosstabTooltip = (
  events: Record<string, { value: number; full_value: number }>,
) => {
  const eventsKeys = Object.keys(events);
  if (!eventsKeys.length) return '';
  return eventsKeys
    .map((key) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      const percentage = formatPercentage(
        events[key].value,
        i18n.global.locale,
      );
      const total = formatNumber(events[key].full_value, i18n.global.locale);
      return `${capitalizedKey}: ${percentage} (${total})`;
    })
    .join('<br>');
};
