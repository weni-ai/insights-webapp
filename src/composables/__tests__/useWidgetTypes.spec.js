import { beforeEach, describe, it, expect } from 'vitest';
import { useWidgetTypes } from '../useWidgetTypes';

describe('useWidgetTypes', () => {
  let composable;

  beforeEach(() => {
    composable = useWidgetTypes();
  });

  describe('Constants', () => {
    it('should expose WIDGET_CATEGORIES constants', () => {
      const { WIDGET_CATEGORIES } = composable;

      expect(WIDGET_CATEGORIES).toEqual({
        GRAPH: 'graph',
        CARD: 'card',
        TABLE: 'table',
      });
    });

    it('should expose WIDGET_TYPE_MAPPINGS constants', () => {
      const { WIDGET_TYPE_MAPPINGS } = composable;

      expect(WIDGET_TYPE_MAPPINGS).toEqual({
        graph: ['graph_column', 'graph_bar', 'graph_funnel'],
        card: [
          'card',
          'empty_column',
          'vtex_order',
          'vtex_conversions',
          'recurrence',
        ],
        table: ['table_dynamic_by_filter', 'table_group'],
      });
    });

    it('should have immutable constants', () => {
      const { WIDGET_CATEGORIES, WIDGET_TYPE_MAPPINGS } = composable;

      // Try to modify constants (should not affect original)
      const originalCategories = { ...WIDGET_CATEGORIES };
      const originalMappings = { ...WIDGET_TYPE_MAPPINGS };

      // Attempt modification
      WIDGET_CATEGORIES.NEW_CATEGORY = 'new';
      WIDGET_TYPE_MAPPINGS.new = ['new_type'];

      // Original should be unchanged for new instances
      const newComposable = useWidgetTypes();
      expect(newComposable.WIDGET_CATEGORIES).toEqual(originalCategories);
      expect(newComposable.WIDGET_TYPE_MAPPINGS).toEqual(originalMappings);
    });
  });

  describe('getWidgetCategory', () => {
    it('should categorize graph widgets correctly', () => {
      const { getWidgetCategory } = composable;

      expect(getWidgetCategory('graph_column')).toBe('graph');
      expect(getWidgetCategory('graph_bar')).toBe('graph');
      expect(getWidgetCategory('graph_funnel')).toBe('graph');
    });

    it('should categorize card widgets correctly', () => {
      const { getWidgetCategory } = composable;

      expect(getWidgetCategory('card')).toBe('card');
      expect(getWidgetCategory('empty_column')).toBe('card');
      expect(getWidgetCategory('vtex_order')).toBe('card');
      expect(getWidgetCategory('vtex_conversions')).toBe('card');
      expect(getWidgetCategory('recurrence')).toBe('card');
    });

    it('should categorize table widgets correctly', () => {
      const { getWidgetCategory } = composable;

      expect(getWidgetCategory('table_dynamic_by_filter')).toBe('table');
      expect(getWidgetCategory('table_group')).toBe('table');
    });

    it('should return null for unknown widget types', () => {
      const { getWidgetCategory } = composable;

      expect(getWidgetCategory('unknown_type')).toBeNull();
      expect(getWidgetCategory('invalid_widget')).toBeNull();
      expect(getWidgetCategory('not_a_widget')).toBeNull();
    });

    it('should handle edge cases gracefully', () => {
      const { getWidgetCategory } = composable;

      expect(getWidgetCategory('')).toBeNull();
      expect(getWidgetCategory(null)).toBeNull();
      expect(getWidgetCategory(undefined)).toBeNull();
      expect(getWidgetCategory(123)).toBeNull();
      expect(getWidgetCategory({})).toBeNull();
      expect(getWidgetCategory([])).toBeNull();
    });

    it('should be case sensitive', () => {
      const { getWidgetCategory } = composable;

      expect(getWidgetCategory('CARD')).toBeNull();
      expect(getWidgetCategory('Card')).toBeNull();
      expect(getWidgetCategory('GRAPH_COLUMN')).toBeNull();
      expect(getWidgetCategory('Graph_Column')).toBeNull();
    });
  });

  describe('isWidgetOfCategory', () => {
    it('should correctly identify graph widgets', () => {
      const { isWidgetOfCategory } = composable;

      expect(isWidgetOfCategory('graph_column', 'graph')).toBe(true);
      expect(isWidgetOfCategory('graph_bar', 'graph')).toBe(true);
      expect(isWidgetOfCategory('graph_funnel', 'graph')).toBe(true);

      expect(isWidgetOfCategory('card', 'graph')).toBe(false);
      expect(isWidgetOfCategory('table_group', 'graph')).toBe(false);
    });

    it('should correctly identify card widgets', () => {
      const { isWidgetOfCategory } = composable;

      expect(isWidgetOfCategory('card', 'card')).toBe(true);
      expect(isWidgetOfCategory('empty_column', 'card')).toBe(true);
      expect(isWidgetOfCategory('vtex_order', 'card')).toBe(true);
      expect(isWidgetOfCategory('vtex_conversions', 'card')).toBe(true);
      expect(isWidgetOfCategory('recurrence', 'card')).toBe(true);

      expect(isWidgetOfCategory('graph_column', 'card')).toBe(false);
      expect(isWidgetOfCategory('table_group', 'card')).toBe(false);
    });

    it('should correctly identify table widgets', () => {
      const { isWidgetOfCategory } = composable;

      expect(isWidgetOfCategory('table_dynamic_by_filter', 'table')).toBe(true);
      expect(isWidgetOfCategory('table_group', 'table')).toBe(true);

      expect(isWidgetOfCategory('card', 'table')).toBe(false);
      expect(isWidgetOfCategory('graph_column', 'table')).toBe(false);
    });

    it('should return false for unknown widget types', () => {
      const { isWidgetOfCategory } = composable;

      expect(isWidgetOfCategory('unknown_type', 'graph')).toBe(false);
      expect(isWidgetOfCategory('invalid_widget', 'card')).toBe(false);
      expect(isWidgetOfCategory('not_a_widget', 'table')).toBe(false);
    });

    it('should return false for unknown categories', () => {
      const { isWidgetOfCategory } = composable;

      expect(isWidgetOfCategory('card', 'unknown_category')).toBe(false);
      expect(isWidgetOfCategory('graph_column', 'invalid_category')).toBe(
        false,
      );
      expect(isWidgetOfCategory('table_group', 'not_a_category')).toBe(false);
    });

    it('should handle edge cases gracefully', () => {
      const { isWidgetOfCategory } = composable;

      expect(isWidgetOfCategory('', 'graph')).toBe(false);
      expect(isWidgetOfCategory(null, 'card')).toBe(false);
      expect(isWidgetOfCategory(undefined, 'table')).toBe(false);
      expect(isWidgetOfCategory('card', '')).toBe(false);
      expect(isWidgetOfCategory('card', null)).toBe(false);
      expect(isWidgetOfCategory('card', undefined)).toBe(false);
    });

    it('should be case sensitive for both parameters', () => {
      const { isWidgetOfCategory } = composable;

      expect(isWidgetOfCategory('CARD', 'card')).toBe(false);
      expect(isWidgetOfCategory('card', 'CARD')).toBe(false);
      expect(isWidgetOfCategory('GRAPH_COLUMN', 'graph')).toBe(false);
      expect(isWidgetOfCategory('graph_column', 'GRAPH')).toBe(false);
    });
  });

  describe('getWidgetTypesForCategory', () => {
    it('should return correct widget types for graph category', () => {
      const { getWidgetTypesForCategory } = composable;

      const graphTypes = getWidgetTypesForCategory('graph');
      expect(graphTypes).toEqual(['graph_column', 'graph_bar', 'graph_funnel']);
      expect(graphTypes).toHaveLength(3);
    });

    it('should return correct widget types for card category', () => {
      const { getWidgetTypesForCategory } = composable;

      const cardTypes = getWidgetTypesForCategory('card');
      expect(cardTypes).toEqual([
        'card',
        'empty_column',
        'vtex_order',
        'vtex_conversions',
        'recurrence',
      ]);
      expect(cardTypes).toHaveLength(5);
    });

    it('should return correct widget types for table category', () => {
      const { getWidgetTypesForCategory } = composable;

      const tableTypes = getWidgetTypesForCategory('table');
      expect(tableTypes).toEqual(['table_dynamic_by_filter', 'table_group']);
      expect(tableTypes).toHaveLength(2);
    });

    it('should return empty array for unknown categories', () => {
      const { getWidgetTypesForCategory } = composable;

      expect(getWidgetTypesForCategory('unknown_category')).toEqual([]);
      expect(getWidgetTypesForCategory('invalid_category')).toEqual([]);
      expect(getWidgetTypesForCategory('not_a_category')).toEqual([]);
    });

    it('should handle edge cases gracefully', () => {
      const { getWidgetTypesForCategory } = composable;

      expect(getWidgetTypesForCategory('')).toEqual([]);
      expect(getWidgetTypesForCategory(null)).toEqual([]);
      expect(getWidgetTypesForCategory(undefined)).toEqual([]);
      expect(getWidgetTypesForCategory(123)).toEqual([]);
      expect(getWidgetTypesForCategory({})).toEqual([]);
      expect(getWidgetTypesForCategory([])).toEqual([]);
    });

    it('should return arrays that can be safely modified', () => {
      const { getWidgetTypesForCategory } = composable;

      const graphTypes = getWidgetTypesForCategory('graph');
      const originalLength = graphTypes.length;

      // Modify the returned array
      graphTypes.push('new_graph_type');

      // Should not affect subsequent calls
      const newGraphTypes = getWidgetTypesForCategory('graph');
      expect(newGraphTypes).toHaveLength(originalLength);
      expect(newGraphTypes).not.toContain('new_graph_type');
    });

    it('should be case sensitive', () => {
      const { getWidgetTypesForCategory } = composable;

      expect(getWidgetTypesForCategory('GRAPH')).toEqual([]);
      expect(getWidgetTypesForCategory('Graph')).toEqual([]);
      expect(getWidgetTypesForCategory('CARD')).toEqual([]);
      expect(getWidgetTypesForCategory('Card')).toEqual([]);
      expect(getWidgetTypesForCategory('TABLE')).toEqual([]);
      expect(getWidgetTypesForCategory('Table')).toEqual([]);
    });
  });

  describe('Composable Structure', () => {
    it('should return all expected properties and functions', () => {
      expect(composable).toHaveProperty('WIDGET_CATEGORIES');
      expect(composable).toHaveProperty('WIDGET_TYPE_MAPPINGS');
      expect(composable).toHaveProperty('getWidgetCategory');
      expect(composable).toHaveProperty('isWidgetOfCategory');
      expect(composable).toHaveProperty('getWidgetTypesForCategory');

      expect(typeof composable.getWidgetCategory).toBe('function');
      expect(typeof composable.isWidgetOfCategory).toBe('function');
      expect(typeof composable.getWidgetTypesForCategory).toBe('function');
    });

    it('should be callable multiple times without issues', () => {
      const composable1 = useWidgetTypes();
      const composable2 = useWidgetTypes();

      expect(composable1.getWidgetCategory('card')).toBe('card');
      expect(composable2.getWidgetCategory('card')).toBe('card');

      expect(composable1.isWidgetOfCategory('graph_column', 'graph')).toBe(
        true,
      );
      expect(composable2.isWidgetOfCategory('graph_column', 'graph')).toBe(
        true,
      );
    });

    it('should have consistent data across instances', () => {
      const composable1 = useWidgetTypes();
      const composable2 = useWidgetTypes();

      expect(composable1.WIDGET_CATEGORIES).toEqual(
        composable2.WIDGET_CATEGORIES,
      );
      expect(composable1.WIDGET_TYPE_MAPPINGS).toEqual(
        composable2.WIDGET_TYPE_MAPPINGS,
      );
    });
  });

  describe('Integration Tests', () => {
    it('should work correctly when combining different functions', () => {
      const {
        getWidgetCategory,
        isWidgetOfCategory,
        getWidgetTypesForCategory,
      } = composable;

      // Test workflow: get category, verify it, and get all types for that category
      const widgetType = 'graph_column';
      const category = getWidgetCategory(widgetType);

      expect(category).toBe('graph');
      expect(isWidgetOfCategory(widgetType, category)).toBe(true);

      const allTypesInCategory = getWidgetTypesForCategory(category);
      expect(allTypesInCategory).toContain(widgetType);
    });

    it('should maintain consistency across all widget types', () => {
      const {
        getWidgetCategory,
        isWidgetOfCategory,
        getWidgetTypesForCategory,
        WIDGET_TYPE_MAPPINGS,
      } = composable;

      // Test all defined widget types
      Object.entries(WIDGET_TYPE_MAPPINGS).forEach(([category, types]) => {
        types.forEach((type) => {
          // Each type should correctly map to its category
          expect(getWidgetCategory(type)).toBe(category);
          expect(isWidgetOfCategory(type, category)).toBe(true);

          // The type should be included in the category's type list
          const categoryTypes = getWidgetTypesForCategory(category);
          expect(categoryTypes).toContain(type);
        });
      });
    });

    it('should handle cross-category verification', () => {
      const { isWidgetOfCategory } = composable;

      // Verify that widgets don't belong to wrong categories
      expect(isWidgetOfCategory('graph_column', 'card')).toBe(false);
      expect(isWidgetOfCategory('graph_column', 'table')).toBe(false);

      expect(isWidgetOfCategory('card', 'graph')).toBe(false);
      expect(isWidgetOfCategory('card', 'table')).toBe(false);

      expect(isWidgetOfCategory('table_group', 'graph')).toBe(false);
      expect(isWidgetOfCategory('table_group', 'card')).toBe(false);
    });
  });
});
