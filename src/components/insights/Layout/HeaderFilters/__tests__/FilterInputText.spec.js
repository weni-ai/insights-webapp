import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import FilterInputText from '@/components/insights/Layout/HeaderFilters/FilterInputText.vue';

const createWrapper = (props = {}) => {
  return shallowMount(FilterInputText, {
    props: {
      modelValue: 'Initial value',
      placeholder: 'Search here...',
      ...props,
    },
  });
};

describe('FilterInputText', () => {
  let wrapper;

  const filterInput = () =>
    wrapper.findComponent('[data-testid="filter-input-text"]');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders UnnnicInput with correct props', () => {
    expect(filterInput().exists()).toBe(true);
    expect(filterInput().props('modelValue')).toBe('Initial value');
    expect(filterInput().props('iconRight')).toBe('search');
    expect(filterInput().props('placeholder')).toBe('Search here...');
  });

  it('emits update:modelValue event when input value is updated', async () => {
    wrapper = createWrapper({ modelValue: '' });

    await filterInput().vm.$emit('update:model-value', 'New value');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe('New value');
  });
});
