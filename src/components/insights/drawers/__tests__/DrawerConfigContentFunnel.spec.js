import { flushPromises, shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';

import DrawerConfigContentFunnel from '../DrawerConfigContentFunnel.vue';

const flowsRef = ref([
  { value: 'flow-1', label: 'Flow 1' },
  { value: 'flow-2', label: 'Flow 2' },
]);

vi.mock('@/store/modules/project', () => ({
  useProject: () => ({ $id: 'project' }),
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => {
      if (store?.$id === 'project') {
        return { flows: flowsRef };
      }
      return actual.storeToRefs(store);
    },
  };
});

const createWrapper = (props = {}) =>
  shallowMount(DrawerConfigContentFunnel, {
    props: {
      modelValue: {},
      ...props,
    },
    global: {
      plugins: [createTestingPinia()],
      stubs: {
        FormAccordion: {
          name: 'FormAccordion',
          props: ['active', 'title', 'validConfig'],
          emits: ['update:active'],
          template: '<div class="accordion-stub"><slot name="content" /></div>',
        },
        SelectFlow: true,
        UnnnicLabel: true,
        UnnnicInput: true,
        UnnnicButton: {
          name: 'UnnnicButton',
          props: ['text', 'disabled', 'type', 'iconLeft'],
          emits: ['click'],
          template:
            '<button class="btn-stub" :disabled="disabled" @click="$emit(\'click\')">{{ text }}</button>',
        },
      },
    },
  });

describe('DrawerConfigContentFunnel.vue', () => {
  beforeEach(() => {
    flowsRef.value = [
      { value: 'flow-1', label: 'Flow 1' },
      { value: 'flow-2', label: 'Flow 2' },
    ];
  });

  it('starts with three metrics and disables primary button', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.vm.metrics).toHaveLength(3);
    expect(wrapper.emitted('update-disable-primary-button')).toBeTruthy();
    expect(wrapper.emitted('update-disable-primary-button').at(-1)[0]).toBe(
      true,
    );
  });

  it('adds fourth and fifth metrics then stops at 5', async () => {
    const wrapper = createWrapper();

    wrapper.vm.addMetric();
    wrapper.vm.addMetric();
    wrapper.vm.addMetric();

    expect(wrapper.vm.metrics).toHaveLength(5);
  });

  it('clears fields for base metrics and removes created metrics', async () => {
    const wrapper = createWrapper();
    wrapper.vm.metrics[0].name = 'Metric 1';
    wrapper.vm.metrics[0].flow = 'flow-1';
    wrapper.vm.addMetric();

    expect(wrapper.vm.metrics).toHaveLength(4);

    wrapper.vm.clearFields(3);
    expect(wrapper.vm.metrics).toHaveLength(3);

    wrapper.vm.clearFields(0);
    expect(wrapper.vm.metrics[0].name).toBe('');
    expect(wrapper.vm.metrics[0].flow).toBe('');
  });

  it('clearAllFields clears values and removes extra metrics', async () => {
    const wrapper = createWrapper();
    wrapper.vm.metrics[0].name = 'A';
    wrapper.vm.metrics[0].flow = 'flow-1';
    wrapper.vm.addMetric();
    wrapper.vm.addMetric();

    wrapper.vm.clearAllFields();

    expect(wrapper.vm.metrics).toHaveLength(3);
    expect(
      wrapper.vm.metrics.every((m) => m.name === '' && m.flow === ''),
    ).toBe(true);
  });

  it('hydrates metrics from modelValue.config', async () => {
    const wrapper = createWrapper({
      modelValue: {
        config: {
          m1: { name: 'First', filter: { flow: 'flow-1' } },
          m2: { name: 'Second', filter: { flow: 'flow-2' } },
          m3: { name: 'Third', filter: { flow: 'flow-1' } },
          m4: { name: 'Fourth', filter: { flow: 'flow-2' } },
        },
      },
    });
    await flushPromises();

    expect(wrapper.vm.metrics[0].name).toBe('First');
    expect(wrapper.vm.metrics[0].flow).toBe('flow-1');
    expect(wrapper.vm.metrics).toHaveLength(4);
  });

  it('updates active metric and emits reset-widget', async () => {
    const wrapper = createWrapper();

    wrapper.vm.updateActiveMetric(1, true);
    expect(wrapper.vm.activeMetric).toBe(1);
    expect(wrapper.vm.metrics[1].active).toBe(true);

    wrapper.vm.updateActiveMetric(1, false);
    expect(wrapper.vm.activeMetric).toBeNull();

    wrapper.vm.resetWidget();
    expect(wrapper.emitted('reset-widget')).toBeTruthy();
  });

  it('enables primary button when metrics become valid and changed', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    wrapper.vm.metrics[0].name = 'A';
    wrapper.vm.metrics[0].flow = 'flow-1';
    wrapper.vm.metrics[1].name = 'B';
    wrapper.vm.metrics[1].flow = 'flow-2';
    wrapper.vm.metrics[2].name = 'C';
    wrapper.vm.metrics[2].flow = 'flow-1';
    await flushPromises();

    expect(wrapper.emitted('update-disable-primary-button').at(-1)[0]).toBe(
      false,
    );
  });
});
