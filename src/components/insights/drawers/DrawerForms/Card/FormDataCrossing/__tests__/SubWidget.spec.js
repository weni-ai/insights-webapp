import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import SubWidget from '../SubWidget.vue';
import FormAccordion from '@/components/FormAccordion.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';

describe('SubWidget.vue', () => {
  const defaultProps = {
    config: {
      result_type: 'executions',
      operation: 'count',
      flow: {
        uuid: '',
        result: '',
        result_correspondence: '',
      },
    },
    title: 'Test Widget',
    active: true,
  };

  const createWrapper = (props = {}) => {
    return mount(SubWidget, {
      props: {
        ...defaultProps,
        ...props,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          SelectFlow: true,
          RadioList: true,
          SelectFlowResult: true,
        },
      },
    });
  };

  it('renders properly with default props', async () => {
    const wrapper = createWrapper();
    console.log(wrapper.html());
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('[data-testid="select-flow"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="radio-list-result-type"]').exists(),
    ).toBe(true);
  });

  it('emits update:active when accordion active state changes', async () => {
    const wrapper = createWrapper();
    await wrapper.findComponent(FormAccordion).vm.$emit('update:active', false);
    expect(wrapper.emitted('update:active')).toBeTruthy();
    expect(wrapper.emitted('update:active')[0]).toEqual([false]);
  });

  it('shows flow result section when result_type is flow_result', async () => {
    const wrapper = createWrapper({
      config: {
        ...defaultProps.config,
        result_type: 'flow_result',
      },
    });

    expect(wrapper.findComponent(SelectFlowResult).exists()).toBe(true);
  });

  it('hides flow result section when result_type is executions', async () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent(SelectFlowResult).exists()).toBe(false);
  });

  it('emits update:config when config changes', async () => {
    const wrapper = createWrapper();
    const newConfig = {
      ...defaultProps.config,
      flow: {
        ...defaultProps.config.flow,
        uuid: 'test-uuid',
      },
    };

    await wrapper.setData({ configLocal: newConfig });
    expect(wrapper.emitted('update:config')).toBeTruthy();
  });

  it('validates config correctly for executions type', async () => {
    const wrapper = createWrapper({
      config: {
        ...defaultProps.config,
        result_type: 'executions',
        flow: {
          ...defaultProps.config.flow,
          uuid: 'test-uuid',
        },
      },
    });

    expect(wrapper.vm.isValidConfig).toBe(true);
  });

  it('validates config correctly for flow_result type', async () => {
    const wrapper = createWrapper({
      config: {
        ...defaultProps.config,
        result_type: 'flow_result',
        flow: {
          ...defaultProps.config.flow,
          uuid: 'test-uuid',
          result: 'test-result',
        },
        operation: 'sum',
      },
    });

    expect(wrapper.vm.isValidConfig).toBe(true);
  });

  it('returns false validation when required fields are missing', async () => {
    const wrapper = createWrapper({
      config: {
        ...defaultProps.config,
        result_type: 'flow_result',
        flow: {
          ...defaultProps.config.flow,
          uuid: 'test-uuid',
        },
      },
    });

    expect(wrapper.vm.isValidConfig).toBe(false);
  });
});
