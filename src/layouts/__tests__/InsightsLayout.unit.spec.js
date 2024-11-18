import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import InsightsLayout from '@/layouts/InsightsLayout.vue';

describe('InsightsLayout', () => {
  let wrapper;
  let store;
  const mockSetOnboardingRef = vi.fn();

  const createWrapper = () => {
    return mount(InsightsLayout, {
      global: {
        plugins: [store],
        stubs: {
          InsightsLayoutHeader: true,
        },
      },
      slots: {
        default: '<div data-testid="content-slot">Content</div>',
      },
    });
  };

  beforeEach(() => {
    store = createStore({
      modules: {
        dashboards: {
          namespaced: true,
          state: {
            currentDashboardFilters: [],
          },
        },
        onboarding: {
          namespaced: true,
          mutations: {
            SET_ONBOARDING_REF: mockSetOnboardingRef,
          },
        },
      },
    });

    wrapper = createWrapper();
  });

  describe('Initial Render', () => {
    it('renders the layout with InsightsLayoutHeader and default slot', async () => {
      store.state.dashboards.currentDashboardFilters = ['filter1'];
      await wrapper.vm.$nextTick();
      expect(
        wrapper.findComponent({ name: 'InsightsLayoutHeader' }).exists(),
      ).toBe(true);

      const contentSlot = wrapper.find('[data-testid="content-slot"]');
      expect(contentSlot.exists()).toBe(true);
      expect(contentSlot.text()).toBe('Content');
    });

    it('does not display the insights section if there are no currentDashboardFilters', () => {
      const insightsSection = wrapper.find('.insights-layout__insights');
      expect(insightsSection.exists()).toBe(false);
    });
  });

  describe('Dashboard Filters', () => {
    it('displays the insights section when currentDashboardFilters are present', async () => {
      store.state.dashboards.currentDashboardFilters = ['filter1'];
      await wrapper.vm.$nextTick();

      const insightsSection = wrapper.find('.insights-layout__insights');
      expect(insightsSection.exists()).toBe(true);
    });
  });

  describe('Vuex Actions', () => {
    it('calls setOnboardingRef mutation on mount with correct payload', () => {
      expect(mockSetOnboardingRef).toHaveBeenCalledWith(expect.any(Object), {
        key: 'insights-layout',
        ref: wrapper.element,
      });
    });
  });

  it('matches snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
