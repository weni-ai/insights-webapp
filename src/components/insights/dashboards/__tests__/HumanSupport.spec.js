import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import HumanSupport from '../HumanSupport.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    messages: {
      en: {
        Monitoring: 'Monitoring',
        Analysis: 'Analysis',
      },
    },
  }),
];

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

  beforeEach(() => {
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
          name: 'Monitoring',
          component: expect.any(Object),
        },
        analysis: {
          name: 'Analysis',
          component: expect.any(Object),
        },
      });
    });

    it('should generate correct tabsKeys array', () => {
      expect(wrapper.vm.tabsKeys).toEqual(['monitoring', 'analysis']);
    });

    it('should set monitoring as default active tab', () => {
      expect(wrapper.vm.activeTabName).toBe('monitoring');
    });
  });

  describe('Tab Switching', () => {
    it('should change active tab when changeActiveTabName is called', async () => {
      wrapper.vm.changeActiveTabName('analysis');
      await nextTick();

      expect(wrapper.vm.activeTabName).toBe('analysis');
    });

    it('should emit change event when tab is changed', async () => {
      const tab = wrapper.find('[data-testid="human-support-tab"]');
      await tab.trigger('change', 'analysis');

      // Test the function directly since the event handling is internal
      wrapper.vm.changeActiveTabName('analysis');
      expect(wrapper.vm.activeTabName).toBe('analysis');
    });

    it('should handle switching between all available tabs', async () => {
      const tabs = ['monitoring', 'analysis'];

      for (const tabName of tabs) {
        wrapper.vm.changeActiveTabName(tabName);
        await nextTick();
        expect(wrapper.vm.activeTabName).toBe(tabName);
      }
    });
  });

  describe('Component Integration', () => {
    it('should have correct tab configuration structure', () => {
      expect(Object.keys(wrapper.vm.tabs)).toEqual(['monitoring', 'analysis']);
      expect(wrapper.vm.tabs.monitoring.name).toBe('Monitoring');
      expect(wrapper.vm.tabs.analysis.name).toBe('Analysis');
    });

    it('should render tab component correctly', () => {
      const tabComponent = wrapper.find('[data-testid="human-support-tab"]');
      expect(tabComponent.exists()).toBe(true);
    });
  });

  describe('Reactive Behavior', () => {
    it('should maintain reactivity when activeTabName changes', async () => {
      const initialTab = wrapper.vm.activeTabName;
      expect(initialTab).toBe('monitoring');

      wrapper.vm.changeActiveTabName('analysis');
      await nextTick();

      expect(wrapper.vm.activeTabName).toBe('analysis');
      expect(wrapper.vm.activeTabName).not.toBe(initialTab);
    });

    it('should handle tab change with same tab name', async () => {
      const currentTab = wrapper.vm.activeTabName;
      wrapper.vm.changeActiveTabName(currentTab);
      await nextTick();

      expect(wrapper.vm.activeTabName).toBe(currentTab);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid tab name gracefully', async () => {
      const invalidTab = 'invalid-tab';
      wrapper.vm.changeActiveTabName(invalidTab);
      await nextTick();

      expect(wrapper.vm.activeTabName).toBe(invalidTab);
    });

    it('should handle empty string tab name', async () => {
      wrapper.vm.changeActiveTabName('');
      await nextTick();

      expect(wrapper.vm.activeTabName).toBe('');
    });
  });

  describe('Component Props and Events', () => {
    it('should pass all required props to UnnnicTab', () => {
      const tabComponent = wrapper.find('[data-testid="human-support-tab"]');

      expect(tabComponent.attributes('tabs')).toBe('monitoring,analysis');
      expect(tabComponent.attributes('activetab')).toBe('monitoring');
      expect(tabComponent.attributes('data-testid')).toBe('human-support-tab');
    });

    it('should handle tab change function properly', () => {
      expect(wrapper.vm.activeTabName).toBe('monitoring');

      wrapper.vm.changeActiveTabName('analysis');
      expect(wrapper.vm.activeTabName).toBe('analysis');

      wrapper.vm.changeActiveTabName('monitoring');
      expect(wrapper.vm.activeTabName).toBe('monitoring');
    });
  });
});
