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
        color: '#C6FFF7', // color-weni-100
        hoverColor: '#4DFBEA', // color-weni-300
      });
      expect(result[1]).toMatchObject({
        label: 'Item 2',
        value: 80,
        percentage: 32,
        color: '#E9D8FD', // color-aux-purple-100
        hoverColor: '#B794F4', // color-aux-purple-300
      });
      expect(result[2]).toMatchObject({
        label: 'Item 3',
        value: 70,
        percentage: 28,
        color: '#BEE3F8', // color-aux-blue-100
        hoverColor: '#63B3ED', // color-aux-blue-300
      });
    });

    it('should assign special colors for "Others" label', () => {
      const data = [
        { label: 'Regular Item', value: 100, percentage: 60 },
        { label: 'other', value: 80, percentage: 40 },
      ];

      const result = addColors(data);

      expect(result[0]).toMatchObject({
        color: '#C6FFF7', // position color
        hoverColor: '#4DFBEA',
      });
      expect(result[1]).toMatchObject({
        label: 'Others',
        color: '#E2E6ED', // special others color
        hoverColor: '#D0D3D9',
      });
    });

    it('should assign special colors for "Unclassified" label', () => {
      const data = [
        { label: 'Regular Item', value: 100, percentage: 60 },
        { label: 'Unclassified', value: 80, percentage: 40 },
      ];

      const result = addColors(data);

      expect(result[0]).toMatchObject({
        color: '#C6FFF7', // position color
        hoverColor: '#4DFBEA',
      });
      expect(result[1]).toMatchObject({
        label: 'Unclassified',
        color: '#FED7D7', // special unclassified color
        hoverColor: '#FC8181',
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
        color: '#E2E6ED',
        hoverColor: '#D0D3D9',
      });
      expect(result[6]).toMatchObject({
        color: '#E2E6ED',
        hoverColor: '#D0D3D9',
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
        { color: '#C6FFF7', hoverColor: '#4DFBEA' }, // weni
        { color: '#E9D8FD', hoverColor: '#B794F4' }, // purple
        { color: '#BEE3F8', hoverColor: '#63B3ED' }, // blue
        { color: '#C6F6D5', hoverColor: '#68D391' }, // green
        { color: '#FEEBC8', hoverColor: '#F6AD55' }, // orange
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
        color: '#C6FFF7',
        hoverColor: '#4DFBEA',
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
        color: '#E2E6ED', // special others color
        hoverColor: '#D0D3D9',
      });

      // Verify first 5 items have position colors
      expect(coloredData[0].color).toBe('#C6FFF7');
      expect(coloredData[1].color).toBe('#E9D8FD');
      expect(coloredData[2].color).toBe('#BEE3F8');
      expect(coloredData[3].color).toBe('#C6F6D5');
      expect(coloredData[4].color).toBe('#FEEBC8');
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
        color: '#C6FFF7', // position 0 color
      });
      expect(coloredData[1]).toMatchObject({
        label: 'Unclassified',
        color: '#FED7D7', // special unclassified color
      });
      expect(coloredData[2]).toMatchObject({
        label: 'Regular 2',
        color: '#BEE3F8', // position 2 color
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

      expect(coloredData[0].color).toBe('#C6FFF7'); // position color
      expect(coloredData[1].color).toBe('#E9D8FD'); // position color
      expect(coloredData[2].color).toBe('#E2E6ED'); // special color
    });
  });
});
