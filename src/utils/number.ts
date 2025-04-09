import i18n from './plugins/i18n';

export function getPercentageOf(
  val: number | string,
  total: number | string,
  precision: number = 2,
) {
  if (total === 0) return 0;

  if (typeof val === 'string') {
    val = Number(val.replace(/[.,]/g, ''));
  }

  if (typeof total === 'string') {
    total = Number(total.replace(/[.,]/g, ''));
  }

  const percentage = (val / total) * 100;

  return formatToPercent(percentage, precision);
}

export function formatToPercent(val: number, precision: number = 2) {
  const formatedPercent = val.toLocaleString(i18n.global.locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return `${formatedPercent}%`;
}
