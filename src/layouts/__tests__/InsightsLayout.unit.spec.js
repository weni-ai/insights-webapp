import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useDashboards } from '@/store/modules/dashboards';
import { useOnboarding } from '@/store/modules/onboarding';
import InsightsLayout from '@/layouts/InsightsLayout.vue';

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
  },
}));

import { moduleStorage } from '@/utils/storage';

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
          McpDisclaimer: true,
        },
      },
      slots: {
        default: '<div data-testid="content-slot">Content</div>',
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    store = createTestingPinia({
      initialState: {
        dashboards: { currentDashboardFilters: [] },
        onboarding: { setOnboardingRef: mockSetOnboardingRef },
      },
    });

    wrapper = createWrapper();
  });

  describe('Initial Render', () => {
    it('renders the layout with InsightsLayoutHeader and default slot', async () => {
      const dashboardsStore = useDashboards();
      dashboardsStore.currentDashboardFilters = ['filter1'];
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
      const dashboardsStore = useDashboards();
      dashboardsStore.currentDashboardFilters = ['filter1'];
      await wrapper.vm.$nextTick();

      const insightsSection = wrapper.find('.insights-layout__insights');
      expect(insightsSection.exists()).toBe(true);
    });
  });

  describe('Vuex Actions', () => {
    it('calls setOnboardingRef mutation on mount with correct payload', () => {
      const onboardingStore = useOnboarding();
      const spy = vi.spyOn(onboardingStore, 'setOnboardingRef');
      createWrapper();
      expect(spy).toHaveBeenCalledWith({
        key: 'insights-layout',
        ref: wrapper.element,
      });
    });
  });

  describe('MCP Disclaimer', () => {
    it('should not show McpDisclaimer when storage returns null', () => {
      expect(wrapper.findComponent({ name: 'McpDisclaimer' }).exists()).toBe(
        false,
      );
    });

    it('should show McpDisclaimer when storage returns true', () => {
      moduleStorage.getItem.mockReturnValue(true);
      wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'McpDisclaimer' }).exists()).toBe(
        true,
      );
    });

    it('should hide McpDisclaimer when dismiss event is emitted', async () => {
      moduleStorage.getItem.mockReturnValue(true);
      wrapper = createWrapper();

      const disclaimer = wrapper.findComponent({ name: 'McpDisclaimer' });
      expect(disclaimer.exists()).toBe(true);

      await disclaimer.vm.$emit('dismiss');
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'McpDisclaimer' }).exists()).toBe(
        false,
      );
    });
  });

  it('matches snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
