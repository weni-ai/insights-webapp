import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FilterSelect from '@/components/insights/Layout/HeaderFilters/FilterSelect.vue';
import Projects from '@/services/api/resources/projects';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    getProjectSource: vi.fn(),
  },
}));

const mockSourceData = [
  { uuid: '1', name: 'Source 1' },
  { uuid: '2', name: 'Source 2' },
];

const createWrapper = (props = {}) => {
  return mount(FilterSelect, {
    props: {
      modelValue: {},
      placeholder: 'Select an option',
      source: 'test-source',
      keyValueField: '',
      ...props,
    },
    global: {
      stubs: {
        UnnnicSelectSmart: true,
      },
    },
  });
};

describe('FilterSelect', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    Projects.getProjectSource.mockResolvedValue(mockSourceData);
    wrapper = createWrapper();
  });

  it('renders correctly', () => {
    expect(
      wrapper.findComponent({ name: 'UnnnicSelectSmart' }).exists(),
    ).toBeTruthy();
  });

  it('initializes with correct default props', () => {
    expect(wrapper.props()).toEqual({
      modelValue: {},
      placeholder: 'Select an option',
      source: 'test-source',
      dependsOn: undefined,
      dependsOnValue: null,
      keyValueField: '',
    });
  });

  it('sets initial options with placeholder', () => {
    expect(wrapper.vm.options).toEqual([
      {
        value: '',
        label: 'Select an option',
      },
      {
        label: 'Source 1',
        value: '1',
      },
      {
        label: 'Source 2',
        value: '2',
      },
    ]);
  });

  it('fetches source data on mount when no dependsOn is provided', async () => {
    expect(Projects.getProjectSource).toHaveBeenCalledWith('test-source', {});
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.options).toHaveLength(3);
  });

  it('does not fetch source data on mount when dependsOn is provided', async () => {
    Projects.getProjectSource.mockClear();

    const customWrapper = createWrapper({
      dependsOn: { search_param: 'test' },
    });

    await customWrapper.vm.$nextTick();

    expect(Projects.getProjectSource).not.toHaveBeenCalled();
  });

  it('computes treatedModelValue correctly for string modelValue', async () => {
    const customWrapper = createWrapper({
      modelValue: '1',
    });
    await customWrapper.vm.$nextTick();
    expect(customWrapper.vm.treatedModelValue).toEqual([
      {
        label: 'Source 1',
        value: '1',
      },
    ]);
  });

  it('computes treatedModelValue correctly when modelValue is not provided', async () => {
    const options = [
      { label: 'Select an option', value: '' },
      { label: 'Source 1', value: '1' },
      { label: 'Source 2', value: '2' },
    ];

    const customWrapper = createWrapper({
      options,
      modelValue: undefined,
    });

    await customWrapper.vm.$nextTick();
    expect(customWrapper.vm.treatedModelValue).toEqual([options[0]]);
  });

  it('emits update:model-value when UnnnicSelectSmart value changes', async () => {
    const selectComponent = wrapper.findComponent({
      name: 'UnnnicSelectSmart',
    });
    await selectComponent.vm.$emit('update:model-value', [{ value: '1' }]);

    expect(wrapper.emitted('update:model-value')).toBeTruthy();
    expect(wrapper.emitted('update:model-value')[0]).toEqual(['1']);
  });

  it('clears options when clearOptions is called', () => {
    wrapper.vm.clearOptions();
    expect(wrapper.vm.options).toEqual([
      {
        value: '',
        label: 'Select an option',
      },
    ]);
  });

  it('watches dependsOnValue and fetches new data when all values are filled', async () => {
    const customWrapper = createWrapper({
      dependsOn: { search_param: 'test' },
      dependsOnValue: { param1: 'value1' },
    });

    await customWrapper.setProps({
      dependsOnValue: { param1: 'value1', param2: 'value2' },
    });

    expect(Projects.getProjectSource).toHaveBeenCalledWith('test-source', {
      param1: 'value1',
      param2: 'value2',
    });
  });

  it('handles custom keyValueField properly', async () => {
    const customSourceData = [
      { custom_id: 'c1', name: 'Custom 1' },
      { custom_id: 'c2', name: 'Custom 2' },
    ];
    Projects.getProjectSource.mockResolvedValue(customSourceData);

    const customWrapper = createWrapper({
      keyValueField: 'custom_id',
    });

    await customWrapper.vm.$nextTick();
    expect(customWrapper.vm.options[1]).toEqual({
      value: 'c1',
      label: 'Custom 1',
    });
  });

  it('handles empty response from getProjectSource', async () => {
    Projects.getProjectSource.mockResolvedValue(null);
    const customWrapper = createWrapper();

    await customWrapper.vm.$nextTick();
    expect(customWrapper.vm.options).toEqual([
      {
        value: '',
        label: 'Select an option',
      },
    ]);
  });

  it('maintains original options when fetchSource fails', async () => {
    Projects.getProjectSource.mockRejectedValue('API Error');
    const customWrapper = createWrapper();

    await customWrapper.vm.$nextTick();
    expect(customWrapper.vm.options).toEqual([
      {
        value: '',
        label: 'Select an option',
      },
    ]);
  });

  it('does not fetch new data when dependsOnValue changes but not all values are filled', async () => {
    Projects.getProjectSource.mockClear();

    const customWrapper = createWrapper({
      dependsOn: { search_param: 'test' },
      dependsOnValue: { param1: 'value1' },
    });

    Projects.getProjectSource.mockClear();

    await customWrapper.setProps({
      dependsOnValue: { param1: 'value1', param2: '' },
    });

    expect(Projects.getProjectSource).not.toHaveBeenCalled();
  });
});
