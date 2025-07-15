import { beforeEach, describe, expect, it } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import AddWidget from '../AddWidget.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}) => {
  return shallowMount(AddWidget, {
    props: { ...props },
    global: {
      stubs: {
        UnnnicDrawer: {
          template: '<div><slot name="content" /></div>',
        },
      },
    },
  });
};

describe('AddWidget', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const addWidgetSection = () => wrapper.find('[data-testid="add-widget"]');
  const addWidgetTitle = () => wrapper.find('[data-testid="add-widget-title"]');
  const addWidgetDescription = () =>
    wrapper.find('[data-testid="add-widget-description"]');
  const addWidgetButton = () =>
    wrapper.find('[data-testid="add-widget-button"]');
  const addWidgetDrawer = () =>
    wrapper.find('[data-testid="add-widget-drawer"]');
  const addWidgetDrawerItems = () =>
    wrapper.findAll('[data-testid="add-widget-drawer-item"]');
  const addWidgetDrawerItemsTitles = () =>
    wrapper.findAll('[data-testid="add-widget-drawer-item-title"]');
  const addWidgetDrawerItemsDescriptions = () =>
    wrapper.findAll('[data-testid="add-widget-drawer-item-description"]');

  describe('Initial render', () => {
    it('should render the component with correct title and description', () => {
      expect(addWidgetSection().exists()).toBe(true);
      expect(addWidgetTitle().text()).toBe(
        'conversations_dashboard.customize_your_dashboard.title',
      );
      expect(addWidgetDescription().text()).toBe(
        'conversations_dashboard.customize_your_dashboard.description',
      );
    });

    it('should render the add widget button', () => {
      expect(addWidgetButton().exists()).toBe(true);
    });

    it('should not render the drawer initially', () => {
      expect(addWidgetDrawer().exists()).toBe(false);
    });
  });

  describe('Drawer functionality', () => {
    it('should open the drawer when add widget button is clicked', async () => {
      await addWidgetButton().trigger('click');
      await nextTick();

      expect(addWidgetDrawer().exists()).toBe(true);
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);
    });

    it('should close the drawer when close event is emitted', async () => {
      await addWidgetButton().trigger('click');
      await nextTick();

      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);

      await addWidgetDrawer().trigger('close');
      await nextTick();

      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
    });

    it('should toggle drawer state when handleDrawerAddWidget is called', async () => {
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);

      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(true);

      wrapper.vm.handleDrawerAddWidget();
      await nextTick();
      expect(wrapper.vm.isAddWidgetDrawerOpen).toBe(false);
    });
  });

  describe('Available widgets', () => {
    it('should render the correct number of available widgets', async () => {
      await addWidgetButton().trigger('click');
      await nextTick();

      expect(addWidgetDrawerItems()).toHaveLength(2);
    });

    it('should render CSAT widget with correct name and description', async () => {
      await addWidgetButton().trigger('click');
      await nextTick();

      expect(addWidgetDrawerItemsTitles()[0].text()).toBe('CSAT');
      expect(addWidgetDrawerItemsDescriptions()[0].text()).toBe(
        'The Customer Satisfaction Score indicates the contact level of satisfaction with the service received.',
      );
    });

    it('should render NPS widget with correct name and description', async () => {
      await addWidgetButton().trigger('click');
      await nextTick();

      expect(addWidgetDrawerItemsTitles()[1].text()).toBe('NPS');
      expect(addWidgetDrawerItemsDescriptions()[1].text()).toBe(
        'The Net Promoter Score indicates how likely contact are to recommend the service they received to others.',
      );
    });

    it('should have the correct widget data structure', () => {
      expect(wrapper.vm.availableWidgets).toStrictEqual([
        {
          name: expect.any(String),
          description: expect.any(String),
        },
        {
          name: expect.any(String),
          description: expect.any(String),
        },
      ]);
    });
  });
});
