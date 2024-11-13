import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';

import DynamicFilter from '@/components/insights/Layout/HeaderFilters/DynamicFilter.vue';
import FilterDate from '@/components/insights/Layout/HeaderFilters/FilterDate.vue';
import FilterInputText from '@/components/insights/Layout/HeaderFilters/FilterInputText.vue';
import FilterSelect from '@/components/insights/Layout/HeaderFilters/FilterSelect.vue';
import FilterSelectDate from '@/components/insights/Layout/HeaderFilters/FilterSelectDate.vue';

const defaultFilter = { type: 'input_text', label: 'Label' };

const createWrapper = (props = {}) => {
  return shallowMount(DynamicFilter, {
    props: { filter: defaultFilter, ...props },
  });
};

describe('DynamicFilter', () => {
  let wrapper;

  const filterLabel = () => wrapper.findComponent({ name: 'UnnnicLabel' });

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('should not render filter if prop filter is not passed', () => {
    wrapper = shallowMount(DynamicFilter);

    expect(wrapper.html()).toContain('');
  });

  describe('Label rendering', () => {
    it('renders the UnnnicLabel when filter label is present', () => {
      expect(filterLabel().exists()).toBe(true);
    });

    it('does not render the UnnnicLabel when filter label is not present', () => {
      wrapper = createWrapper({ filter: { type: defaultFilter.type } });
      expect(filterLabel().exists()).toBe(false);
    });
  });

  describe('Component rendering based on filter type', () => {
    const filterTypes = [
      { type: 'date_range', component: FilterDate },
      { type: 'input_text', component: FilterInputText },
      { type: 'select', component: FilterSelect },
      { type: 'select_date_range', component: FilterSelectDate },
    ];

    filterTypes.forEach(({ type, component }) => {
      it(`renders the correct component for filter type "${type}"`, () => {
        wrapper = createWrapper({ filter: { type } });
        expect(wrapper.findComponent(component).exists()).toBe(true);
      });
    });
  });

  it('emits update:model-value when @update:model-value is triggered by child component', async () => {
    await wrapper
      .findComponent(FilterInputText)
      .vm.$emit('update:model-value', 'new value');

    expect(wrapper.emitted('update:model-value')).toBeTruthy();
    expect(wrapper.emitted('update:model-value')[0]).toEqual(['new value']);
  });

  it('passes the correct props to the rendered component', () => {
    const filter = {
      type: 'select',
      placeholder: 'Select an option',
      source: 'flows',
      key_value_field: 'value',
    };
    wrapper = createWrapper({ filter, modelValue: 'selectedValue' });

    const selectComponent = wrapper.findComponent(FilterSelect);
    expect(selectComponent.props()).toMatchObject({
      placeholder: 'Select an option',
      modelValue: 'selectedValue',
      source: 'flows',
      keyValueField: 'value',
    });
  });

  it('correctly computes the treatedModelValue for date range type', () => {
    const filter = {
      type: 'date_range',
      start_sufix: 'start',
      end_sufix: 'end',
    };
    const wrapper = shallowMount(DynamicFilter, {
      props: { filter, modelValue: { start: '2024-01-01', end: '2024-01-31' } },
    });

    expect(wrapper.vm.treatedModelValue).toEqual({
      start: '2024-01-01',
      end: '2024-01-31',
    });
  });
});
