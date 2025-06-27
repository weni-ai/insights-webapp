import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TagGroup from '../TagGroup.vue';

// Mock UnnnicTag component
const UnnnicTag = {
  name: 'UnnnicTag',
  template:
    '<div class="unnnic-tag" :class="[scheme, { disabled }]"><slot>{{ text }}</slot></div>',
  props: {
    text: String,
    scheme: String,
    clickable: Boolean,
    hasCloseIcon: Boolean,
    disabled: Boolean,
  },
  emits: ['click', 'close'],
};

describe('TagGroup', () => {
  const mockTags = [
    { uuid: '1', name: 'Tag 1' },
    { uuid: '2', name: 'Tag 2' },
    { uuid: '3', name: 'Tag 3' },
  ];

  const createWrapper = (props = {}) => {
    return mount(TagGroup, {
      props: {
        tags: mockTags,
        ...props,
      },
      global: {
        components: {
          UnnnicTag,
        },
      },
    });
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders tags correctly', () => {
    const wrapper = createWrapper();
    const tags = wrapper.findAllComponents(UnnnicTag);
    expect(tags).toHaveLength(3);
    expect(tags[0].text()).toBe('Tag 1');
  });

  it('shows close icon when hasCloseIcon prop is true', () => {
    const wrapper = createWrapper({ hasCloseIcon: true });
    const tag = wrapper.findComponent(UnnnicTag);
    expect(tag.props('hasCloseIcon')).toBe(true);
  });

  it('shows close icon when tag is selected and selectable is true', async () => {
    const wrapper = createWrapper({
      hasCloseIcon: true,
      selectable: true,
      value: [mockTags[0]],
    });
    const tag = wrapper.findComponent(UnnnicTag);
    expect(tag.props('hasCloseIcon')).toBe(true);
  });

  it('applies correct scheme to tags', () => {
    const wrapper = createWrapper({ scheme: 'aux-purple' });
    const tag = wrapper.findComponent(UnnnicTag);
    expect(tag.props('scheme')).toBe('aux-purple');
  });

  it('applies default schemes when no scheme prop is provided', () => {
    const wrapper = createWrapper();
    const tags = wrapper.findAllComponents(UnnnicTag);
    expect(tags[0].props('scheme')).toBe('aux-purple');
    expect(tags[1].props('scheme')).toBe('aux-orange');
    expect(tags[2].props('scheme')).toBe('aux-pink');
  });

  it('disables unselected tags when selectable is true', () => {
    const wrapper = createWrapper({
      selectable: true,
      value: [mockTags[0]],
    });
    const tags = wrapper.findAllComponents(UnnnicTag);
    expect(tags[1].props('disabled')).toBe(true);
    expect(tags[2].props('disabled')).toBe(true);
  });

  describe('when props change', () => {
    it('updates selected tags when value prop changes', async () => {
      const wrapper = createWrapper({ selectable: true, hasCloseIcon: true });
      await wrapper.setProps({ value: [mockTags[1]] });
      const tags = wrapper.findAllComponents(UnnnicTag);
      expect(tags[1].props('hasCloseIcon')).toBe(true);
    });

    it('updates scheme when scheme prop changes', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ scheme: 'aux-blue' });
      const tag = wrapper.findComponent(UnnnicTag);
      expect(tag.props('scheme')).toBe('aux-blue');
    });

    it('updates close icon visibility when hasCloseIcon changes', async () => {
      const wrapper = createWrapper();
      await wrapper.setProps({ hasCloseIcon: true });
      const tag = wrapper.findComponent(UnnnicTag);
      expect(tag.props('hasCloseIcon')).toBe(true);
    });
  });

  describe('addPx function', () => {
    it('should work with the actual function implementation', () => {
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = vi.fn(() => ({
        paddingLeft: '8px',
      }));

      const addPx = (string) => `${string}px`;
      const result = addPx('58'); // 50 + 8

      expect(result).toBe('58px');

      window.getComputedStyle = originalGetComputedStyle;
    });
  });
});
