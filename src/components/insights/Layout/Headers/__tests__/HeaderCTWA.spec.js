import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';

import HeaderCTWA from '../HeaderCTWA.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: {} },
    fallbackWarn: false,
    missingWarn: false,
  }),
];

const appliedDateRangeRef = ref({ start: '2024-01-01', end: '2024-01-07' });
const selectedCampaignRef = ref('');

const mockRouter = {
  replace: vi.fn(),
  currentRoute: {
    value: {
      query: {},
    },
  },
};

vi.mock('@/store/modules/ctwa', () => ({
  useCTWA: () => ({
    get appliedDateRange() {
      return appliedDateRangeRef.value;
    },
    set appliedDateRange(value) {
      appliedDateRangeRef.value = value;
    },
    get selectedCampaign() {
      return selectedCampaignRef.value;
    },
    set selectedCampaign(value) {
      selectedCampaignRef.value = value;
    },
  }),
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal()),
  storeToRefs: () => ({
    appliedDateRange: appliedDateRangeRef,
    selectedCampaign: selectedCampaignRef,
  }),
}));

const createWrapper = () =>
  mount(HeaderCTWA, {
    global: {
      plugins: [createTestingPinia()],
      stubs: {
        FilterDate: true,
        CampaignFilter: true,
        UnnnicButton: true,
      },
    },
  });

describe('HeaderCTWA', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    appliedDateRangeRef.value = { start: '2024-01-01', end: '2024-01-07' };
    selectedCampaignRef.value = '';
    mockRouter.currentRoute.value.query = {};
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders date and campaign filters', () => {
      expect(wrapper.findComponent({ name: 'FilterDate' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'CampaignFilter' }).exists()).toBe(
        true,
      );
    });

    it('renders refresh button', () => {
      expect(wrapper.find('[data-testid="ctwa-refresh-button"]').exists()).toBe(
        true,
      );
    });
  });

  describe('Router integration', () => {
    it('sets start_date and end_date query params on initial load', () => {
      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: {
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        },
      });
    });

    it('adds campaign query param when a campaign is selected', async () => {
      vi.clearAllMocks();
      selectedCampaignRef.value = 'campaign-uuid';
      await nextTick();

      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: {
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          campaign: 'campaign-uuid',
        },
      });
    });

    it('removes campaign query param when selection is cleared', async () => {
      mockRouter.currentRoute.value.query = {
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        campaign: 'campaign-uuid',
      };
      selectedCampaignRef.value = 'campaign-uuid';
      await nextTick();
      vi.clearAllMocks();

      selectedCampaignRef.value = '';
      await nextTick();

      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: {
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        },
      });
    });

    it('updates date query params when date range changes', async () => {
      vi.clearAllMocks();
      mockRouter.currentRoute.value.query = { other: 'value' };

      appliedDateRangeRef.value = { start: '2024-02-01', end: '2024-02-28' };
      await nextTick();

      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: {
          other: 'value',
          start_date: '2024-02-01',
          end_date: '2024-02-28',
        },
      });
    });

    it('preserves existing query params when updating filters', async () => {
      vi.clearAllMocks();
      mockRouter.currentRoute.value.query = {
        tab: 'overview',
      };

      const dateFilter = wrapper.findComponent({ name: 'FilterDate' });
      appliedDateRangeRef.value = { start: '2024-03-01', end: '2024-03-31' };
      await dateFilter.vm.$emit('update:modelValue', {
        start: '2024-03-01',
        end: '2024-03-31',
      });
      await nextTick();

      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: {
          tab: 'overview',
          start_date: '2024-03-01',
          end_date: '2024-03-31',
        },
      });
    });
  });
});
