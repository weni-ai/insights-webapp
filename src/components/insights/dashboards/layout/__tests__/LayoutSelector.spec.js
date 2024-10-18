import { describe, expect, it } from 'vitest';
import { mount, config } from '@vue/test-utils';
import LayoutSelector from '../LayoutSelector.vue';
import { createI18n } from 'vue-i18n';
import DynamicGrid from '../DynamicGrid.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];
config.global.mocks = {
  $t: (key) => key,
};

const createWrapper = (props = {}, options = {}) => {
  return mount(LayoutSelector, {
    props: {
      ...props,
    },
    global: {
      components: {
        DynamicGrid,
      },
      mocks: {
        $t: (key) => key,
      },
      ...options.global,
    },
  });
};

describe('LayoutSelector', () => {
  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.layout_selector').exists()).toBeTruthy();
  });

  it('renders all layout buttons', () => {
    const wrapper = createWrapper();
    const buttons = wrapper.findAll('.layout_button');
    expect(buttons).toHaveLength(4);
  });

  it('renders DynamicGrid component for each layout', () => {
    const wrapper = createWrapper();
    const grids = wrapper.findAllComponents(DynamicGrid);
    expect(grids).toHaveLength(4);
  });

  it('initializes with correct default selected layout', () => {
    const wrapper = createWrapper();
    const activeButton = wrapper.find('.layout_button-active');
    expect(activeButton.exists()).toBeTruthy();
    expect(wrapper.vm.selectedLayout).toBe(1);
  });

  it('passes correct props to DynamicGrid components', () => {
    const wrapper = createWrapper();
    const grids = wrapper.findAllComponents(DynamicGrid);

    const layouts = [1, 2, 3, 0];
    grids.forEach((grid, index) => {
      expect(grid.props('numberCards')).toBe(layouts[index]);
      expect(grid.props('active')).toBe(layouts[index] === 1);
    });
  });

  describe('layout selection', () => {
    it('updates selectedLayout when clicking a button', async () => {
      const wrapper = createWrapper();
      const button = wrapper.find('[data-test-id="layout_button-3"]');

      await button.trigger('click');
      expect(wrapper.vm.selectedLayout).toBe(0);
    });

    it('emits layoutSelected event with correct value', async () => {
      const wrapper = createWrapper();
      const button = wrapper.find('[data-test-id="layout_button-2"]');

      await button.trigger('click');

      expect(wrapper.emitted()).toHaveProperty('layoutSelected');
      expect(wrapper.emitted('layoutSelected')[0]).toEqual([3]);
    });

    it('applies active classes to selected layout button', async () => {
      const wrapper = createWrapper();
      const button = wrapper.find('[data-test-id="layout_button-2"]');

      await button.trigger('click');

      expect(button.classes()).toContain('layout_button-active');
      expect(button.find('.layout_button_container').classes()).toContain(
        'layout_button_container-active',
      );
    });

    it('removes active classes from previously selected button', async () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('.layout_button');

      expect(buttons[0].classes()).toContain('layout_button-active');

      await buttons[2].trigger('click');

      expect(buttons[0].classes()).not.toContain('layout_button-active');
      expect(
        buttons[0].find('.layout_button_container').classes(),
      ).not.toContain('layout_button_container-active');
    });
  });

  describe('button styling', () => {
    it('applies correct base classes to all buttons', () => {
      const wrapper = createWrapper();
      const buttons = wrapper.findAll('.layout_button');

      buttons.forEach((button) => {
        expect(button.classes()).toContain('layout_button');
        expect(button.find('.layout_button_container').exists()).toBeTruthy();
      });
    });

    it('applies correct active classes to initially selected button', () => {
      const wrapper = createWrapper();
      const activeButton = wrapper.find('.layout_button-active');

      expect(activeButton.exists()).toBeTruthy();
      expect(
        activeButton.find('.layout_button_container-active').exists(),
      ).toBeTruthy();
    });
  });

  describe('DynamicGrid integration', () => {
    it('updates DynamicGrid active prop when selection changes', async () => {
      const wrapper = createWrapper();
      const button = wrapper.find('[data-test-id="layout_button-2"]');

      await button.trigger('click');

      const grids = wrapper.findAllComponents(DynamicGrid);
      grids.forEach((grid, index) => {
        expect(grid.props('active')).toBe(wrapper.vm.layouts[index] === 3);
      });
    });
  });
});
