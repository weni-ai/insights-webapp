import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, inject } from 'vue';

import LazyWidget from '../LazyWidget.vue';
import { LazyVisibilityKey } from '@/composables/useLazyData';

let observerCallback = null;

vi.mock('@vueuse/core', () => ({
  useIntersectionObserver: vi.fn((_target, cb) => {
    observerCallback = cb;
    return { stop: vi.fn() };
  }),
}));

const Probe = defineComponent({
  setup() {
    const visibility = inject(LazyVisibilityKey);
    return { visibility };
  },
  template: '<span class="probe" />',
});

const mountLazy = (props = {}) =>
  mount(LazyWidget, {
    props,
    slots: { default: () => h(Probe) },
    global: { stubs: { LazyWidget: false } },
  });

const triggerIntersection = (isIntersecting) => {
  observerCallback?.([{ isIntersecting }]);
};

describe('LazyWidget', () => {
  beforeEach(() => {
    observerCallback = null;
  });

  it('renders its default slot', () => {
    const wrapper = mountLazy();
    expect(wrapper.find('.probe').exists()).toBe(true);
  });

  it('provides lazy visibility to slotted content', () => {
    const wrapper = mountLazy();
    const probe = wrapper.findComponent(Probe);

    expect(probe.vm.visibility).toBeTruthy();
    expect(probe.vm.visibility.hasBeenVisible.value).toBe(false);
    expect(probe.vm.visibility.isVisible.value).toBe(false);
  });

  it('marks the widget visible when it intersects the viewport', async () => {
    const wrapper = mountLazy();
    const probe = wrapper.findComponent(Probe);

    triggerIntersection(true);
    await wrapper.vm.$nextTick();

    expect(probe.vm.visibility.isVisible.value).toBe(true);
    expect(probe.vm.visibility.hasBeenVisible.value).toBe(true);
  });

  it('keeps hasBeenVisible true after leaving the viewport', async () => {
    const wrapper = mountLazy();
    const probe = wrapper.findComponent(Probe);

    triggerIntersection(true);
    triggerIntersection(false);
    await wrapper.vm.$nextTick();

    expect(probe.vm.visibility.isVisible.value).toBe(false);
    expect(probe.vm.visibility.hasBeenVisible.value).toBe(true);
  });

  it('forces visibility when forceVisible prop is true', () => {
    const wrapper = mountLazy({ forceVisible: true });
    const probe = wrapper.findComponent(Probe);

    expect(probe.vm.visibility.hasBeenVisible.value).toBe(true);
    expect(probe.vm.visibility.isVisible.value).toBe(true);
  });

  it('forces visibility when forceVisible becomes true', async () => {
    const wrapper = mountLazy({ forceVisible: false });
    const probe = wrapper.findComponent(Probe);

    expect(probe.vm.visibility.hasBeenVisible.value).toBe(false);

    await wrapper.setProps({ forceVisible: true });

    expect(probe.vm.visibility.hasBeenVisible.value).toBe(true);
  });
});
