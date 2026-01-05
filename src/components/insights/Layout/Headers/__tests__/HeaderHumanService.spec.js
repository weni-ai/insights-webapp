import { describe, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import HeaderHumanService from '../HeaderHumanService.vue';

vi.mock('moment', async (importOriginal) => {
  const actual = await importOriginal();
  const momentInstance = () => ({ format: () => '2024-01-15' });
  momentInstance.locale = actual.default.locale;
  return {
    ...actual,
    default: momentInstance,
  };
});

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div/>' } }],
});

const createWrapper = (storeState = {}) =>
  shallowMount(HeaderHumanService, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            dashboards: {
              currentDashboardFilters: [],
              appliedFilters: {},
              ...storeState.dashboards,
            },
          },
          stubActions: false,
        }),
        router,
      ],
      stubs: {
        HeaderTagLive: true,
        LastUpdatedText: true,
        InsightsLayoutHeaderFilters: true,
        HeaderGenerateInsightButton: true,
        HumanSupportExport: true,
      },
    },
  });

describe('HeaderHumanService', () => {
  let wrapper;

  describe('Component rendering', () => {
    it('renders LastUpdatedText always', () => {
      wrapper = createWrapper();
      expect(wrapper.findComponent({ name: 'LastUpdatedText' }).exists()).toBe(
        true,
      );
    });

    it('renders HeaderGenerateInsightButton always', () => {
      wrapper = createWrapper();
      expect(
        wrapper
          .find(
            '[data-testid="insights-layout-header-generate-insight-button"]',
          )
          .exists(),
      ).toBe(true);
    });

    it('renders HumanSupportExport always', () => {
      wrapper = createWrapper();
      expect(
        wrapper.findComponent({ name: 'HumanSupportExport' }).exists(),
      ).toBe(true);
    });

    it('renders HeaderTagLive when showTagLive is true (no date filter)', () => {
      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [] },
      });
      expect(
        wrapper
          .find('[data-testid="insights-layout-header-tag-live"]')
          .exists(),
      ).toBe(true);
    });

    it('renders HeaderTagLive when filtering by today', () => {
      wrapper = createWrapper({
        dashboards: {
          currentDashboardFilters: [{ name: 'created_on', type: 'date_range' }],
          appliedFilters: {
            created_on: { __gte: '2024-01-15', __lte: '2024-01-15' },
          },
        },
      });
      expect(
        wrapper
          .find('[data-testid="insights-layout-header-tag-live"]')
          .exists(),
      ).toBe(true);
    });

    it('renders filters when hasFilters is true', () => {
      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [{ name: 'filter1' }] },
      });
      expect(
        wrapper.find('[data-testid="insights-layout-header-filters"]').exists(),
      ).toBe(true);
    });

    it('does not render filters when hasFilters is false', () => {
      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [] },
      });
      expect(
        wrapper.find('[data-testid="insights-layout-header-filters"]').exists(),
      ).toBe(false);
    });
  });

  describe('Computed properties', () => {
    it('hasFilters returns true when filters exist', () => {
      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [{ name: 'f1' }] },
      });
      expect(wrapper.vm.hasFilters).toBe(true);
    });

    it('hasFilters returns false when no filters', () => {
      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [] },
      });
      expect(wrapper.vm.hasFilters).toBe(false);
    });

    it('showTagLive returns true when no date filter in query', () => {
      wrapper = createWrapper({
        dashboards: {
          currentDashboardFilters: [{ name: 'date', type: 'date_range' }],
        },
      });
      expect(wrapper.vm.showTagLive).toBe(true);
    });

    it('showTagLive returns true when filtering by today', () => {
      wrapper = createWrapper({
        dashboards: {
          currentDashboardFilters: [{ name: 'created_on', type: 'date_range' }],
          appliedFilters: {
            created_on: { __gte: '2024-01-15', __lte: '2024-01-15' },
          },
        },
      });
      expect(wrapper.vm.showTagLive).toBe(true);
    });
  });
});
