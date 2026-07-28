import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import OperationalAlertForm from '../OperationalAlertForm.vue';
import Projects from '@/services/api/resources/projects';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    getProjectManagers: vi.fn(),
  },
}));

const FilterMultiSelectStub = {
  name: 'FilterMultiSelect',
  props: ['modelValue', 'fetchRequest', 'keyValueField', 'placeholder'],
  emits: ['update:model-value'],
  template: '<div data-testid="recipients-select-stub" />',
};

const defaultModel = () => ({
  enabled: true,
  threshold: 5,
  unit: 'm',
  recipients: [],
  roomsThresholdCount: 5,
});

const createWrapper = (modelValue = defaultModel()) => {
  const wrapper = mount(OperationalAlertForm, {
    global: {
      stubs: {
        FilterMultiSelect: FilterMultiSelectStub,
      },
    },
    props: {
      metric: 'waiting_time',
      modelValue,
      'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value }),
    },
  });

  return { wrapper };
};

describe('OperationalAlertForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Projects.getProjectManagers.mockResolvedValue({
      results: [
        {
          uuid: 'agent-1',
          name: 'Ana Silva',
          email: 'ana@example.com',
        },
        {
          uuid: 'agent-2',
          name: '',
          email: 'bob@example.com',
        },
      ],
    });
  });

  it('should render threshold, unit and recipients fields', () => {
    const { wrapper } = createWrapper();
    expect(
      wrapper.find('[data-testid="threshold-input-waiting_time"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-testid="unit-select-waiting_time"]').exists(),
    ).toBe(true);
    expect(wrapper.findComponent(FilterMultiSelectStub).exists()).toBe(true);
  });

  it('should load managers through FilterMultiSelect using fetchRequest and email key', () => {
    const { wrapper } = createWrapper();
    const select = wrapper.findComponent(FilterMultiSelectStub);

    expect(select.props('fetchRequest')).toEqual(expect.any(Function));
    expect(select.props('keyValueField')).toBe('email');
  });

  it('should update recipients when FilterMultiSelect emits selected managers', async () => {
    const { wrapper } = createWrapper();
    const select = wrapper.findComponent(FilterMultiSelectStub);

    await select.vm.$emit('update:model-value', [
      { value: 'ana@example.com', label: 'Ana Silva' },
      { value: 'bob@example.com', label: 'bob@example.com' },
    ]);

    expect(wrapper.props('modelValue').recipients).toEqual([
      'ana@example.com',
      'bob@example.com',
    ]);
  });

  it('should use a metric-specific threshold placeholder', async () => {
    const { wrapper } = createWrapper();
    const getThresholdPlaceholder = () =>
      wrapper
        .findAllComponents({ name: 'UnnnicInput' })
        .find((input) =>
          String(input.attributes('data-testid') || '').startsWith(
            'threshold-input-',
          ),
        )
        ?.props('placeholder');

    expect(getThresholdPlaceholder()).toBe('Example: 10');

    await wrapper.setProps({ metric: 'first_response_time' });
    expect(getThresholdPlaceholder()).toBe('Example: 2');

    await wrapper.setProps({ metric: 'conversation_duration' });
    expect(getThresholdPlaceholder()).toBe('Example: 30');
  });

  it('should always show the when field', async () => {
    const { wrapper } = createWrapper();
    expect(
      wrapper.find('[data-testid="when-input-waiting_time"]').exists(),
    ).toBe(true);
  });

  it('should expose the unit options including the default minutes', () => {
    const { wrapper } = createWrapper();
    const select = wrapper.findComponent({ name: 'UnnnicSelect' });
    const optionValues = select.props('options').map((option) => option.value);
    expect(optionValues).toEqual(['s', 'm', 'h']);
  });
});
