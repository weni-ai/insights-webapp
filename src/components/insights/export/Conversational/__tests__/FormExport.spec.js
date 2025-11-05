import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import FormExport from '../FormExport.vue';

const mockStore = {
  date_range: { value: { start: '', end: '' } },
  type: { value: 'XLSX' },
  accept_terms: { value: false },
  setDateRange: vi.fn(),
  setType: vi.fn(),
  setAcceptTerms: vi.fn(),
};

vi.mock('@/store/modules/export/conversational/export', () => ({
  useConversationalExport: () => mockStore,
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => store,
  };
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      export_data: {
        description: 'Export description',
        select_data: {
          label: 'Date',
          shortcuts: {
            last_7_days: 'Last 7 days',
            last_14_days: 'Last 14 days',
            last_30_days: 'Last 30 days',
            last_60_days: 'Last 60 days',
            last_90_days: 'Last 90 days',
            current_month: 'Current month',
            previous_month: 'Previous month',
          },
        },
        select_period: { placeholder: 'Select' },
        select_format: 'Format',
        warning_terms: 'Warning',
        accept_terms: 'Accept',
      },
    },
  },
});

config.global.plugins = [i18n];

describe('Conversational FormExport', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockStore, storeOverrides);

    return mount(FormExport, {
      global: {
        stubs: {
          ExportFilterDate: true,
          FormCheckbox: true,
          ExportFooter: true,
        },
      },
    });
  };

  const section = () =>
    wrapper.find('[data-testid="conversational-export-form"]');

  beforeEach(() => {
    vi.clearAllMocks();

    Object.assign(mockStore, {
      date_range: { value: { start: '', end: '' } },
      type: { value: 'XLSX' },
      accept_terms: { value: false },
    });

    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render description', () => {
      const description = wrapper.find(
        '[data-testid="conversational-export-form-description"]',
      );
      expect(description.exists()).toBe(true);
    });

    it('should render all child components', () => {
      expect(
        wrapper
          .find('[data-testid="conversational-export-filter-date"]')
          .exists(),
      ).toBe(true);
      expect(
        wrapper
          .find('[data-testid="conversational-form-checkbox-component"]')
          .exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="conversational-export-footer"]').exists(),
      ).toBe(true);
    });
  });

  describe('Computed properties', () => {
    it('should compute selectedFormat as .xlsx when type is XLSX', () => {
      expect(wrapper.vm.selectedFormat).toBe('.xlsx');
    });

    it('should compute selectedFormat as .csv when type is CSV', () => {
      wrapper = createWrapper({ type: { value: 'CSV' } });
      expect(wrapper.vm.selectedFormat).toBe('.csv');
    });

    it('should compute shortCutOptions with correct translations', () => {
      const options = wrapper.vm.shortCutOptions;
      expect(options).toHaveLength(1);
      expect(options[0].id).toBe('previous-month');
    });
  });

  describe('Date range methods', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return null for empty date range', () => {
      wrapper.vm.selectDateRange = { start: '', end: '' };
      const minDate = wrapper.vm.getMinDate();
      expect(minDate).toBeNull();
    });

    it('should return yesterday for maxDate with empty range', () => {
      wrapper.vm.selectDateRange = { start: '', end: '' };
      const maxDate = wrapper.vm.getMaxDate();
      expect(maxDate).toBe('2024-06-14');
    });

    it('should calculate minDate 92 days before start date', () => {
      wrapper.vm.selectDateRange = { start: '2024-06-14', end: '' };
      const minDate = wrapper.vm.getMinDate();
      expect(minDate).toBe('2024-03-14');
    });

    it('should calculate maxDate 92 days after start date', () => {
      wrapper.vm.selectDateRange = { start: '2024-03-14', end: '' };
      const maxDate = wrapper.vm.getMaxDate();
      expect(maxDate).toBe('2024-06-14');
    });

    it('should cap maxDate at yesterday if calculated date is today or future', () => {
      wrapper.vm.selectDateRange = { start: '2024-06-01', end: '' };
      const maxDate = wrapper.vm.getMaxDate();
      expect(maxDate).toBe('2024-06-14');
    });

    it('should return default min when start date is invalid', () => {
      wrapper.vm.selectDateRange = { start: 'invalid-date', end: '' };
      const minDate = wrapper.vm.getMinDate();
      expect(minDate).toBeNull();
    });
  });

  describe('Event handlers', () => {
    it('should update date range', () => {
      const dateRange = { start: '2024-01-01', end: '2024-01-31' };
      wrapper.vm.updateDateRange(dateRange);

      expect(mockStore.setDateRange).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-01-31',
      );
    });

    it('should update select date range', () => {
      const dateRange = { start: '2024-01-01', end: '2024-01-31' };
      wrapper.vm.updateSelectDateRange(dateRange);

      expect(wrapper.vm.selectDateRange).toEqual(dateRange);
    });

    it('should update format to CSV', () => {
      wrapper.vm.updateFormat('.csv');
      expect(mockStore.setType).toHaveBeenCalledWith('CSV');
    });

    it('should update format to XLSX', () => {
      wrapper.vm.updateFormat('.xlsx');
      expect(mockStore.setType).toHaveBeenCalledWith('XLSX');
    });

    it('should update accept terms', () => {
      wrapper.vm.updateAcceptTerms(true);
      expect(mockStore.setAcceptTerms).toHaveBeenCalledWith(true);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('conversational-export-form');
    });
  });
});
