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
const currentDashboardUuid = 'ctwa-dashboard-uuid';
const currentDashboardRef = ref({ uuid: currentDashboardUuid });

const mockRouter = {
  replace: vi.fn(),
  currentRoute: {
    value: {
      name: 'dashboard',
      params: { dashboardUuid: currentDashboardUuid },
      query: {},
    },
  },
};

const expectedNavigation = (query) => ({
  name: 'dashboard',
  params: { dashboardUuid: currentDashboardUuid },
  query,
});

const mockLoadAllData = vi.fn();

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
    loadAllData: mockLoadAllData,
    minDateFilter: '2026-08-19',
    maxDateFilter: '2026-08-20',
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
    currentDashboard: currentDashboardRef,
    appliedDateRange: appliedDateRangeRef,
    selectedCampaign: selectedCampaignRef,
  }),
}));

const createWrapper = () =>
  mount(HeaderCTWA, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            dashboards: {
              currentDashboard: { uuid: currentDashboardUuid },
            },
          },
        }),
      ],
      stubs: {
        UnnnicInputDatePicker: true,
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
      expect(
        wrapper.findComponent({ name: 'UnnnicInputDatePicker' }).exists(),
      ).toBe(true);
    });

    it('renders refresh button', () => {
      expect(wrapper.find('[data-testid="ctwa-refresh-button"]').exists()).toBe(
        true,
      );
    });

    it('calls loadAllData when refresh is clicked', async () => {
      await wrapper.findComponent({ name: 'UnnnicButton' }).vm.$emit('click');

      expect(mockLoadAllData).toHaveBeenCalledTimes(1);
    });
  });

  describe('Router integration', () => {
    it('sets start_date and end_date query params on initial load', () => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expectedNavigation({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        }),
      );
    });

    it('keeps the current dashboard uuid when syncing query params', () => {
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'dashboard',
          params: { dashboardUuid: currentDashboardUuid },
        }),
      );
    });

    it('adds campaign query param when a campaign is selected', async () => {
      vi.clearAllMocks();
      selectedCampaignRef.value = 'campaign-uuid';
      await nextTick();

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expectedNavigation({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          campaign: 'campaign-uuid',
        }),
      );
    });

    it('removes campaign query param when selection is cleared', async () => {
      mockRouter.currentRoute.value.query = {
        start_date: '2024-01-01',
        end_date: '2024-01-07',
      };
      selectedCampaignRef.value = 'campaign-uuid';
      await nextTick();
      vi.clearAllMocks();

      selectedCampaignRef.value = '';
      await nextTick();

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expectedNavigation({
          start_date: '2024-01-01',
          end_date: '2024-01-07',
        }),
      );
    });

    it('updates date query params when date range changes', async () => {
      vi.clearAllMocks();
      mockRouter.currentRoute.value.query = { other: 'value' };

      appliedDateRangeRef.value = { start: '2024-02-01', end: '2024-02-28' };
      await nextTick();

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expectedNavigation({
          other: 'value',
          start_date: '2024-02-01',
          end_date: '2024-02-28',
        }),
      );
    });

    it('preserves existing query params when updating filters', async () => {
      vi.clearAllMocks();
      mockRouter.currentRoute.value.query = {
        tab: 'overview',
      };

      const dateFilter = wrapper.findComponent({
        name: 'UnnnicInputDatePicker',
      });
      appliedDateRangeRef.value = { start: '2024-03-01', end: '2024-03-31' };
      await dateFilter.vm.$emit('update:model-value', {
        start: '2024-03-01',
        end: '2024-03-31',
      });
      await nextTick();

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expectedNavigation({
          tab: 'overview',
          start_date: '2024-03-01',
          end_date: '2024-03-31',
        }),
      );
    });
  });
});
