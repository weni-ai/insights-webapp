import { beforeEach, describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { config } from '@vue/test-utils';

import BaseConversationWidget from '../BaseConversationWidget.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}, options = {}) => {
  return shallowMount(BaseConversationWidget, {
    props: {
      title: 'Test Widget Title',
      ...props,
    },
    ...options,
  });
};

describe('BaseConversationWidget', () => {
  let wrapper;

  const skeleton = () =>
    wrapper.findComponent('[data-testid="base-conversation-widget-skeleton"]');
  const widget = () => wrapper.find('[data-testid="base-conversation-widget"]');
  const header = () =>
    wrapper.find('[data-testid="base-conversation-widget-header"]');
  const title = () =>
    wrapper.find('[data-testid="base-conversation-widget-title"]');
  const actions = () =>
    wrapper.find('[data-testid="base-conversation-widget-actions"]');
  const tabs = () =>
    wrapper.findComponent('[data-testid="base-conversation-widget-tabs"]');

  describe('when component is rendered', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should render the component correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(widget().exists()).toBe(true);
    });

    it('should display the title correctly', () => {
      expect(title().exists()).toBe(true);
      expect(title().text()).toBe('Test Widget Title');
    });

    it('should render the header section', () => {
      expect(header().exists()).toBe(true);
    });

    it('should render the actions section', () => {
      expect(actions().exists()).toBe(true);
    });

    it('should render ShortTab component with correct props', () => {
      expect(tabs().exists()).toBe(true);

      const tabsProps = tabs().props('tabs');
      expect(tabsProps).toHaveLength(2);
      expect(tabsProps[0]).toEqual({
        name: 'AI',
        key: 'artificial-intelligence',
      });
      expect(tabsProps[1]).toEqual({
        name: 'Human Support',
        key: 'human-support',
      });
    });

    it('should not render skeleton loading when isLoading is false', () => {
      expect(skeleton().exists()).toBe(false);
    });
  });

  describe('when component is in loading state', () => {
    beforeEach(() => {
      wrapper = createWrapper({ isLoading: true });
    });

    it('should render skeleton loading component', () => {
      expect(skeleton().exists()).toBe(true);
    });

    it('should not render the main widget content', () => {
      expect(widget().exists()).toBe(false);
    });
  });

  describe('when title prop changes', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should update the displayed title', async () => {
      await wrapper.setProps({ title: 'New Widget Title' });

      expect(title().text()).toBe('New Widget Title');
    });
  });

  describe('when tab is changed', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should emit tab-change event when handleTabChange is called', async () => {
      await tabs().vm.$emit('tab-change', 'human-support');

      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual(['human-support']);
    });

    it('should emit correct tab key when different tabs are selected', async () => {
      await tabs().vm.$emit('tab-change', 'artificial-intelligence');
      expect(wrapper.emitted('tab-change')[0]).toEqual([
        'artificial-intelligence',
      ]);

      await tabs().vm.$emit('tab-change', 'human-support');
      expect(wrapper.emitted('tab-change')[1]).toEqual(['human-support']);
    });
  });

  describe('slots functionality', () => {
    it('should render default slot content', () => {
      wrapper = createWrapper(
        {},
        {
          slots: {
            default:
              '<div data-testid="default-slot-content">Default Content</div>',
          },
        },
      );

      expect(
        wrapper.find('[data-testid="default-slot-content"]').exists(),
      ).toBe(true);
      expect(wrapper.find('[data-testid="default-slot-content"]').text()).toBe(
        'Default Content',
      );
    });

    it('should render actions slot content', () => {
      wrapper = createWrapper(
        {},
        {
          slots: {
            actions:
              '<button data-testid="action-button">Action Button</button>',
          },
        },
      );

      expect(wrapper.find('[data-testid="action-button"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="action-button"]').text()).toBe(
        'Action Button',
      );
    });

    it('should render both default and actions slots', () => {
      wrapper = createWrapper(
        {},
        {
          slots: {
            default: '<div data-testid="default-content">Main Content</div>',
            actions: '<div data-testid="actions-content">Actions Content</div>',
          },
        },
      );

      expect(wrapper.find('[data-testid="default-content"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="actions-content"]').exists()).toBe(
        true,
      );
    });
  });
});
