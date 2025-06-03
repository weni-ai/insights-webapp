import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import SugestionCard from '@/components/SugestionCard.vue';

describe('SugestionCard', () => {
  let wrapper;

  const createWrapper = (props = {}, slots = {}) => {
    return mount(SugestionCard, {
      props,
      slots,
      global: {
        mocks: {
          $t: (key) => key,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render the component with correct structure', () => {
      expect(wrapper.find('[data-testid="sugestion-card"]').exists()).toBe(
        true,
      );
      expect(
        wrapper.find('[data-testid="sugestion-card-title"]').exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="sugestion-card-description"]').exists(),
      ).toBe(true);
    });
  });

  describe('Slots', () => {
    it('should render title slot content', () => {
      wrapper = createWrapper(
        {},
        {
          title: '<span data-testid="title-content">Test Title</span>',
        },
      );

      const titleSlot = wrapper.find('[data-testid="title-content"]');
      expect(titleSlot.exists()).toBe(true);
      expect(titleSlot.text()).toBe('Test Title');
    });

    it('should render description slot content', () => {
      wrapper = createWrapper(
        {},
        {
          description:
            '<span data-testid="description-content">Test Description</span>',
        },
      );

      const descriptionSlot = wrapper.find(
        '[data-testid="description-content"]',
      );
      expect(descriptionSlot.exists()).toBe(true);
      expect(descriptionSlot.text()).toBe('Test Description');
    });

    it('should render both slots simultaneously', () => {
      wrapper = createWrapper(
        {},
        {
          title: '<span data-testid="title-content">Test Title</span>',
          description:
            '<span data-testid="description-content">Test Description</span>',
        },
      );

      expect(wrapper.find('[data-testid="title-content"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="description-content"]').exists()).toBe(
        true,
      );
    });

    it('should render empty slots without content', () => {
      const title = wrapper.find('[data-testid="sugestion-card-title"]');
      const description = wrapper.find(
        '[data-testid="sugestion-card-description"]',
      );

      expect(title.text()).toBe('');
      expect(description.text()).toBe('');
    });
  });

  describe('Content Rendering', () => {
    it('should handle HTML content in slots', () => {
      wrapper = createWrapper(
        {},
        {
          title: '<strong>Bold Title</strong>',
          description: '<em>Italic Description</em>',
        },
      );

      const titleElement = wrapper.find('[data-testid="sugestion-card-title"]');
      const descriptionElement = wrapper.find(
        '[data-testid="sugestion-card-description"]',
      );

      expect(titleElement.html()).toContain('<strong>Bold Title</strong>');
      expect(descriptionElement.html()).toContain(
        '<em>Italic Description</em>',
      );
    });

    it('should handle long text with ellipsis styling structure', () => {
      const longText =
        'This is a very long description that should be truncated with ellipsis when it exceeds the maximum width defined in CSS';

      wrapper = createWrapper(
        {},
        {
          description: longText,
        },
      );

      const description = wrapper.find(
        '[data-testid="sugestion-card-description"]',
      );
      expect(description.text()).toBe(longText);
    });
  });

  describe('Component Integration', () => {
    it('should work as a standalone component', () => {
      expect(wrapper.vm).toBeDefined();
      expect(wrapper.element).toBeDefined();
    });

    it('should maintain structure when no props are passed', () => {
      wrapper = createWrapper();

      expect(wrapper.find('[data-testid="sugestion-card"]').exists()).toBe(
        true,
      );
      expect(
        wrapper.find('[data-testid="sugestion-card-title"]').exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="sugestion-card-description"]').exists(),
      ).toBe(true);
    });
  });
});
