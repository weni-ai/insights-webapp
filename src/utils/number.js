import i18n from './plugins/i18n';

export function getPercentageOf(val, total, precision = 2) {
  const percentage = (val / total) * 100;
  return percentage.toLocaleString(i18n.global.locale, {
    maximumFractionDigits: precision,
  });
}
