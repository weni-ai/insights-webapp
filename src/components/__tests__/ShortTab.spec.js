import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import ShortTab from '../ShortTab.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const defaultProps = {
  tabs: [
    { name: 'Tab 1', key: 'tab1' },
    { name: 'Tab 2', key: 'tab2' },
    { name: 'Tab 3', key: 'tab3' },
  ],
};

const createWrapper = (props = {}) => {
  return mount(ShortTab, {
    global: { plugins: [UnnnicSystem] },
    props: { ...defaultProps, ...props },
  });
};

const expectElementExists = (wrapper, testId, shouldExist = true) => {
  expect(wrapper.find(`[data-testid="${testId}"]`).exists()).toBe(shouldExist);
};

const expectElementText = (wrapper, testId, expectedText) => {
  expect(wrapper.find(`[data-testid="${testId}"]`).text()).toBe(expectedText);
};

describe('ShortTab.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    const requiredElements = [
      'short-tab',
      'short-tab-container',
      'short-tab-button-0',
      'short-tab-button-1',
      'short-tab-button-2',
    ];

    requiredElements.forEach((testId) => {
      it(`should render ${testId} element`, () => {
        expectElementExists(wrapper, testId);
      });
    });

    it('should render correct number of tab buttons', () => {
      const buttons = wrapper.findAll('[data-testid^="short-tab-button-"]');
      expect(buttons).toHaveLength(3);
    });

    it('should apply correct CSS classes', () => {
      expect(wrapper.find('[data-testid="short-tab"]').classes()).toContain(
        'short-tab',
      );
      expect(
        wrapper.find('[data-testid="short-tab-container"]').classes(),
      ).toContain('short-tab__tabs');
      expect(
        wrapper.find('[data-testid="short-tab-button-0"]').classes(),
      ).toContain('short-tab__tab');
    });
  });

  describe('Content Rendering', () => {
    it('should render tab names correctly', () => {
      expectElementText(wrapper, 'short-tab-button-0', 'Tab 1');
      expectElementText(wrapper, 'short-tab-button-1', 'Tab 2');
      expectElementText(wrapper, 'short-tab-button-2', 'Tab 3');
    });

    it('should render different tab configurations', async () => {
      const customTabs = [
        { name: 'Custom Tab', key: 'custom' },
        { name: 'Another Tab', key: 'another' },
      ];

      await wrapper.setProps({ tabs: customTabs });

      expectElementText(wrapper, 'short-tab-button-0', 'Custom Tab');
      expectElementText(wrapper, 'short-tab-button-1', 'Another Tab');

      const buttons = wrapper.findAll('[data-testid^="short-tab-button-"]');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('Active Tab State', () => {
    it('should have first tab active by default', () => {
      expect(wrapper.vm.activeTab).toBe(0);
      expect(
        wrapper.find('[data-testid="short-tab-button-0"]').classes(),
      ).toContain('short-tab__tab--active');
    });

    it('should respect custom defaultTab prop', async () => {
      await wrapper.setProps({ defaultTab: 1 });

      expect(wrapper.vm.activeTab).toBe(1);
      expect(
        wrapper.find('[data-testid="short-tab-button-1"]').classes(),
      ).toContain('short-tab__tab--active');
    });

    it('should switch active tab when clicked', async () => {
      const secondButton = wrapper.find('[data-testid="short-tab-button-1"]');
      await secondButton.trigger('click');

      expect(wrapper.vm.activeTab).toBe(1);
      expect(
        wrapper.find('[data-testid="short-tab-button-1"]').classes(),
      ).toContain('short-tab__tab--active');
      expect(
        wrapper.find('[data-testid="short-tab-button-0"]').classes(),
      ).not.toContain('short-tab__tab--active');
    });

    it('should not change when clicking same active tab', async () => {
      const firstButton = wrapper.find('[data-testid="short-tab-button-0"]');
      await firstButton.trigger('click');

      expect(wrapper.vm.activeTab).toBe(0);
      expect(wrapper.emitted('tab-change')).toBeFalsy();
    });
  });

  describe('Event Emission', () => {
    it('should emit tab-change event with correct key when switching tabs', async () => {
      const secondButton = wrapper.find('[data-testid="short-tab-button-1"]');
      await secondButton.trigger('click');

      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual(['tab2']);
    });

    it('should emit different keys for different tabs', async () => {
      const thirdButton = wrapper.find('[data-testid="short-tab-button-2"]');
      await thirdButton.trigger('click');

      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual(['tab3']);
    });

    it('should not emit when clicking already active tab', async () => {
      const firstButton = wrapper.find('[data-testid="short-tab-button-0"]');
      await firstButton.trigger('click');

      expect(wrapper.emitted('tab-change')).toBeFalsy();
    });
  });

  describe('Props Integration', () => {
    it('should handle single tab correctly', async () => {
      const singleTab = [{ name: 'Only Tab', key: 'only' }];
      await wrapper.setProps({ tabs: singleTab });

      expectElementExists(wrapper, 'short-tab-button-0');
      expectElementExists(wrapper, 'short-tab-button-1', false);
      expectElementText(wrapper, 'short-tab-button-0', 'Only Tab');
      expect(
        wrapper.find('[data-testid="short-tab-button-0"]').classes(),
      ).toContain('short-tab__tab--active');
    });

    it('should handle complete props configuration', async () => {
      const props = {
        tabs: [
          { name: 'First', key: 'first' },
          { name: 'Second', key: 'second' },
        ],
        defaultTab: 1,
      };

      await wrapper.setProps(props);

      expect(wrapper.vm.activeTab).toBe(1);
      expectElementText(wrapper, 'short-tab-button-0', 'First');
      expectElementText(wrapper, 'short-tab-button-1', 'Second');
      expect(
        wrapper.find('[data-testid="short-tab-button-1"]').classes(),
      ).toContain('short-tab__tab--active');
    });
  });

  describe('Method Testing', () => {
    it('should execute switchTab method correctly', async () => {
      await wrapper.vm.switchTab(2);

      expect(wrapper.vm.activeTab).toBe(2);
      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual(['tab3']);
    });

    it('should not execute switchTab when index is same as active', async () => {
      await wrapper.vm.switchTab(0);

      expect(wrapper.vm.activeTab).toBe(0);
      expect(wrapper.emitted('tab-change')).toBeFalsy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tabs array', async () => {
      await wrapper.setProps({ tabs: [] });

      const buttons = wrapper.findAll('[data-testid^="short-tab-button-"]');
      expect(buttons).toHaveLength(0);
    });

    it('should handle invalid defaultTab gracefully', async () => {
      await wrapper.setProps({ defaultTab: 99 });

      expect(wrapper.vm.activeTab).toBe(99);
      expect(
        wrapper.find('[data-testid="short-tab-button-0"]').classes(),
      ).not.toContain('short-tab__tab--active');
    });

    it('should handle tabs with special characters', async () => {
      const specialTabs = [
        { name: 'Tab & More', key: 'tab-special' },
        { name: 'Tab > Other', key: 'tab-greater' },
      ];

      await wrapper.setProps({ tabs: specialTabs });

      expectElementText(wrapper, 'short-tab-button-0', 'Tab & More');
      expectElementText(wrapper, 'short-tab-button-1', 'Tab > Other');
    });
  });

  describe('Reactivity', () => {
    it('should update when tabs prop changes', async () => {
      expect(wrapper.vm.$props.tabs).toHaveLength(3);

      const newTabs = [{ name: 'New Tab', key: 'new' }];
      await wrapper.setProps({ tabs: newTabs });

      expect(wrapper.vm.$props.tabs).toHaveLength(1);
      expectElementText(wrapper, 'short-tab-button-0', 'New Tab');
    });
  });
});
