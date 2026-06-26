import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config, flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';

import AbandonedCartWidget from '../index.vue';
import WidgetConversationalService from '@/services/api/resources/conversational/widgets';

const mockAppliedFilters = ref({
  start_date: '2026-06-01',
  end_date: '2026-06-25',
});
const mockRefreshDataConversational = ref(false);

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: () => ({
    appliedFilters: mockAppliedFilters,
    refreshDataConversational: mockRefreshDataConversational,
  }),
}));

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal()),
  storeToRefs: (store) => store,
}));

vi.mock('@/services/api/resources/conversational/widgets', () => ({
  default: {
    getAbandonedCartRecoveryData: vi.fn(),
  },
}));

const mockApiResponse = [
  { id: 'sent-messages', value: 100 },
  { id: 'delivered-messages', value: 80 },
  { id: 'read-messages', value: 60 },
  { id: 'interactions', value: 40 },
  { id: 'utm-revenue', value: 5000, percentage: 10, prefix: '$' },
  { id: 'orders-placed', value: 25, percentage: 25 },
];

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        abandoned_cart_recovery_widget: {
          title: 'Abandoned cart recovery',
          no_data: 'No data available for the filtered period.',
          error:
            'Error loading data. Please refresh the dashboard or contact support.',
          unavailable_period:
            'Meta only provides the data from the last 90 days for this widget. Make sure the selected date range is within this period to view the information.',
        },
        customize_your_dashboard: {
          remove_widget: 'Remove widget',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('AbandonedCartWidget', () => {
  let wrapper;

  const createWrapper = () =>
    mount(AbandonedCartWidget, {
      global: {
        stubs: {
          UnnnicSkeletonLoading: {
            template: '<div data-testid="abandoned-cart-widget-skeleton" />',
          },
          UnnnicPopover: {
            template: '<div><slot /></div>',
          },
          UnnnicPopoverTrigger: {
            template: '<div><slot /></div>',
          },
          UnnnicPopoverContent: {
            template: '<div><slot /></div>',
          },
          UnnnicPopoverOption: {
            template:
              '<button data-testid="abandoned-cart-widget-remove-option" @click="$emit(\'click\')"><slot /></button>',
            props: ['label', 'icon', 'scheme'],
          },
          UnnnicButton: true,
          UnnnicDisclaimer: {
            template:
              '<div data-testid="abandoned-cart-widget-disclaimer" :data-type="type">{{ description }}</div>',
            props: ['type', 'description'],
          },
          Chart: {
            name: 'AbandonedCartWidgetChart',
            template: '<div data-testid="abandoned-cart-widget-chart-stub" />',
            props: ['data'],
          },
          InfoCard: {
            name: 'AbandonedCartWidgetInfoCard',
            template:
              '<div data-testid="abandoned-cart-widget-info-card-stub" />',
            props: ['data'],
          },
          ModalRemoveWidget: {
            name: 'ModalRemoveWidget',
            template:
              '<div data-testid="abandoned-cart-widget-remove-modal" />',
            props: ['modelValue', 'size', 'type', 'name'],
          },
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-26T12:00:00Z'));

    mockAppliedFilters.value = {
      start_date: '2026-06-01',
      end_date: '2026-06-25',
    };
    mockRefreshDataConversational.value = false;

    WidgetConversationalService.getAbandonedCartRecoveryData.mockResolvedValue(
      mockApiResponse,
    );

    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
  });

  describe('Data loading', () => {
    it('fetches data on mount', async () => {
      await flushPromises();
      expect(
        WidgetConversationalService.getAbandonedCartRecoveryData,
      ).toHaveBeenCalledWith(mockAppliedFilters.value);
    });

    it('renders chart and info card after successful fetch', async () => {
      await flushPromises();
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-chart-stub"]')
          .exists(),
      ).toBe(true);
      expect(
        wrapper
          .find('[data-testid="abandoned-cart-widget-info-card-stub"]')
          .exists(),
      ).toBe(true);
    });

    it('passes mapped data to child components', async () => {
      await flushPromises();
      const chart = wrapper.findComponent({ name: 'AbandonedCartWidgetChart' });
      const infoCard = wrapper.findComponent({
        name: 'AbandonedCartWidgetInfoCard',
      });

      expect(chart.props('data')).toEqual({
        sent: 100,
        delivered: 80,
        read: 60,
        clicks: 40,
      });
      expect(infoCard.props('data')).toEqual({
        currency: '$',
        recoveryRevenue: 5000,
        totalSends: 100,
        convertedSales: 25,
      });
    });

    it('refetches data when filters change', async () => {
      await flushPromises();
      const callsBefore =
        WidgetConversationalService.getAbandonedCartRecoveryData.mock.calls
          .length;

      mockAppliedFilters.value = {
        start_date: '2026-06-10',
        end_date: '2026-06-20',
      };
      await flushPromises();

      expect(
        WidgetConversationalService.getAbandonedCartRecoveryData.mock.calls
          .length,
      ).toBeGreaterThan(callsBefore);
    });

    it('refetches data when refresh flag is set', async () => {
      await flushPromises();
      const callsBefore =
        WidgetConversationalService.getAbandonedCartRecoveryData.mock.calls
          .length;

      mockRefreshDataConversational.value = true;
      await flushPromises();

      expect(
        WidgetConversationalService.getAbandonedCartRecoveryData.mock.calls
          .length,
      ).toBeGreaterThan(callsBefore);
    });
  });

  describe('Disclaimer states', () => {
    it('shows no data disclaimer when all metrics are zero', async () => {
      WidgetConversationalService.getAbandonedCartRecoveryData.mockResolvedValue(
        [
          { id: 'sent-messages', value: 0 },
          { id: 'delivered-messages', value: 0 },
          { id: 'read-messages', value: 0 },
          { id: 'interactions', value: 0 },
          { id: 'utm-revenue', value: 0, percentage: 0, prefix: '' },
          { id: 'orders-placed', value: 0, percentage: 0 },
        ],
      );

      wrapper = createWrapper();
      await flushPromises();

      const disclaimer = wrapper.find(
        '[data-testid="abandoned-cart-widget-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.attributes('data-type')).toBe('neutral');
      expect(disclaimer.text()).toBe(
        'No data available for the filtered period.',
      );
    });

    it('shows error disclaimer when fetch fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      WidgetConversationalService.getAbandonedCartRecoveryData.mockRejectedValue(
        new Error('Network error'),
      );

      wrapper = createWrapper();
      await flushPromises();

      const disclaimer = wrapper.find(
        '[data-testid="abandoned-cart-widget-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.attributes('data-type')).toBe('error');
      expect(disclaimer.text()).toBe(
        'Error loading data. Please refresh the dashboard or contact support.',
      );

      consoleErrorSpy.mockRestore();
    });

    it('shows unavailable period disclaimer for out-of-range dates', async () => {
      wrapper?.unmount();
      mockAppliedFilters.value = {
        start_date: '2026-01-01',
        end_date: '2026-06-25',
      };
      vi.clearAllMocks();

      wrapper = createWrapper();
      await flushPromises();

      expect(
        WidgetConversationalService.getAbandonedCartRecoveryData,
      ).not.toHaveBeenCalled();

      const disclaimer = wrapper.find(
        '[data-testid="abandoned-cart-widget-disclaimer"]',
      );
      expect(disclaimer.exists()).toBe(true);
      expect(disclaimer.text()).toContain('Meta only provides the data');
    });
  });

  describe('Widget actions', () => {
    it('renders widget title', async () => {
      await flushPromises();
      expect(
        wrapper.find('[data-testid="abandoned-cart-widget-title"]').text(),
      ).toBe('Abandoned cart recovery');
    });

    it('opens remove widget modal when delete option is clicked', async () => {
      await flushPromises();
      await wrapper
        .find('[data-testid="abandoned-cart-widget-remove-option"]')
        .trigger('click');
      await wrapper.vm.$nextTick();

      const modal = wrapper.findComponent({ name: 'ModalRemoveWidget' });
      expect(modal.exists()).toBe(true);
      expect(modal.props('type')).toBe('abandoned_cart_recovery');
    });
  });
});
