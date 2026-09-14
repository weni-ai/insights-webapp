import { beforeEach, describe, expect, it } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';

import AddCustomizableWidget from '../AddCustomizableWidget.vue';

import {
  createTestI18n,
  UnnnicSystemPlugin,
  mockRouter,
} from '@tests/utils/testHelpers.js';

// Empty catalog so assertions that expect raw i18n keys keep working
config.global.plugins = [createTestI18n({}), UnnnicSystemPlugin, mockRouter];

const createWrapper = (props = {}) => {
  return shallowMount(AddCustomizableWidget, {
    props: { ...props },
    global: {
      stubs: {
        AddWidget: {
          template: '<div data-testid="add-widget"></div>',
          props: ['title', 'description', 'actionText'],
          emits: ['action'],
        },
      },
    },
  });
};

describe('AddCustomizableWidget', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const addWidget = () => wrapper.findComponent('[data-testid="add-widget"]');

  describe('Initial render', () => {
    it('should render AddWidget component', () => {
      expect(addWidget().exists()).toBe(true);
    });

    it('should pass correct props to AddWidget', () => {
      const addWidgetComponent = addWidget();

      expect(addWidgetComponent.props('title')).toBe(
        'conversations_dashboard.customize_your_dashboard.title',
      );
      expect(addWidgetComponent.props('description')).toBe(
        'conversations_dashboard.customize_your_dashboard.description',
      );
      expect(addWidgetComponent.props('actionText')).toBe(
        'conversations_dashboard.customize_your_dashboard.add_widget',
      );
    });
  });

  describe('Event handling', () => {
    it('should emit add event when AddWidget action is triggered', async () => {
      await addWidget().vm.$emit('action');

      expect(wrapper.emitted('add')).toBeTruthy();
      expect(wrapper.emitted('add')).toHaveLength(1);
    });

    it('should emit add event without parameters', async () => {
      await addWidget().vm.$emit('action');

      expect(wrapper.emitted('add')[0]).toEqual([]);
    });
  });

  describe('Component lifecycle', () => {
    it('should handle component mounting correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(addWidget().exists()).toBe(true);
    });

    it('should handle component unmounting without errors', () => {
      wrapper.unmount();
      expect(wrapper.exists()).toBe(false);
    });
  });
});
