import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import ExportFilterDate from '../ExportFilterDate.vue';

describe('ExportFilterDate', () => {
  let wrapper;

  const mockDateRange = { start: '2024-01-01', end: '2024-01-31' };
  const mockOptions = [
    { name: 'Last 7 days', id: 'last_7_days' },
    { name: 'Last 30 days', id: 'last_30_days' },
  ];

  const defaultProps = {
    modelValue: mockDateRange,
    label: 'Date Range',
    placeholder: 'Select date',
    options: mockOptions,
    minDate: '2024-01-01',
    maxDate: '2024-12-31',
  };

  const createWrapper = (props = {}) => {
    return mount(ExportFilterDate, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          FilterDate: true,
          UnnnicLabel: true,
        },
      },
    });
  };

  const section = () => wrapper.find('.export-filter-date');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render with minimal props', () => {
      wrapper = createWrapper({
        modelValue: { start: '', end: '' },
        label: '',
        placeholder: '',
        options: [],
      });
      expect(section().exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('should accept modelValue prop', () => {
      expect(wrapper.props('modelValue')).toEqual(mockDateRange);
    });

    it('should accept label prop', () => {
      expect(wrapper.props('label')).toBe('Date Range');
    });

    it('should use default values', () => {
      wrapper = mount(ExportFilterDate, {
        global: {
          stubs: {
            FilterDate: true,
            UnnnicLabel: true,
          },
        },
      });

      expect(wrapper.props('modelValue')).toEqual({ start: '', end: '' });
      expect(wrapper.props('label')).toBe('');
      expect(wrapper.props('placeholder')).toBe('');
      expect(wrapper.props('options')).toEqual([]);
      expect(wrapper.props('minDate')).toBe('');
      expect(wrapper.props('maxDate')).toBe('');
    });
  });

  describe('Events', () => {
    it('should emit update:model-value event', async () => {
      const newDateRange = { start: '2024-02-01', end: '2024-02-28' };
      await wrapper.vm.handleUpdateModelValue(newDateRange);

      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newDateRange]);
    });

    it('should emit select-date event', async () => {
      const selectedDate = { start: '2024-03-01', end: '2024-03-31' };
      await wrapper.vm.handleDateSelect(selectedDate);

      expect(wrapper.emitted('select-date')).toBeTruthy();
      expect(wrapper.emitted('select-date')[0]).toEqual([selectedDate]);
    });

    it('should handle multiple date selections', async () => {
      await wrapper.vm.handleDateSelect(mockDateRange);
      await wrapper.vm.handleDateSelect({
        start: '2024-05-01',
        end: '2024-05-31',
      });

      expect(wrapper.emitted('select-date')).toHaveLength(2);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('export-filter-date');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
