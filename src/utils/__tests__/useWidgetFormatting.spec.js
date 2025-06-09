import { beforeEach, describe, it, vi, expect, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';

import { useWidgetFormatting } from '../useWidgetFormatting';
import { useDashboards } from '@/store/modules/dashboards';

// Mock vue-i18n
const mockT = vi.fn((key) => key);
const mockLocale = { value: 'en-US' };

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT,
    locale: mockLocale,
  }),
}));

// Mock time utility
vi.mock('@/utils/time', () => ({
  formatSecondsToHumanString: vi.fn(
    (seconds) => `${seconds} formatted seconds`,
  ),
}));

// Mock currency utility
vi.mock('@/utils/currency', () => ({
  currencySymbols: {
    USD: '$',
    EUR: '€',
    BRL: 'R$',
    GBP: '£',
  },
}));

describe('useWidgetFormatting', () => {
  let pinia;
  let dashboardsStore;

  beforeEach(() => {
    vi.clearAllMocks();
    pinia = createTestingPinia({
      initialState: {
        dashboards: {
          currentDashboard: {
            uuid: 'dashboard-123',
            name: 'Test Dashboard',
            config: {
              currency_type: 'USD',
            },
          },
        },
      },
    });
    setActivePinia(pinia);
    dashboardsStore = useDashboards();

    // Reset locale to default
    mockLocale.value = 'en-US';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatCurrency', () => {
    it('should format currency with USD symbol correctly', () => {
      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(1234.567);
      expect(result).toBe('$ 1,234.57');
    });

    it('should format currency with EUR symbol correctly', () => {
      dashboardsStore.currentDashboard = {
        config: { currency_type: 'EUR' },
      };

      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(1234.567);
      expect(result).toBe('€ 1,234.57');
    });

    it('should handle zero values', () => {
      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(0);
      expect(result).toBe('$ 0.00');
    });

    it('should handle null/undefined values', () => {
      const { formatCurrency } = useWidgetFormatting();

      expect(formatCurrency(null)).toBe('$ 0.00');
      expect(formatCurrency(undefined)).toBe('$ 0.00');
    });

    it('should use custom locale when provided', () => {
      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(1234.567, 'pt-BR');
      expect(result).toBe('$ 1.234,57');
    });

    it('should handle missing currency config gracefully', () => {
      dashboardsStore.currentDashboard = { config: {} };

      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(1234.567);
      expect(result).toBe('undefined 1,234.57');
    });

    it('should handle large numbers', () => {
      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(1234567.89);
      expect(result).toBe('$ 1,234,567.89');
    });

    it('should handle small decimal numbers', () => {
      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(0.01);
      expect(result).toBe('$ 0.01');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      const { formatPercentage } = useWidgetFormatting();

      const result = formatPercentage(75.5);
      expect(result).toBe('75.50%');
    });

    it('should handle zero percentage', () => {
      const { formatPercentage } = useWidgetFormatting();

      const result = formatPercentage(0);
      expect(result).toBe('0.00%');
    });

    it('should handle null/undefined values', () => {
      const { formatPercentage } = useWidgetFormatting();

      expect(formatPercentage(null)).toBe('0.00%');
      expect(formatPercentage(undefined)).toBe('0.00%');
    });

    it('should use custom locale when provided', () => {
      const { formatPercentage } = useWidgetFormatting();

      const result = formatPercentage(75.5, 'pt-BR');
      expect(result).toBe('75,50%');
    });

    it('should handle decimal values with proper precision', () => {
      const { formatPercentage } = useWidgetFormatting();

      const result = formatPercentage(33.333333);
      expect(result).toBe('33.33%');
    });
  });

  describe('formatNumber', () => {
    it('should format number correctly', () => {
      const { formatNumber } = useWidgetFormatting();

      const result = formatNumber(1234567);
      expect(result).toBe('1,234,567');
    });

    it('should handle zero', () => {
      const { formatNumber } = useWidgetFormatting();

      const result = formatNumber(0);
      expect(result).toBe('0');
    });

    it('should handle null/undefined values', () => {
      const { formatNumber } = useWidgetFormatting();

      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });

    it('should use custom locale when provided', () => {
      const { formatNumber } = useWidgetFormatting();

      const result = formatNumber(1234567, 'pt-BR');
      expect(result).toBe('1.234.567');
    });

    it('should handle decimal numbers', () => {
      const { formatNumber } = useWidgetFormatting();

      const result = formatNumber(1234.567);
      expect(result).toBe('1,234.567');
    });
  });

  describe('getWidgetFormattedData', () => {
    it('should format percentage operation correctly', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        config: { operation: 'percentage' },
        data: { value: 75.5 },
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('75.50%');
    });

    it('should format recurrence operation correctly', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        config: { operation: 'recurrence' },
        data: { value: 25.75 },
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('25.75%');
    });

    it('should format data_suffix percentage correctly', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        config: { data_suffix: '%' },
        data: { value: 50 },
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('50.00%');
    });

    it('should format seconds data correctly', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        config: { data_type: 'sec' },
        data: { value: 3661.7 },
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('3662 formatted seconds');
    });

    it('should format currency data correctly', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        config: { currency: true },
        data: { value: 1234.56 },
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('$ 1,234.56');
    });

    it('should format regular number data correctly', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        config: {},
        data: { value: 1000 },
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('1,000');
    });

    it('should handle missing data value', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        config: {},
        data: {},
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('0');
    });

    it('should handle missing data object', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        config: {},
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('0');
    });

    it('should handle missing config', () => {
      const { getWidgetFormattedData } = useWidgetFormatting();

      const widget = {
        data: { value: 100 },
      };

      const result = getWidgetFormattedData(widget);
      expect(result).toBe('100');
    });
  });

  describe('getHoverTooltipData', () => {
    it('should return tooltip for human service dashboard card', () => {
      dashboardsStore.currentDashboard = {
        name: 'human_service_dashboard.title',
      };

      const { getHoverTooltipData } = useWidgetFormatting();

      const widget = {
        type: 'card',
        name: 'in_progress',
      };

      const result = getHoverTooltipData(widget);
      expect(result).toBe('human_service_dashboard.tooltips.in_progress');
      expect(mockT).toHaveBeenCalledWith(
        'human_service_dashboard.tooltips.in_progress',
      );
    });

    it('should return tooltip for response_time widget', () => {
      dashboardsStore.currentDashboard = {
        name: 'human_service_dashboard.title',
      };

      const { getHoverTooltipData } = useWidgetFormatting();

      const widget = {
        type: 'card',
        name: 'human_service_dashboard.response_time',
      };

      const result = getHoverTooltipData(widget);
      expect(result).toBe('human_service_dashboard.tooltips.response_time');
    });

    it('should return tooltip for closeds widget', () => {
      dashboardsStore.currentDashboard = {
        name: 'human_service_dashboard.title',
      };

      const { getHoverTooltipData } = useWidgetFormatting();

      const widget = {
        type: 'card',
        name: 'closeds',
      };

      const result = getHoverTooltipData(widget);
      expect(result).toBe('human_service_dashboard.tooltips.closeds');
    });

    it('should return empty string for unknown widget name in human service dashboard', () => {
      dashboardsStore.currentDashboard = {
        name: 'human_service_dashboard.title',
      };

      const { getHoverTooltipData } = useWidgetFormatting();

      const widget = {
        type: 'card',
        name: 'unknown_widget',
      };

      const result = getHoverTooltipData(widget);
      expect(result).toBe('');
    });

    it('should return empty string for non-human service dashboard', () => {
      dashboardsStore.currentDashboard = {
        name: 'other_dashboard',
      };

      const { getHoverTooltipData } = useWidgetFormatting();

      const widget = {
        type: 'card',
        name: 'in_progress',
      };

      const result = getHoverTooltipData(widget);
      expect(result).toBe('');
    });

    it('should return empty string for non-card widgets', () => {
      dashboardsStore.currentDashboard = {
        name: 'human_service_dashboard.title',
      };

      const { getHoverTooltipData } = useWidgetFormatting();

      const widget = {
        type: 'graph',
        name: 'in_progress',
      };

      const result = getHoverTooltipData(widget);
      expect(result).toBe('');
    });

    it('should handle missing widget properties', () => {
      const { getHoverTooltipData } = useWidgetFormatting();

      const widget = {};

      const result = getHoverTooltipData(widget);
      expect(result).toBe('');
    });
  });

  describe('formatVtexData', () => {
    it('should format VTEX data correctly', () => {
      const { formatVtexData } = useWidgetFormatting();

      const vtexData = {
        total_value: 1000.5,
        average_ticket: 250.75,
        orders: 4,
        other_field: 'unchanged',
      };

      const result = formatVtexData(vtexData);

      expect(result.total_value).toBe('$ 1,000.50');
      expect(result.average_ticket).toBe('$ 250.75');
      expect(result.orders).toBe('4');
      expect(result.other_field).toBe('unchanged');
    });

    it('should handle empty string values', () => {
      const { formatVtexData } = useWidgetFormatting();

      const vtexData = {
        total_value: '',
        average_ticket: '',
        orders: '',
      };

      const result = formatVtexData(vtexData);

      expect(result.total_value).toBe('');
      expect(result.average_ticket).toBe('');
      expect(result.orders).toBe('');
    });

    it('should handle zero values', () => {
      const { formatVtexData } = useWidgetFormatting();

      const vtexData = {
        total_value: 0,
        average_ticket: 0,
        orders: 0,
      };

      const result = formatVtexData(vtexData);

      expect(result.total_value).toBe('$ 0.00');
      expect(result.average_ticket).toBe('$ 0.00');
      expect(result.orders).toBe('0');
    });

    it('should handle null/undefined values', () => {
      const { formatVtexData } = useWidgetFormatting();

      const vtexData = {
        total_value: null,
        average_ticket: undefined,
        orders: null,
      };

      const result = formatVtexData(vtexData);

      expect(result.total_value).toBe('$ 0.00');
      expect(result.average_ticket).toBe('$ 0.00');
      expect(result.orders).toBe('0');
    });

    it('should use different currency symbols', () => {
      dashboardsStore.currentDashboard = {
        config: { currency_type: 'EUR' },
      };

      const { formatVtexData } = useWidgetFormatting();

      const vtexData = {
        total_value: 1000,
        average_ticket: 250,
        orders: 4,
      };

      const result = formatVtexData(vtexData);

      expect(result.total_value).toBe('€ 1,000.00');
      expect(result.average_ticket).toBe('€ 250.00');
      expect(result.orders).toBe('4');
    });

    it('should preserve original object structure', () => {
      const { formatVtexData } = useWidgetFormatting();

      const vtexData = {
        total_value: 1000,
        average_ticket: 250,
        orders: 4,
        extra_field: 'test',
        nested_object: { key: 'value' },
      };

      const result = formatVtexData(vtexData);

      expect(result).toHaveProperty('extra_field', 'test');
      expect(result).toHaveProperty('nested_object', { key: 'value' });
      expect(result.total_value).toBe('$ 1,000.00');
    });
  });

  describe('Locale Handling', () => {
    it('should respect locale changes', () => {
      mockLocale.value = 'pt-BR';

      const { formatCurrency, formatPercentage, formatNumber } =
        useWidgetFormatting();

      expect(formatCurrency(1234.56)).toBe('$ 1.234,56');
      expect(formatPercentage(75.5)).toBe('75,50%');
      expect(formatNumber(1234567)).toBe('1.234.567');
    });

    it('should fallback to en-US when locale is invalid', () => {
      mockLocale.value = null;

      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(1234.56);
      expect(result).toBe('$ 1,234.56');
    });
  });

  describe('Dashboard Store Integration', () => {
    it('should react to dashboard changes', () => {
      const { formatCurrency } = useWidgetFormatting();

      // Initial currency
      let result = formatCurrency(100);
      expect(result).toBe('$ 100.00');

      // Change currency in dashboard
      dashboardsStore.currentDashboard = {
        config: { currency_type: 'EUR' },
      };

      result = formatCurrency(100);
      expect(result).toBe('€ 100.00');
    });

    it('should handle missing dashboard config', () => {
      dashboardsStore.currentDashboard = {};

      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(100);
      expect(result).toBe('undefined 100.00');
    });

    it('should handle null dashboard', () => {
      dashboardsStore.currentDashboard = null;

      const { formatCurrency } = useWidgetFormatting();

      expect(() => formatCurrency(100)).not.toThrow();
    });
  });

  describe('Composable Structure', () => {
    it('should return all expected functions', () => {
      const composable = useWidgetFormatting();

      expect(composable).toHaveProperty('formatCurrency');
      expect(composable).toHaveProperty('formatPercentage');
      expect(composable).toHaveProperty('formatNumber');
      expect(composable).toHaveProperty('getWidgetFormattedData');
      expect(composable).toHaveProperty('getHoverTooltipData');
      expect(composable).toHaveProperty('formatVtexData');

      expect(typeof composable.formatCurrency).toBe('function');
      expect(typeof composable.formatPercentage).toBe('function');
      expect(typeof composable.formatNumber).toBe('function');
      expect(typeof composable.getWidgetFormattedData).toBe('function');
      expect(typeof composable.getHoverTooltipData).toBe('function');
      expect(typeof composable.formatVtexData).toBe('function');
    });

    it('should be callable multiple times without issues', () => {
      const composable1 = useWidgetFormatting();
      const composable2 = useWidgetFormatting();

      const result1 = composable1.formatCurrency(100);
      const result2 = composable2.formatCurrency(100);

      expect(result1).toBe(result2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely large numbers', () => {
      const { formatCurrency } = useWidgetFormatting();

      const result = formatCurrency(999999999999.99);
      expect(result).toBe('$ 999,999,999,999.99');
    });

    it('should handle negative numbers', () => {
      const { formatCurrency, formatPercentage, formatNumber } =
        useWidgetFormatting();

      expect(formatCurrency(-100.5)).toBe('$ -100.50');
      expect(formatPercentage(-25.5)).toBe('-25.50%');
      expect(formatNumber(-1000)).toBe('-1,000');
    });

    it('should handle scientific notation', () => {
      const { formatNumber } = useWidgetFormatting();

      const result = formatNumber(1e6);
      expect(result).toBe('1,000,000');
    });

    it('should handle Infinity and NaN', () => {
      const { formatNumber } = useWidgetFormatting();

      expect(formatNumber(Infinity)).toBe('∞');
      expect(formatNumber(-Infinity)).toBe('-∞');
      expect(formatNumber(NaN)).toBe('NaN');
    });
  });
});
