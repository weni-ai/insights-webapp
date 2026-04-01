import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import NewMetric from '../NewMetric.vue';

const createWrapper = (options = {}) =>
  shallowMount(NewMetric, {
    global: {
      ...options.global,
    },
    ...options,
  });

describe('NewMetric', () => {
  it('renders root section with class new-metric', () => {
    const wrapper = createWrapper();
    const root = wrapper.find('.new-metric');
    expect(root.exists()).toBe(true);
    expect(root.element.tagName.toLowerCase()).toBe('section');
  });

  it('renders UnnnicIcon with add_2 icon and bg-active scheme', () => {
    const wrapper = createWrapper();
    const icon = wrapper.findComponent({ name: 'UnnnicIcon' });
    expect(icon.exists()).toBe(true);
    expect(icon.props('icon')).toBe('add_2');
    expect(icon.props('scheme')).toBe('bg-active');
  });

  it('wraps icon in a single section root (parent @click binds to this element)', () => {
    const wrapper = createWrapper();
    expect(wrapper.element).toBe(wrapper.find('.new-metric').element);
    expect(wrapper.findComponent({ name: 'UnnnicIcon' }).exists()).toBe(true);
  });
});
