import { beforeEach, describe, expect, it } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import WidgetError from '../WidgetError.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

describe('WidgetError', () => {
  let wrapper;

  const defaultProps = {
    title: 'Error Title',
    buttonText: 'Retry',
  };

  const createWrapper = (props = {}) =>
    mount(WidgetError, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UnnnicIcon: true,
          UnnnicButton: true,
        },
      },
    });

  const widgetError = () => wrapper.find('[data-testid="widget-error"]');
  const errorIcon = () => wrapper.find('[data-testid="widget-error-icon"]');
  const errorTitle = () => wrapper.find('[data-testid="widget-error-title"]');
  const errorButton = () => wrapper.find('[data-testid="widget-error-button"]');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render all elements', () => {
      expect(widgetError().exists()).toBe(true);
      expect(errorIcon().exists()).toBe(true);
      expect(errorTitle().exists()).toBe(true);
      expect(errorButton().exists()).toBe(true);
    });

    it('should display correct title text', () => {
      expect(errorTitle().text()).toBe(defaultProps.title);
    });

    it('should render with custom props', () => {
      const customProps = {
        title: 'Custom Error',
        buttonText: 'Custom Button',
      };
      wrapper = createWrapper(customProps);

      expect(errorTitle().text()).toBe(customProps.title);
      expect(errorButton().attributes('text')).toBe(customProps.buttonText);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(widgetError().classes()).toContain('widget-error');
      expect(errorTitle().classes()).toContain('widget-error__title');
    });

    it('should configure icon correctly', () => {
      expect(errorIcon().attributes('icon')).toBe('warning');
      expect(errorIcon().attributes('size')).toBe('md');
      expect(errorIcon().attributes('scheme')).toBe('feedback-red');
    });

    it('should configure button correctly', () => {
      expect(errorButton().attributes('type')).toBe('warning');
      expect(errorButton().attributes('text')).toBe(defaultProps.buttonText);
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Event handling', () => {
    it('should emit click event when button is clicked', async () => {
      await errorButton().trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('should emit click event when handleClick is called', () => {
      wrapper.vm.handleClick();

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')).toHaveLength(1);
    });
  });

  describe('Props validation', () => {
    const propTestCases = [
      { title: 'Short title', buttonText: 'OK' },
      {
        title: 'Very long error title that spans multiple lines',
        buttonText: 'Try Again',
      },
      { title: '', buttonText: 'Empty Title Test' },
      { title: 'Special chars: !@#$%', buttonText: 'Special Button: &*()' },
    ];

    propTestCases.forEach(({ title, buttonText }) => {
      it(`should handle props: title="${title}" buttonText="${buttonText}"`, () => {
        wrapper = createWrapper({ title, buttonText });

        expect(wrapper.props('title')).toBe(title);
        expect(wrapper.props('buttonText')).toBe(buttonText);
        expect(errorTitle().text()).toBe(title);
      });
    });
  });
});
