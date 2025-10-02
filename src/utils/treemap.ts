import i18n from '@/utils/plugins/i18n';
import type { topicDistributionMetric } from '@/services/api/resources/conversational/topics';

/**
 * Sorts, limits to 5 items, and groups the rest under "Others".
 * @param data Original array
 * @returns New array ready to use
 */
export function prepareTopData(
  data: topicDistributionMetric[],
): topicDistributionMetric[] {
  const sorted = [...data].sort((a, b) => b.value - a.value);

  if (sorted.length <= 5) {
    return sorted;
  }

  const topFive = sorted.slice(0, 5);
  const rest = sorted.slice(5);

  const othersValue = rest.reduce((sum, item) => sum + item.value, 0);
  const othersPercentage = rest.reduce(
    (sum, item) => sum + (item.percentage ?? 0),
    0,
  );

  topFive.push({
    label: i18n.global.t('conversations_dashboard.others'),
    value: othersValue,
    percentage: othersPercentage,
    uuid: '',
  });
  return topFive;
}

interface DataWithColor extends topicDistributionMetric {
  color: string;
  hoverColor: string;
}

const COLOR_PALETTE = {
  position: [
    '#C6FFF7', // color-weni-100
    '#E9D8FD', // color-aux-purple-100
    '#BEE3F8', // color-aux-blue-100
    '#C6F6D5', // color-aux-green-100
    '#FEEBC8', // color-aux-orange-100
  ],
  positionHover: [
    '#4DFBEA', // color-weni-300
    '#B794F4', // color-aux-purple-300
    '#63B3ED', // color-aux-blue-300
    '#68D391', // color-aux-green-300
    '#F6AD55', // color-aux-orange-300
  ],
  special: {
    others: {
      normal: '#E2E6ED', // color-neutral-soft
      hover: '#D0D3D9', // color-neutral-cleanest
    },
    unclassified: {
      normal: '#FED7D7', // color-aux-red-100
      hover: '#FC8181', // color-aux-red-300
    },
  },
  fallback: {
    normal: '#E2E6ED', // color-neutral-soft
    hover: '#D0D3D9', // color-neutral-cleanest
  },
};

/**
 * Determines if a label is a special case (others or unclassified)
 */
function isSpecialLabel(label: string): 'others' | 'unclassified' | null {
  if (label.toLowerCase() === 'other') {
    return 'others';
  }
  if (
    label.toLowerCase() ===
    i18n.global.t('conversations_dashboard.unclassified')
  ) {
    return 'unclassified';
  }
  return null;
}

/**
 * Gets colors for an item based on its label and position
 */
function getItemColors(
  label: string,
  index: number,
): { color: string; hoverColor: string } {
  const specialType = isSpecialLabel(label);

  if (specialType) {
    const specialColors = COLOR_PALETTE.special[specialType];
    return {
      color: specialColors.normal,
      hoverColor: specialColors.hover,
    };
  }

  return {
    color: COLOR_PALETTE.position[index] ?? COLOR_PALETTE.fallback.normal,
    hoverColor:
      COLOR_PALETTE.positionHover[index] ?? COLOR_PALETTE.fallback.hover,
  };
}

/**
 * Applies color based on label position or rules
 * @param data Sorted array
 * @returns New array with color field
 */
export function addColors(data: topicDistributionMetric[]): DataWithColor[] {
  return data.map((item, index) => ({
    ...item,
    label:
      item?.label?.toLowerCase() === 'other'
        ? i18n.global.t('conversations_dashboard.others')
        : item.label,
    ...getItemColors(item.label, index),
  }));
}
