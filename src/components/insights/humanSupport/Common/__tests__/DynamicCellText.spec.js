import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';

import DynamicCellText from '../DynamicCellText.vue';

config.global.plugins = [];

const defaultProps = {
  text: 'Ana Costa',
};

const createWrapper = (props = {}) => {
  return mount(DynamicCellText, {
    props: { ...defaultProps, ...props },
  });
};

describe('DynamicCellText.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Text rendering', () => {
    it('should render the text', () => {
      const text = wrapper.find('[data-testid="dynamic-cell-text"]');
      expect(text.text()).toBe('Ana Costa');
    });

    it('should update text when prop changes', async () => {
      await wrapper.setProps({ text: 'Bruno Lima' });
      const text = wrapper.find('[data-testid="dynamic-cell-text"]');
      expect(text.text()).toBe('Bruno Lima');
    });
  });

  describe('Muted state', () => {
    it('should not apply muted class by default', () => {
      const text = wrapper.find('[data-testid="dynamic-cell-text"]');
      expect(text.classes()).not.toContain('dynamic-cell-text--muted');
    });

    it('should apply muted class when isDeleted is true', () => {
      wrapper = createWrapper({ isDeleted: true });
      const text = wrapper.find('[data-testid="dynamic-cell-text"]');
      expect(text.classes()).toContain('dynamic-cell-text--muted');
    });

    it('should not apply muted class when isDeleted is false', () => {
      wrapper = createWrapper({ isDeleted: false });
      const text = wrapper.find('[data-testid="dynamic-cell-text"]');
      expect(text.classes()).not.toContain('dynamic-cell-text--muted');
    });
  });

  describe('Tooltip', () => {
    it('should have tooltip disabled by default', () => {
      expect(wrapper.attributes('enabled')).toBe('false');
    });

    it('should enable tooltip when isDeleted is true', () => {
      wrapper = createWrapper({
        isDeleted: true,
        tooltipText: 'Representative removed from project',
      });
      expect(wrapper.attributes('enabled')).toBe('true');
    });

    it('should pass correct tooltip text', () => {
      const tooltipText = 'Sector removed from project';
      wrapper = createWrapper({
        isDeleted: true,
        tooltipText,
      });
      expect(wrapper.attributes('text')).toBe(tooltipText);
    });
  });
});
