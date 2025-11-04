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
    it('should call getMinDate and return null for empty range', () => {
      const minDate = wrapper.vm.getMinDate();
      expect(minDate).toBeNull();
    });

    it('should call getMaxDate and return yesterday for empty range', () => {
      const maxDate = wrapper.vm.getMaxDate();
      expect(maxDate).toBeTruthy();
    });

    it('should return yesterday as maxDate instead of today', () => {
      const maxDate = wrapper.vm.getMaxDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayFormatted = yesterday.toISOString().split('T')[0];

      expect(maxDate).toBe(yesterdayFormatted);
    });

    it('should calculate minDate based on selectDateRange', async () => {
      wrapper.vm.selectDateRange = {
        start: '2024-01-01',
        end: '',
      };
      const minDate = wrapper.vm.getMinDate();
      expect(minDate).toBeTruthy();
    });

    it('should calculate maxDate based on selectDateRange', async () => {
      wrapper.vm.selectDateRange = {
        start: '2024-01-01',
        end: '',
      };
      const maxDate = wrapper.vm.getMaxDate();
      expect(maxDate).toBeTruthy();
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
