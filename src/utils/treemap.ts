import i18n from '@/utils/plugins/i18n';
import type { topicDistributionMetric } from '@/services/api/resources/conversational/topics';
import {
  colorTeal2,
  colorTeal3,
  colorPurple2,
  colorPurple4,
  colorBlue2,
  colorBlue5,
  colorGreen1,
  colorGreen4,
  colorOrange2,
  colorOrange4,
  colorRed2,
  colorRed4,
  colorGray2,
  colorGray4,
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
  position: [colorTeal2, colorPurple2, colorBlue2, colorGreen1, colorOrange2],
  positionHover: [
    colorTeal3,
    colorPurple4,
    colorBlue5,
    colorGreen4,
    colorOrange4,
  ],
  special: {
    others: {
      normal: colorGray2,
      hover: colorGray4,
    },
    unclassified: {
      normal: colorRed2,
      hover: colorRed4,
    },
  },
  fallback: {
    normal: colorGray2,
    hover: colorGray4,
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
