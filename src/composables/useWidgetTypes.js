/**
 * Composable for widget type categorization and component mapping
 * Provides utilities to categorize widgets and determine appropriate components
 */
export function useWidgetTypes() {
  // Widget type categories
  const WIDGET_CATEGORIES = {
    GRAPH: 'graph',
    CARD: 'card',
    TABLE: 'table',
  };

  // Widget type mappings
  const WIDGET_TYPE_MAPPINGS = {
    graph: ['graph_column', 'graph_bar', 'graph_funnel'],
    card: [
      'card',
      'empty_column',
      'vtex_order',
      'vtex_conversions',
      'recurrence',
    ],
    table: ['table_dynamic_by_filter', 'table_group'],
  };

  /**
   * Get the category of a widget based on its type
   * @param {string} widgetType - The widget type
   * @returns {string|null} - The widget category or null if not found
   */
  const getWidgetCategory = (widgetType) => {
    for (const [category, types] of Object.entries(WIDGET_TYPE_MAPPINGS)) {
      if (types.includes(widgetType)) {
        return category;
      }
    }
    return null;
  };

  /**
   * Check if a widget type belongs to a specific category
   * @param {string} widgetType - The widget type
   * @param {string} category - The category to check against
   * @returns {boolean} - Whether the widget type belongs to the category
   */
  const isWidgetOfCategory = (widgetType, category) => {
    return WIDGET_TYPE_MAPPINGS[category]?.includes(widgetType) || false;
  };

  /**
   * Get all widget types for a specific category
   * @param {string} category - The category name
   * @returns {string[]} - Array of widget types for the category
   */
  const getWidgetTypesForCategory = (category) => {
    return [...(WIDGET_TYPE_MAPPINGS[category] || [])];
  };

  return {
    WIDGET_CATEGORIES,
    WIDGET_TYPE_MAPPINGS,
    getWidgetCategory,
    isWidgetOfCategory,
    getWidgetTypesForCategory,
  };
}
