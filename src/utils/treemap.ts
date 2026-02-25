import i18n from '@/utils/plugins/i18n';
import type { topicDistributionMetric } from '@/services/api/resources/conversational/topics';
import {
  colorTeal100,
  colorTeal300,
  colorPurple100,
  colorPurple300,
  colorBlue100,
  colorBlue300,
  colorGreen100,
  colorGreen300,
  colorOrange100,
  colorOrange300,
  colorRed100,
  colorRed300,
  colorGray100,
  colorGray200,
} from '@weni/unnnic-system/tokens/colors';

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
    colorTeal100,
    colorPurple100,
    colorBlue100,
    colorGreen100,
    colorOrange100,
  ],
  positionHover: [
    colorTeal300,
    colorPurple300,
    colorBlue300,
    colorGreen300,
    colorOrange300,
  ],
  special: {
    others: {
      normal: colorGray100,
      hover: colorGray200,
    },
    unclassified: {
      normal: colorRed100,
      hover: colorRed300,
    },
  },
  fallback: {
    normal: colorGray100,
    hover: colorGray200,
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
