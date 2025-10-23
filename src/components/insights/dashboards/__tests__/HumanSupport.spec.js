import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { shallowMount, config } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import HumanSupport from '../HumanSupport.vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

config.global.plugins = [
  createI18n({
    legacy: false,
    messages: {
      en: {
        human_support_dashboard: {
          monitoring: 'Monitoring',
          analysis: 'Analysis',
        },
      },
    },
  }),
];

const mockIsFeatureFlagEnabled = vi.fn(() => true);
vi.mock('@/store/modules/featureFlag', () => ({
  useFeatureFlag: vi.fn(() => ({
    isFeatureFlagEnabled: mockIsFeatureFlagEnabled,
  })),
}));

const createWrapper = (options = {}) => {
  return shallowMount(HumanSupport, {
    global: {
      stubs: {
        UnnnicTab: {
          template: '<div data-testid="human-support-tab"><slot /></div>',
          props: ['tabs', 'activeTab'],
          emits: ['change'],
        },
        Analysis: true,
        Monitoring: true,
      },
      ...options.global,
    },
    ...options,
  });
};

describe('HumanSupport.vue', () => {
  let wrapper;
  let humanSupportStore;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    humanSupportStore = useHumanSupport();
    mockIsFeatureFlagEnabled.mockReturnValue(true);
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render the main dashboard section', () => {
      const dashboardSection = wrapper.find(
        '[data-testid="dashboard-human-support"]',
      );
      expect(dashboardSection.exists()).toBe(true);
      expect(dashboardSection.classes()).toContain('dashboard-human-support');
    });

    it('should render UnnnicTab component with correct props', () => {
      const tab = wrapper.find('[data-testid="human-support-tab"]');
      expect(tab.exists()).toBe(true);
      expect(tab.attributes('tabs')).toBe('monitoring,analysis');
      expect(tab.attributes('activetab')).toBe('monitoring');
    });
  });

  describe('Tab Configuration', () => {
    it('should have correct tabs configuration', () => {
      expect(wrapper.vm.tabs).toEqual({
        monitoring: {
          name: 'monitoring',
          component: expect.any(Object),
        },
        analysis: {
          name: 'analysis',
          component: expect.any(Object),
        },
      });
    });

    it('should generate correct tabsKeys array', () => {
      expect(wrapper.vm.tabsKeys).toEqual(['monitoring', 'analysis']);
    });

    it('should get active tab from store', () => {
      expect(wrapper.vm.activeTab).toBe('monitoring');
      expect(wrapper.vm.activeTab).toBe(humanSupportStore.activeTab);
    });
  });

  describe('Tab Switching with Store', () => {
    it('should update store when handleChangeTab is called', async () => {
      wrapper.vm.handleChangeTab('analysis');
      await nextTick();

      expect(humanSupportStore.activeTab).toBe('analysis');
      expect(wrapper.vm.activeTab).toBe('analysis');
    });

    it('should change active tab in store', async () => {
      humanSupportStore.setActiveTab('analysis');
      await nextTick();

      expect(wrapper.vm.activeTab).toBe('analysis');
    });

    it('should handle switching between all available tabs', async () => {
      const tabs = ['monitoring', 'analysis'];

      for (const tabName of tabs) {
        wrapper.vm.handleChangeTab(tabName);
        await nextTick();
        expect(humanSupportStore.activeTab).toBe(tabName);
        expect(wrapper.vm.activeTab).toBe(tabName);
      }
    });
  });

  describe('Store Integration', () => {
    it('should use activeTab from store', () => {
      expect(wrapper.vm.activeTab).toBe(humanSupportStore.activeTab);
    });

    it('should have access to setActiveTab from store', () => {
      expect(typeof wrapper.vm.setActiveTab).toBe('function');
    });

    it('should reflect store changes reactively', async () => {
      humanSupportStore.setActiveTab('analysis');
      await nextTick();

      expect(wrapper.vm.activeTab).toBe('analysis');

      humanSupportStore.setActiveTab('monitoring');
      await nextTick();

      expect(wrapper.vm.activeTab).toBe('monitoring');
    });
  });

  describe('Component Integration', () => {
    it('should have correct tab configuration structure', () => {
      expect(Object.keys(wrapper.vm.tabs)).toEqual(['monitoring', 'analysis']);
      expect(wrapper.vm.tabs.monitoring.name).toBe('monitoring');
      expect(wrapper.vm.tabs.analysis.name).toBe('analysis');
    });

    it('should render tab component correctly', () => {
      const tabComponent = wrapper.find('[data-testid="human-support-tab"]');
      expect(tabComponent.exists()).toBe(true);
    });
  });

  describe('Reactive Behavior', () => {
    it('should maintain reactivity when activeTab changes', async () => {
      const initialTab = wrapper.vm.activeTab;
      expect(initialTab).toBe('monitoring');

      wrapper.vm.handleChangeTab('analysis');
      await nextTick();

      expect(wrapper.vm.activeTab).toBe('analysis');
      expect(wrapper.vm.activeTab).not.toBe(initialTab);
    });

    it('should handle tab change with same tab name', async () => {
      const currentTab = wrapper.vm.activeTab;
      wrapper.vm.handleChangeTab(currentTab);
      await nextTick();

      expect(wrapper.vm.activeTab).toBe(currentTab);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid tab name', async () => {
      const invalidTab = 'invalid-tab';
      wrapper.vm.handleChangeTab(invalidTab);
      await nextTick();

      expect(humanSupportStore.activeTab).toBe(invalidTab);
    });

    it('should handle empty string tab name', async () => {
      wrapper.vm.handleChangeTab('');
      await nextTick();

      expect(humanSupportStore.activeTab).toBe('');
    });
  });

  describe('Component Props and Events', () => {
    it('should pass all required props to UnnnicTab', () => {
      const tabComponent = wrapper.find('[data-testid="human-support-tab"]');

      expect(tabComponent.attributes('tabs')).toBe('monitoring,analysis');
      expect(tabComponent.attributes('activetab')).toBe('monitoring');
      expect(tabComponent.attributes('data-testid')).toBe('human-support-tab');
    });

    it('should handle tab change function properly', async () => {
      expect(wrapper.vm.activeTab).toBe('monitoring');

      wrapper.vm.handleChangeTab('analysis');
      await nextTick();
      expect(wrapper.vm.activeTab).toBe('analysis');

      wrapper.vm.handleChangeTab('monitoring');
      await nextTick();
      expect(wrapper.vm.activeTab).toBe('monitoring');
    });
  });

  describe('Feature Flag', () => {
    it('should render component when feature flag is enabled', async () => {
      mockIsFeatureFlagEnabled.mockReturnValue(true);
      wrapper = createWrapper();
      await nextTick();

      const dashboardSection = wrapper.find(
        '[data-testid="dashboard-human-support"]',
      );

      expect(dashboardSection.exists()).toBe(true);
      expect(wrapper.vm.isEnabled).toBe(true);
    });

    it('should not render component when feature flag is disabled', async () => {
      mockIsFeatureFlagEnabled.mockReturnValue(false);
      wrapper = createWrapper();
      await nextTick();

      const dashboardSection = wrapper.find(
        '[data-testid="dashboard-human-support"]',
      );

      expect(dashboardSection.exists()).toBe(false);
      expect(wrapper.vm.isEnabled).toBe(false);
    });

    it('should call isFeatureFlagEnabled with correct flag name', () => {
      mockIsFeatureFlagEnabled.mockReturnValue(true);
      wrapper = createWrapper();

      expect(mockIsFeatureFlagEnabled).toHaveBeenCalledWith(
        'insights-new-human-dashboard',
      );
    });
  });
});
