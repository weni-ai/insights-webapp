import { describe, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import HeaderDefault from '../HeaderDefault.vue';

const createWrapper = (storeState = {}) =>
  shallowMount(HeaderDefault, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            dashboards: {
              currentDashboardFilters: [],
              ...storeState.dashboards,
            },
          },
          stubActions: false,
        }),
      ],
      stubs: {
        InsightsLayoutHeaderFilters: true,
        HeaderDashboardSettings: true,
      },
    },
  });

describe('HeaderDefault', () => {
  let wrapper;

  describe('Component rendering', () => {
    it('renders HeaderDashboardSettings always', () => {
      wrapper = createWrapper();
      expect(
        wrapper.findComponent({ name: 'HeaderDashboardSettings' }).exists(),
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
  });
});
