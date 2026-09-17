import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import RemoveMetricModal from '../RemoveMetricModal.vue';

const createWrapper = (props = {}) =>
  mount(RemoveMetricModal, {
    props: {
      modelValue: true,
      metric: { uuid: 'm-1', name: 'Metric A' },
      parentName: 'Parent Widget',
      ...props,
    },
    global: {
      stubs: {
        ModalRemoveWidget: {
          name: 'ModalRemoveWidget',
          props: ['modelValue', 'type', 'size', 'name', 'uuid', 'title'],
          emits: ['update:modelValue', 'success'],
          template:
            '<div class="modal-remove-stub" data-testid="absolute-numbers-metric-remove-modal"><slot name="description" /></div>',
        },
      },
    },
  });

describe('RemoveMetricModal.vue', () => {
  it('renders modal when modelValue is true', () => {
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="absolute-numbers-metric-remove-modal"]')
        .exists(),
    ).toBe(true);
    expect(wrapper.text()).toContain('Metric A');
  });

  it('does not render modal when modelValue is false', () => {
    const wrapper = createWrapper({ modelValue: false });
    expect(
      wrapper
        .find('[data-testid="absolute-numbers-metric-remove-modal"]')
        .exists(),
    ).toBe(false);
  });

  it('syncs showModal computed with update:modelValue', async () => {
    const wrapper = createWrapper();
    wrapper.vm.showModal = false;
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('forwards success emit from ModalRemoveWidget', async () => {
    const wrapper = createWrapper();
    await wrapper
      .findComponent({ name: 'ModalRemoveWidget' })
      .vm.$emit('success');
    expect(wrapper.emitted('success')).toBeTruthy();
  });
});
