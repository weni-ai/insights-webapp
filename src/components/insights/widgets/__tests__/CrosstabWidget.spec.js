import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import CrosstabWidget from '../CrosstabWidget.vue';

const mockCustomWidgetsStore = {
  getCustomWidgetByUuid: vi.fn(),
  getIsLoadingByUuid: vi.fn().mockReturnValue(false),
};

vi.mock('@/store/modules/conversational/customWidgets', () => ({
  useCustomWidgets: () => mockCustomWidgetsStore,
}));

import { icuMessageCompiler } from '@/utils/icuMessageCompiler';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        no_data_available: 'No data available for the filtered period',
      },
      lines_count: '{count, plural, one {# line} other {# lines}}',
      see_all: 'See all',
    },
  },
  fallbackWarn: false,
  missingWarn: false,
  messageCompiler: icuMessageCompiler,
});

config.global.plugins = [i18n];

const buildWidget = (results) => ({
  name: 'My crosstab',
  data: {
    total_rows: results.length,
    results,
  },
});

const createWrapper = (widget) => {
  mockCustomWidgetsStore.getCustomWidgetByUuid.mockReturnValue(widget);
  mockCustomWidgetsStore.getIsLoadingByUuid.mockReturnValue(false);
  return mount(CrosstabWidget, {
    props: { widgetUuid: 'test-uuid' },
    global: {
      plugins: [UnnnicSystem],
      stubs: {
        ProgressTable: true,
        SeeAllDrawer: true,
      },
    },
  });
};

describe('CrosstabWidget.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('No-data disclaimer', () => {
    it('renders the UnnnicDisclaimer with type="neutral" when all results have total === 0', () => {
      const widget = buildWidget([
        { title: 'A', total: 0, events: { foo: { value: 0 } } },
        { title: 'B', total: 0, events: { foo: { value: 0 } } },
      ]);

      const wrapper = createWrapper(widget);

      const disclaimer = wrapper.findComponent(
        '[data-testid="crosstab-widget-no-data-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.props('type')).toBe('neutral');
      expect(disclaimer.props('description')).toBe(
        'No data available for the filtered period',
      );
    });

    it('does NOT render the disclaimer when at least one result has a non-zero total', () => {
      const widget = buildWidget([
        { title: 'A', total: 12, events: { foo: { value: 5 } } },
        { title: 'B', total: 0, events: { foo: { value: 0 } } },
      ]);

      const wrapper = createWrapper(widget);

      const disclaimer = wrapper.find(
        '[data-testid="crosstab-widget-no-data-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(false);
    });

    it('does NOT render the disclaimer while the widget is loading', () => {
      const widget = buildWidget([
        { title: 'A', total: 0, events: { foo: { value: 0 } } },
      ]);
      mockCustomWidgetsStore.getCustomWidgetByUuid.mockReturnValue(widget);
      mockCustomWidgetsStore.getIsLoadingByUuid.mockReturnValue(true);

      const wrapper = mount(CrosstabWidget, {
        props: { widgetUuid: 'test-uuid' },
        global: {
          plugins: [UnnnicSystem],
          stubs: {
            ProgressTable: true,
            SeeAllDrawer: true,
          },
        },
      });

      const disclaimer = wrapper.find(
        '[data-testid="crosstab-widget-no-data-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(false);
    });
  });
});
