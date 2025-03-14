import i18n from './plugins/i18n';

export function getPercentageOf(
  val: number,
  total: number,
  precision: number = 2,
) {
  if (total === 0) return 0;
  const percentage = (val / total) * 100;
  return percentage.toLocaleString(i18n.global.locale, {
    maximumFractionDigits: precision,
  });
}

export function formatToPercent(val: number, precision: number = 2) {
  const formatedPercent = val.toLocaleString(i18n.global.locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return `${formatedPercent}%`;
}
