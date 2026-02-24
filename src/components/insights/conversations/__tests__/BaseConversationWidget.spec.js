import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { config } from '@vue/test-utils';

import BaseConversationWidget from '../BaseConversationWidget.vue';
import i18n from '@/utils/plugins/i18n';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}, options = {}) => {
  return mount(BaseConversationWidget, {
    props: {
      title: 'Test Widget Title',
      ...props,
    },
    global: {
      stubs: {
        ShortTab: true,
      },
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
  const dropdown = () => wrapper.find('[data-testid="actions-dropdown"]');
  const dropdownItems = () => wrapper.findAll('[data-testid="action"]');

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
        name: i18n.global.t('conversations_dashboard.artificial_intelligence'),
        key: 'artificial-intelligence',
      });
      expect(tabsProps[1]).toEqual({
        name: i18n.global.t('conversations_dashboard.human_support'),
        key: 'human-support',
      });
    });

    it('should not render skeleton loading when isLoading is false', () => {
      expect(skeleton().exists()).toBe(false);
    });

    it('should not render dropdown when no actions are provided', () => {
      expect(dropdown().exists()).toBe(false);
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

  describe('actions functionality', () => {
    const mockActions = [
      {
        icon: 'edit',
        text: 'Edit Widget',
        onClick: vi.fn(),
        scheme: 'weni-500',
      },
      {
        icon: 'delete',
        text: 'Delete Widget',
        onClick: vi.fn(),
        scheme: 'aux-red-500',
      },
      {
        icon: 'copy',
        text: 'Duplicate Widget',
        onClick: vi.fn(),
        // No scheme - should use fallback
      },
    ];

    beforeEach(() => {
      wrapper = createWrapper({ actions: mockActions });
    });

    it('should render dropdown when actions are provided', () => {
      expect(dropdown().exists()).toBe(true);
    });

    it('should render correct number of dropdown items', () => {
      expect(dropdownItems()).toHaveLength(3);
    });

    it('should render action icons with correct props', () => {
      const icons = wrapper.findAll('[data-testid="action-icon"]');

      expect(icons[0].attributes()).toMatchObject({
        icon: 'edit',
        size: 'sm',
        scheme: 'weni-500',
      });

      expect(icons[1].attributes()).toMatchObject({
        icon: 'delete',
        size: 'sm',
        scheme: 'aux-red-500',
      });

      expect(icons[2].attributes()).toMatchObject({
        icon: 'copy',
        size: 'sm',
        scheme: 'neutral-dark',
      });
    });

    it('should apply correct color utility classes to action text', () => {
      const actionTexts = wrapper.findAll('[data-testid="action-text"]');

      actionTexts.forEach((actionText, i) => {
        expect(actionText.classes()).toContain('u');

        if (wrapper.vm.actions[i].scheme) {
          expect(actionText.classes()).toContain(
            `color-${wrapper.vm.actions[i].scheme}`,
          );
        } else {
          expect(actionText.classes()).toContain('color-neutral-dark');
        }
      });
    });

    it('should display correct action text content', () => {
      const actionTexts = wrapper.findAll('.action__text');

      expect(actionTexts[0].text()).toBe('Edit Widget');
      expect(actionTexts[1].text()).toBe('Delete Widget');
      expect(actionTexts[2].text()).toBe('Duplicate Widget');
    });

    it('should call onClick handler when action is clicked', async () => {
      await dropdownItems()[0].trigger('click');

      expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);
    });

    it('should maintain action order in dropdown', () => {
      const actionTexts = wrapper.findAll('[data-testid="action-text"]');

      expect(actionTexts[0].text()).toBe('Edit Widget');
      expect(actionTexts[1].text()).toBe('Delete Widget');
      expect(actionTexts[2].text()).toBe('Duplicate Widget');
    });
  });
});
