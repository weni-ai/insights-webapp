import { shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import FilterDate from '@/components/insights/Layout/HeaderFilters/FilterDate.vue';
import i18n from '@/utils/plugins/i18n';
import { createTestingPinia } from '@pinia/testing';

const createWrapper = (props = {}) => {
  return shallowMount(FilterDate, {
    props: { modelValue: { start: '2024-11-01', end: '2024-11-11' }, ...props },
    global: {
      plugins: [createTestingPinia()],
    },
  });
};

describe('FilterDate', () => {
  let wrapper;

  const filterDate = () => wrapper.findComponent('[data-testid="filter-date"]');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders UnnnicInputDatePicker with correct props', () => {
    expect(filterDate().exists()).toBe(true);
    expect(filterDate().props('modelValue')).toEqual({
      start: '2024-11-01',
      end: '2024-11-11',
    });
    expect(filterDate().props('size')).toBe('md');
    expect(filterDate().props('inputFormat')).toBe(
      i18n.global.t('date_format'),
    );
    expect(filterDate().props('position')).toBe('right');
  });

  it('emits update:modelValue event when date picker value is updated', async () => {
    wrapper = createWrapper({ modelValue: {} });

    await filterDate().vm.$emit('update:model-value', {
      start: '2024-11-05',
      end: '2024-11-10',
    });

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
      start: '2024-11-05',
      end: '2024-11-10',
    });
  });
});
