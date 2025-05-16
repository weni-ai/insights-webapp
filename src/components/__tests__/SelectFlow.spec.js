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

  it('should have placeholder option in flowsOptions', () => {
    const placeholderTranslated = {
      value: '',
      label: wrapper.vm.$t('drawers.config_funnel.select_flow'),
    };
    expect(wrapper.vm.flowsOptions).toContainEqual(placeholderTranslated);
  });

  it('should transform modelValue string to array', async () => {
    wrapper = createWrapper({ modelValue: 'flow1' });
    expect(wrapper.vm.flow).toEqual([{ value: 'flow1', label: 'Flow 1' }]);
  });

  it('should transform modelValue object to array', async () => {
    const modelValue = { value: 'flow2', label: 'Flow 2' };
    wrapper = createWrapper({ modelValue });
    expect(wrapper.vm.flow).toEqual([modelValue]);
  });

  it('should keep modelValue array as array', async () => {
    const modelValue = [{ value: 'flow1', label: 'Flow 1' }];
    wrapper = createWrapper({ modelValue });
    expect(wrapper.vm.flow).toEqual(modelValue);
  });

  it('should clear selected flow if modelValue its cleaned', () => {
    wrapper = createWrapper({ modelValue: '' });
    expect(wrapper.vm.flow[0].value).toBe('');
  });

  it('should update flow correctly when user selects an option', async () => {
    wrapper = createWrapper({ modelValue: '' });
    await wrapper.setData({ flow: [{ value: 'flow2', label: 'Flow 2' }] });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()['update:model-value'][1][0]).toEqual('flow2');
  });
});
