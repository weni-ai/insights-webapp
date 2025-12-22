import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import Info from '../Info.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        info: {
          description:
            'This dashboard provides insights into conversational data',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const createWrapper = () => {
  return mount(Info, {
    global: {
      stubs: {
        UnnnicIcon: true,
      },
      mocks: {
        $t: (key) => key,
      },
    },
  });
};

describe('Info.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render info section correctly', () => {
      expect(wrapper.find('[data-testid="info-section"]').exists()).toBe(true);
    });

    it('should have correct CSS class', () => {
      const section = wrapper.find('[data-testid="info-section"]');
      expect(section.classes()).toContain('dashboard-conversational__info');
    });

    it('should render icon with correct attributes', () => {
      const icon = wrapper.findComponent({ name: 'UnnnicIcon' });
      expect(icon.exists()).toBe(true);
      expect(icon.attributes('icon')).toBe('info');
      expect(icon.attributes('size')).toBe('sm');
      expect(icon.attributes('scheme')).toBe('feedback-blue');
      expect(icon.attributes('data-testid')).toBe('info-icon');
    });

    it('should render description text', () => {
      const description = wrapper.find('[data-testid="info-description"]');
      expect(description.exists()).toBe(true);
      expect(description.classes()).toContain(
        'dashboard-conversational__info__description',
      );
    });
  });

  describe('Content and Translation', () => {
    it('should use correct translation key for description', () => {
      const description = wrapper.find('[data-testid="info-description"]');
      expect(description.text()).toBe(
        'conversations_dashboard.info.description',
      );
    });
  });

  describe('Component Integration', () => {
    it('should render all required elements', () => {
      expect(wrapper.find('[data-testid="info-section"]').exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'UnnnicIcon' }).exists()).toBe(true);
      expect(wrapper.find('[data-testid="info-description"]').exists()).toBe(
        true,
      );
    });

    it('should have proper component hierarchy', () => {
      const section = wrapper.find('[data-testid="info-section"]');
      const icon = section.findComponent({ name: 'UnnnicIcon' });
      const description = section.find('[data-testid="info-description"]');

      expect(icon.exists()).toBe(true);
      expect(description.exists()).toBe(true);
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount component successfully', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm).toBeDefined();
    });

    it('should maintain component integrity after updates', async () => {
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-testid="info-section"]').exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'UnnnicIcon' }).exists()).toBe(true);
      expect(wrapper.find('[data-testid="info-description"]').exists()).toBe(
        true,
      );
    });
  });

  describe('Styling and CSS', () => {
    it('should apply correct CSS classes to section', () => {
      const section = wrapper.find('[data-testid="info-section"]');
      expect(section.classes()).toEqual(
        expect.arrayContaining(['dashboard-conversational__info']),
      );
    });

    it('should apply correct CSS classes to description', () => {
      const description = wrapper.find('[data-testid="info-description"]');
      expect(description.classes()).toEqual(
        expect.arrayContaining(['dashboard-conversational__info__description']),
      );
    });
  });

  describe('Icon Configuration', () => {
    const iconProps = [
      { prop: 'icon', value: 'info' },
      { prop: 'size', value: 'sm' },
      { prop: 'scheme', value: 'feedback-blue' },
    ];

    iconProps.forEach(({ prop, value }) => {
      it(`should have ${prop} prop set to ${value}`, () => {
        const icon = wrapper.findComponent({ name: 'UnnnicIcon' });
        expect(icon.attributes(prop)).toBe(value);
      });
    });
  });

  describe('Accessibility and Data Attributes', () => {
    const testIds = [
      { selector: 'info-section', shouldExist: true },
      { selector: 'info-icon', shouldExist: true },
      { selector: 'info-description', shouldExist: true },
    ];

    testIds.forEach(({ selector, shouldExist }) => {
      it(`should ${shouldExist ? 'have' : 'not have'} data-testid="${selector}"`, () => {
        const element = wrapper.find(`[data-testid="${selector}"]`);
        expect(element.exists()).toBe(shouldExist);
      });
    });
  });

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      expect(() => createWrapper()).not.toThrow();
    });

    it('should contain exactly one icon component', () => {
      const icons = wrapper.findAllComponents({ name: 'UnnnicIcon' });
      expect(icons).toHaveLength(1);
    });

    it('should contain exactly one description paragraph', () => {
      const descriptions = wrapper.findAll('[data-testid="info-description"]');
      expect(descriptions).toHaveLength(1);
    });
  });

  describe('HTML Structure Validation', () => {
    it('should use section element as root', () => {
      const root = wrapper.find('[data-testid="info-section"]');
      expect(root.element.tagName.toLowerCase()).toBe('section');
    });

    it('should use paragraph element for description', () => {
      const description = wrapper.find('[data-testid="info-description"]');
      expect(description.element.tagName.toLowerCase()).toBe('p');
    });
  });

  describe('Component Properties', () => {
    it('should have no props defined', () => {
      expect(wrapper.vm.$props).toEqual({});
    });

    it('should be a presentational component', () => {
      expect(wrapper.vm.$options.emits).toBeUndefined();
    });
  });
});
