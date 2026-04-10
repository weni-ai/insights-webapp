import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SelectFlow from '@/components/SelectFlow.vue';

describe('SelectFlow.vue', () => {
  let wrapper;
  let selectFlowLabel;

  const createWrapper = (props) => {
    const store = createTestingPinia({
      initialState: {
        project: {
          flows: [
            { value: 'flow1', label: 'Flow 1' },
            { value: 'flow2', label: 'Flow 2' },
          ],
        },
      },
    });
    return mount(SelectFlow, {
      props,
      global: {
        mocks: {
          $t: (msg) => msg,
        },
        plugins: [store],
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper({ modelValue: '' });

    selectFlowLabel = wrapper.get('[data-testid=select-flow-label]');
  });

  it('should select flow label exists', () => {
    expect(selectFlowLabel.exists()).toBe(true);
  });

  it('should contain project flows in flowsOptions', () => {
    expect(wrapper.vm.flowsOptions).toContainEqual({
      value: 'flow1',
      label: 'Flow 1',
    });
    expect(wrapper.vm.flowsOptions).toContainEqual({
      value: 'flow2',
      label: 'Flow 2',
    });
  });

  it('should set flow to string value when modelValue is a string', async () => {
    wrapper = createWrapper({ modelValue: 'flow1' });
    expect(wrapper.vm.flow).toBe('flow1');
  });

  it('should extract value from modelValue object', async () => {
    const modelValue = { value: 'flow2', label: 'Flow 2' };
    wrapper = createWrapper({ modelValue });
    expect(wrapper.vm.flow).toBe('flow2');
  });

  it('should extract value from modelValue array', async () => {
    const modelValue = [{ value: 'flow1', label: 'Flow 1' }];
    wrapper = createWrapper({ modelValue });
    expect(wrapper.vm.flow).toBe('flow1');
  });

  it('should clear selected flow if modelValue is empty', () => {
    wrapper = createWrapper({ modelValue: '' });
    expect(wrapper.vm.flow).toBe('');
  });

  it('should update flow correctly when user selects an option', async () => {
    wrapper = createWrapper({ modelValue: '' });
    await wrapper.setData({ flow: 'flow2' });
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted()['update:model-value'];
    expect(emitted[emitted.length - 1][0]).toEqual('flow2');
  });
});
