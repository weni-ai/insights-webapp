import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';

import CardConversations from '../CardConversations.vue';

import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

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

const defaultProps = {
  title: 'Test Title',
  value: '123',
};

const createWrapper = (props = {}) => {
  return mount(CardConversations, {
    global: { plugins: [UnnnicSystem] },
    props: { ...defaultProps, ...props },
  });
};

describe('CardConversations.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Loading State', () => {
    it('should show skeleton loading when isLoading is true', async () => {
      await wrapper.setProps({ isLoading: true });

      expect(wrapper.find('[data-testid="card-skeleton"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="card-conversations"]').exists()).toBe(
        false,
      );
    });

    it('should hide skeleton loading when isLoading is false', () => {
      expect(wrapper.find('[data-testid="card-skeleton"]').exists()).toBe(
        false,
      );
      expect(wrapper.find('[data-testid="card-conversations"]').exists()).toBe(
        true,
      );
    });
  });

  describe('Content Rendering', () => {
    it('should render title and value correctly', () => {
      expect(wrapper.find('[data-testid="card-title"]').text()).toBe(
        'Test Title',
      );
      expect(wrapper.find('[data-testid="card-value"]').text()).toBe('123');
    });

    it('should render description when provided', async () => {
      await wrapper.setProps({ description: 'Test Description' });

      expect(wrapper.find('[data-testid="card-description"]').exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-testid="card-description"]').text()).toBe(
        'Test Description',
      );
    });

    it('should not render description when not provided', () => {
      expect(wrapper.find('[data-testid="card-description"]').exists()).toBe(
        false,
      );
    });

    it('should render valueDescription when provided', async () => {
      await wrapper.setProps({ valueDescription: 'Low' });

      expect(
        wrapper.find('[data-testid="card-value-description"]').exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="card-value-description"]').text(),
      ).toBe('Low');
    });

    it('should not render valueDescription when not provided', () => {
      expect(
        wrapper.find('[data-testid="card-value-description"]').exists(),
      ).toBe(false);
    });
  });

  describe('Tooltip Functionality', () => {
    it('should render tooltip when tooltipInfo is provided', async () => {
      await wrapper.setProps({ tooltipInfo: 'Test Tooltip' });

      expect(
        wrapper.find('[data-testid="card-conversations-tooltip"]').exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="card-conversations-info-icon"]').exists(),
      ).toBe(true);
    });

    it('should not render tooltip when tooltipInfo is not provided', () => {
      expect(
        wrapper.find('[data-testid="card-conversations-tooltip"]').exists(),
      ).toBe(false);
      expect(
        wrapper.find('[data-testid="card-conversations-info-icon"]').exists(),
      ).toBe(false);
    });
  });

  describe('Border Radius Classes', () => {
    const borderRadiusTests = [
      {
        borderRadius: 'full',
        expectedClass: 'card-conversations--border-full',
      },
      {
        borderRadius: 'left',
        expectedClass: 'card-conversations--border-left',
      },
      {
        borderRadius: 'right',
        expectedClass: 'card-conversations--border-right',
      },
      {
        borderRadius: 'none',
        expectedClass: 'card-conversations--border-none',
      },
    ];

    borderRadiusTests.forEach(({ borderRadius, expectedClass }) => {
      it(`should apply ${expectedClass} class when borderRadius is ${borderRadius}`, async () => {
        await wrapper.setProps({ borderRadius });

        expect(
          wrapper.find('[data-testid="card-conversations"]').classes(),
        ).toContain(expectedClass);
      });
    });

    it('should default to full border radius when not specified', () => {
      expect(
        wrapper.find('[data-testid="card-conversations"]').classes(),
      ).toContain('card-conversations--border-full');
    });
  });

  describe('Active Description Gap', () => {
    it('should apply active gap class when activeDescriptionGap is true', async () => {
      await wrapper.setProps({
        activeDescriptionGap: true,
        description: 'Test Description',
      });

      expect(wrapper.find('[data-testid="card-content"]').classes()).toContain(
        'card-conversations__content--active-gap',
      );
    });

    it('should not apply active gap class when activeDescriptionGap is false', async () => {
      await wrapper.setProps({
        activeDescriptionGap: false,
        description: 'Test Description',
      });

      expect(
        wrapper.find('[data-testid="card-content"]').classes(),
      ).not.toContain('card-conversations__content--active-gap');
    });

    it('should not apply active gap class when activeDescriptionGap is not provided', () => {
      expect(
        wrapper.find('[data-testid="card-content"]').classes(),
      ).not.toContain('card-conversations__content--active-gap');
    });
  });

  describe('Enable Time Icon', () => {
    it('should show time icon and apply value class when enableTimeIcon is true', async () => {
      await wrapper.setProps({ enableTimeIcon: true });

      const timeIcon = wrapper.find('[data-testid="card-time-icon"]');
      const valueSection = wrapper.find('.card-conversations__value');

      expect(timeIcon.exists()).toBe(true);
      expect(valueSection.classes()).toContain(
        'card-conversations__value--enable-time-icon',
      );
    });

    it('should not show time icon and not apply value class when enableTimeIcon is false', async () => {
      await wrapper.setProps({ enableTimeIcon: false });

      const timeIcon = wrapper.find('[data-testid="card-time-icon"]');
      const valueSection = wrapper.find('.card-conversations__value');

      expect(timeIcon.exists()).toBe(false);
      expect(valueSection.classes()).not.toContain(
        'card-conversations__value--enable-time-icon',
      );
    });

    it('should not show time icon and not apply value class when enableTimeIcon is not provided', () => {
      const timeIcon = wrapper.find('[data-testid="card-time-icon"]');
      const valueSection = wrapper.find('.card-conversations__value');

      expect(timeIcon.exists()).toBe(false);
      expect(valueSection.classes()).not.toContain(
        'card-conversations__value--enable-time-icon',
      );
    });
  });

  describe('Clickable Functionality', () => {
    it('should apply clickable class when isClickable is true', async () => {
      await wrapper.setProps({ isClickable: true });

      expect(
        wrapper.find('[data-testid="card-conversations"]').classes(),
      ).toContain('card-conversations--clickable');
    });

    it('should not apply clickable class when isClickable is false', async () => {
      await wrapper.setProps({ isClickable: false });

      expect(
        wrapper.find('[data-testid="card-conversations"]').classes(),
      ).not.toContain('card-conversations--clickable');
    });

    it('should not apply clickable class when isClickable is not provided', () => {
      expect(
        wrapper.find('[data-testid="card-conversations"]').classes(),
      ).not.toContain('card-conversations--clickable');
    });

    it('should emit click event when card is clicked', async () => {
      await wrapper.setProps({ isClickable: true });

      await wrapper.find('[data-testid="card-conversations"]').trigger('click');

      expect(wrapper.emitted()).toHaveProperty('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('should emit click event even when isClickable is false', async () => {
      await wrapper.setProps({ isClickable: false });

      await wrapper.find('[data-testid="card-conversations"]').trigger('click');

      expect(wrapper.emitted()).toHaveProperty('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
    });
  });

  describe('Complete Integration', () => {
    it('should render all elements when all props are provided', async () => {
      const props = {
        title: 'Complete Test',
        value: '456',
        description: 'Complete Description',
        valueDescription: 'High',
        tooltipInfo: 'Complete Tooltip',
        borderRadius: 'left',
        activeDescriptionGap: true,
        enableTimeIcon: true,
      };

      await wrapper.setProps(props);

      expect(wrapper.find('[data-testid="card-title"]').text()).toBe(
        props.title,
      );
      expect(wrapper.find('[data-testid="card-value"]').text()).toBe(
        props.value,
      );
      expect(wrapper.find('[data-testid="card-description"]').text()).toBe(
        props.description,
      );
      expect(
        wrapper.find('[data-testid="card-value-description"]').text(),
      ).toBe(props.valueDescription);
      expect(
        wrapper.find('[data-testid="card-conversations-tooltip"]').exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="card-conversations"]').classes(),
      ).toContain('card-conversations--border-left');
      expect(wrapper.find('[data-testid="card-content"]').classes()).toContain(
        'card-conversations__content--active-gap',
      );
      expect(wrapper.find('.card-conversations__value').classes()).toContain(
        'card-conversations__value--enable-time-icon',
      );
      expect(wrapper.find('[data-testid="card-time-icon"]').exists()).toBe(
        true,
      );
    });

    it('should render minimal elements when only required props are provided', () => {
      expect(wrapper.find('[data-testid="card-title"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="card-value"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="card-description"]').exists()).toBe(
        false,
      );
      expect(
        wrapper.find('[data-testid="card-value-description"]').exists(),
      ).toBe(false);
      expect(
        wrapper.find('[data-testid="card-conversations-tooltip"]').exists(),
      ).toBe(false);
    });
  });
});
