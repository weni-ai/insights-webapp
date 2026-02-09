import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prepareTopData, addColors } from '@/utils/treemap';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => {
        if (key === 'conversations_dashboard.others') return 'Others';
        if (key === 'conversations_dashboard.unclassified')
          return 'unclassified';
        return key;
      }),
    },
  },
}));

describe('Treemap Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('prepareTopData', () => {
    it('should return the same array when length is 5 or less', () => {
      const data = [
        { label: 'A', value: 100, percentage: 40 },
        { label: 'B', value: 80, percentage: 32 },
        { label: 'C', value: 70, percentage: 28 },
      ];

      const result = prepareTopData(data);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { label: 'A', value: 100, percentage: 40 },
        { label: 'B', value: 80, percentage: 32 },
        { label: 'C', value: 70, percentage: 28 },
      ]);
    });

    it('should sort data by value in descending order', () => {
      const data = [
        { label: 'C', value: 70, percentage: 28 },
        { label: 'A', value: 100, percentage: 40 },
        { label: 'B', value: 80, percentage: 32 },
      ];

      const result = prepareTopData(data);

      expect(result[0]).toEqual({ label: 'A', value: 100, percentage: 40 });
      expect(result[1]).toEqual({ label: 'B', value: 80, percentage: 32 });
      expect(result[2]).toEqual({ label: 'C', value: 70, percentage: 28 });
    });

    it('should return exactly 5 items when input has exactly 5 items', () => {
      const data = [
        { label: 'A', value: 100, percentage: 20 },
        { label: 'B', value: 90, percentage: 18 },
        { label: 'C', value: 80, percentage: 16 },
        { label: 'D', value: 70, percentage: 14 },
        { label: 'E', value: 60, percentage: 12 },
      ];

      const result = prepareTopData(data);

      expect(result).toHaveLength(5);
      expect(result).toEqual(data);
    });

    it('should group items beyond top 5 into "Others"', () => {
      const data = [
        { label: 'A', value: 100, percentage: 20 },
        { label: 'B', value: 90, percentage: 18 },
        { label: 'C', value: 80, percentage: 16 },
        { label: 'D', value: 70, percentage: 14 },
        { label: 'E', value: 60, percentage: 12 },
        { label: 'F', value: 50, percentage: 10 },
        { label: 'G', value: 40, percentage: 8 },
        { label: 'H', value: 30, percentage: 6 },
      ];

      const result = prepareTopData(data);

      expect(result).toHaveLength(6); // Top 5 + Others
      expect(result.slice(0, 5)).toEqual([
        { label: 'A', value: 100, percentage: 20 },
        { label: 'B', value: 90, percentage: 18 },
        { label: 'C', value: 80, percentage: 16 },
        { label: 'D', value: 70, percentage: 14 },
        { label: 'E', value: 60, percentage: 12 },
      ]);

      const othersItem = result[5];
      expect(othersItem.label).toBe('Others');
      expect(othersItem.value).toBe(120); // 50 + 40 + 30
      expect(othersItem.percentage).toBe(24); // 10 + 8 + 6
    });

    it('should handle items without percentage property', () => {
      const data = [
        { label: 'A', value: 100 },
        { label: 'B', value: 90 },
        { label: 'C', value: 80 },
        { label: 'D', value: 70 },
        { label: 'E', value: 60 },
        { label: 'F', value: 50 },
      ];

      const result = prepareTopData(data);

      expect(result).toHaveLength(6);
      const othersItem = result[5];
      expect(othersItem.label).toBe('Others');
      expect(othersItem.value).toBe(50);
      expect(othersItem.percentage).toBe(0);
    });

    it('should handle mixed data with some items having percentage', () => {
      const data = [
        { label: 'A', value: 100, percentage: 40 },
        { label: 'B', value: 90 },
        { label: 'C', value: 80, percentage: 30 },
        { label: 'D', value: 70 },
        { label: 'E', value: 60, percentage: 20 },
        { label: 'F', value: 50, percentage: 10 },
      ];

      const result = prepareTopData(data);

      expect(result).toHaveLength(6);
      const othersItem = result[5];
      expect(othersItem.label).toBe('Others');
      expect(othersItem.value).toBe(50);
      expect(othersItem.percentage).toBe(10);
    });

    it('should handle empty array', () => {
      const result = prepareTopData([]);
      expect(result).toEqual([]);
    });

    it('should handle single item array', () => {
      const data = [{ label: 'A', value: 100, percentage: 100 }];
      const result = prepareTopData(data);
      expect(result).toEqual(data);
    });

    it('should not mutate the original array', () => {
      const data = [
        { label: 'C', value: 70, percentage: 28 },
        { label: 'A', value: 100, percentage: 40 },
        { label: 'B', value: 80, percentage: 32 },
      ];
      const originalData = JSON.parse(JSON.stringify(data));

      prepareTopData(data);

      expect(data).toEqual(originalData);
    });
  });

  describe('addColors', () => {
    it('should assign colors based on position for regular items', () => {
      const data = [
        { label: 'Item 1', value: 100, percentage: 40 },
        { label: 'Item 2', value: 80, percentage: 32 },
        { label: 'Item 3', value: 70, percentage: 28 },
      ];

      const result = addColors(data);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        label: 'Item 1',
        value: 100,
        percentage: 40,
        color: '#C7FFF7', // colorTeal100
        hoverColor: '#51F7E7', // colorTeal300
      });
      expect(result[1]).toMatchObject({
        label: 'Item 2',
        value: 80,
        percentage: 32,
        color: '#EEECFB', // colorPurple100
        hoverColor: '#C7BFF3', // colorPurple300
      });
      expect(result[2]).toMatchObject({
        label: 'Item 3',
        value: 70,
        percentage: 28,
        color: '#E5EEF9', // colorBlue100
        hoverColor: '#90BDE9', // colorBlue300
      });
    });

    it('should assign special colors for "Others" label', () => {
      const data = [
        { label: 'Regular Item', value: 100, percentage: 60 },
        { label: 'other', value: 80, percentage: 40 },
      ];

      const result = addColors(data);

      expect(result[0]).toMatchObject({
        color: '#C7FFF7', // position color
        hoverColor: '#51F7E7',
      });
      expect(result[1]).toMatchObject({
        label: 'Others',
        color: '#ECEEF2', // special others color (colorGray100)
        hoverColor: '#D6D9E1', // colorGray200
      });
    });

    it('should assign special colors for "Unclassified" label', () => {
      const data = [
        { label: 'Regular Item', value: 100, percentage: 60 },
        { label: 'Unclassified', value: 80, percentage: 40 },
      ];

      const result = addColors(data);

      expect(result[0]).toMatchObject({
        color: '#C7FFF7', // position color
        hoverColor: '#51F7E7',
      });
      expect(result[1]).toMatchObject({
        label: 'Unclassified',
        color: '#FDE3E3', // special unclassified color (colorRed100)
        hoverColor: '#F8A9A9', // colorRed300
      });
    });

    it('should use fallback colors when position exceeds palette length', () => {
      const data = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 90 },
        { label: 'Item 3', value: 80 },
        { label: 'Item 4', value: 70 },
        { label: 'Item 5', value: 60 },
        { label: 'Item 6', value: 50 },
        { label: 'Item 7', value: 40 },
      ];

      const result = addColors(data);

      expect(result[5]).toMatchObject({
        color: '#ECEEF2', // fallback color (colorGray100)
        hoverColor: '#D6D9E1', // colorGray200
      });
      expect(result[6]).toMatchObject({
        color: '#ECEEF2',
        hoverColor: '#D6D9E1',
      });
    });

    it('should handle all position colors correctly', () => {
      const data = [
        { label: 'Item 1', value: 100 },
        { label: 'Item 2', value: 90 },
        { label: 'Item 3', value: 80 },
        { label: 'Item 4', value: 70 },
        { label: 'Item 5', value: 60 },
      ];

      const result = addColors(data);

      const expectedColors = [
        { color: '#C7FFF7', hoverColor: '#51F7E7' }, // teal
        { color: '#EEECFB', hoverColor: '#C7BFF3' }, // purple
        { color: '#E5EEF9', hoverColor: '#90BDE9' }, // blue
        { color: '#DAF1E0', hoverColor: '#88CDA4' }, // green
        { color: '#FBEED9', hoverColor: '#F1C080' }, // orange
      ];

      result.forEach((item, index) => {
        expect(item).toMatchObject(expectedColors[index]);
      });
    });

    it('should handle empty array', () => {
      const result = addColors([]);
      expect(result).toEqual([]);
    });

    it('should preserve all original properties', () => {
      const data = [
        {
          label: 'Test Item',
          value: 100,
          percentage: 50,
          customProperty: 'custom value',
        },
      ];

      const result = addColors(data);

      expect(result[0]).toMatchObject({
        label: 'Test Item',
        value: 100,
        percentage: 50,
        customProperty: 'custom value',
        color: '#C7FFF7',
        hoverColor: '#51F7E7',
      });
    });

    it('should not mutate the original array', () => {
      const data = [{ label: 'Test', value: 100, percentage: 100 }];
      const originalData = JSON.parse(JSON.stringify(data));

      addColors(data);

      expect(data).toEqual(originalData);
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly when used together', () => {
      const data = [
        { label: 'A', value: 100, percentage: 20 },
        { label: 'B', value: 90, percentage: 18 },
        { label: 'C', value: 80, percentage: 16 },
        { label: 'D', value: 70, percentage: 14 },
        { label: 'E', value: 60, percentage: 12 },
        { label: 'F', value: 50, percentage: 10 },
        { label: 'G', value: 40, percentage: 8 },
      ];

      const preparedData = prepareTopData(data);
      const coloredData = addColors(preparedData);

      expect(coloredData).toHaveLength(6); // Top 5 + Others
      expect(coloredData[5]).toMatchObject({
        label: 'Others',
        value: 90, // F + G values
        percentage: 18, // F + G percentages
        color: '#ECEEF2', // special others color (colorGray100)
        hoverColor: '#D6D9E1', // colorGray200
      });

      // Verify first 5 items have position colors
      expect(coloredData[0].color).toBe('#C7FFF7');
      expect(coloredData[1].color).toBe('#EEECFB');
      expect(coloredData[2].color).toBe('#E5EEF9');
      expect(coloredData[3].color).toBe('#DAF1E0');
      expect(coloredData[4].color).toBe('#FBEED9');
    });

    it('should handle mixed special and regular items', () => {
      const data = [
        { label: 'Regular 1', value: 100, percentage: 30 },
        { label: 'Unclassified', value: 90, percentage: 25 },
        { label: 'Regular 2', value: 80, percentage: 20 },
        { label: 'Regular 3', value: 70, percentage: 15 },
        { label: 'Regular 4', value: 60, percentage: 10 },
      ];

      const preparedData = prepareTopData(data);
      const coloredData = addColors(preparedData);

      expect(coloredData).toHaveLength(5);
      expect(coloredData[0]).toMatchObject({
        label: 'Regular 1',
        color: '#C7FFF7', // position 0 color
      });
      expect(coloredData[1]).toMatchObject({
        label: 'Unclassified',
        color: '#FDE3E3', // special unclassified color (colorRed100)
      });
      expect(coloredData[2]).toMatchObject({
        label: 'Regular 2',
        color: '#E5EEF9', // position 2 color
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle data with zero values', () => {
      const data = [
        { label: 'A', value: 0, percentage: 0 },
        { label: 'B', value: 100, percentage: 100 },
      ];

      const preparedData = prepareTopData(data);
      const coloredData = addColors(preparedData);

      expect(preparedData).toHaveLength(2);
      expect(preparedData[0]).toEqual({
        label: 'B',
        value: 100,
        percentage: 100,
      });
      expect(preparedData[1]).toEqual({ label: 'A', value: 0, percentage: 0 });
      expect(coloredData[0].color).toBeDefined();
      expect(coloredData[1].color).toBeDefined();
    });

    it('should handle negative values', () => {
      const data = [
        { label: 'A', value: -10, percentage: -5 },
        { label: 'B', value: 100, percentage: 50 },
      ];

      const preparedData = prepareTopData(data);
      const coloredData = addColors(preparedData);

      expect(preparedData[0]).toEqual({
        label: 'B',
        value: 100,
        percentage: 50,
      });
      expect(preparedData[1]).toEqual({
        label: 'A',
        value: -10,
        percentage: -5,
      });
      expect(coloredData).toHaveLength(2);
    });

    it('should handle data with same values', () => {
      const data = [
        { label: 'A', value: 50, percentage: 25 },
        { label: 'B', value: 50, percentage: 25 },
        { label: 'C', value: 50, percentage: 25 },
      ];

      const preparedData = prepareTopData(data);
      const coloredData = addColors(preparedData);

      expect(preparedData).toHaveLength(3);
      expect(coloredData).toHaveLength(3);
      coloredData.forEach((item) => {
        expect(item.color).toBeDefined();
        expect(item.hoverColor).toBeDefined();
      });
    });

    it('should handle special "others" labels case-insensitively', () => {
      const data = [
        { label: 'others', value: 100, percentage: 50 },
        { label: 'OTHERS', value: 90, percentage: 40 },
        { label: 'other', value: 80, percentage: 30 },
      ];

      const coloredData = addColors(data);

      expect(coloredData[0].color).toBe('#C7FFF7'); // position color
      expect(coloredData[1].color).toBe('#EEECFB'); // position color
      expect(coloredData[2].color).toBe('#ECEEF2'); // special color (colorGray100)
    });
  });
});
