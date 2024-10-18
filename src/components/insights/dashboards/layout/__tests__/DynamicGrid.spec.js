import { describe, expect, it } from 'vitest';
import { mount, config } from '@vue/test-utils';
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

const createWrapper = (props = {}) => {
  return mount(DynamicGrid, {
    props: {
      numberCards: 0,
      active: false,
      ...props,
    },
    global: {
      mocks: {
        $t: (key) => key,
      },
    },
  });
};

describe('DynamicGrid', () => {
  it('computes gridLayoutClass correctly', () => {
    [0, 1, 2, 3].forEach((number) => {
      const wrapper = createWrapper({ numberCards: number });
      expect(wrapper.classes()).toContain('grid_layout');
      expect(wrapper.classes()).toContain(`layout-${number}`);
    });
  });

  it('computes boxes array correctly', () => {
    const expectedLengths = {
      0: 9, // 9 - 2 * 0
      1: 7, // 9 - 2 * 1
      2: 5, // 9 - 2 * 2
      3: 3, // 9 - 2 * 3
    };

    Object.entries(expectedLengths).forEach(([numberCards, expectedLength]) => {
      const wrapper = createWrapper({ numberCards: Number(numberCards) });
      const boxes = wrapper.findAll('.box');
      expect(boxes).toHaveLength(expectedLength);
    });
  });

  describe('getBoxClass method', () => {
    it('returns correct classes when numberCards is 0', () => {
      const wrapper = createWrapper({ numberCards: 0 });
      const boxes = wrapper.findAll('.box');
      boxes.forEach((box) => {
        expect(box.classes()).toContain('box');
        expect(box.classes()).not.toContain('box-filled');
      });
    });

    it('returns correct classes when numberCards is 1', () => {
      const wrapper = createWrapper({ numberCards: 1 });
      const boxes = wrapper.findAll('.box');

      expect(boxes[2].classes()).toContain('box-filled');
      expect(boxes[2].classes()).toContain('box-3');

      boxes.forEach((box, index) => {
        if (index !== 2) {
          expect(box.classes()).not.toContain('box-filled');
        }
      });
    });

    it('returns correct classes when numberCards is 2', () => {
      const wrapper = createWrapper({ numberCards: 2 });
      const boxes = wrapper.findAll('.box');

      expect(boxes[3].classes()).toContain('box-filled');
      expect(boxes[3].classes()).toContain('box-2');

      expect(boxes[4].classes()).toContain('box-filled');
      expect(boxes[4].classes()).toContain('box-3');

      [0, 1, 2].forEach((index) => {
        expect(boxes[index].classes()).not.toContain('box-filled');
      });
    });

    it('returns correct classes when numberCards is 3', () => {
      const wrapper = createWrapper({ numberCards: 3 });
      const boxes = wrapper.findAll('.box');

      expect(boxes[0].classes()).toContain('box-filled');
      expect(boxes[0].classes()).toContain('box-1');

      expect(boxes[1].classes()).toContain('box-filled');
      expect(boxes[1].classes()).toContain('box-2');

      expect(boxes[2].classes()).toContain('box-filled');
      expect(boxes[2].classes()).toContain('box-3');
    });
  });

  it('applies active class when active prop is true', async () => {
    const wrapper = createWrapper({ numberCards: 0, active: true });
    const boxes = wrapper.findAll('.box');

    boxes.forEach((box) => {
      expect(box.classes()).toContain('box-active');
    });
  });

  it('does not apply active class when active prop is false', () => {
    const wrapper = createWrapper({ numberCards: 0, active: false });
    const boxes = wrapper.findAll('.box');

    boxes.forEach((box) => {
      expect(box.classes()).not.toContain('box-active');
    });
  });

  it('renders correct classes structure', () => {
    const wrapper = createWrapper({ numberCards: 0 });
    expect(wrapper.find('.grid_layout').exists()).toBeTruthy();

    expect(wrapper.find('.grid_layout').classes()).toStrictEqual([
      'grid_layout',
      'layout-0',
    ]);
  });

  it('computes boxes array correctly with invalid numberCards values', () => {
    const invalidValues = [-1, 4, 10];

    invalidValues.forEach((invalidNumber) => {
      const wrapper = createWrapper({ numberCards: invalidNumber });
      const boxes = wrapper.findAll('.box');

      expect(boxes).toHaveLength(0);
    });
  });
});
