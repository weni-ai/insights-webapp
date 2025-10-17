import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import FormExport from '../FormExport.vue';

const mockStore = {
  open_chats: { value: true },
  sectors: { value: [] },
  agents: { value: [] },
  queues: { value: [] },
  tags: { value: [] },
  type: { value: '.xlsx' },
  accept_terms: { value: false },
  date_range: { value: { start: '', end: '' } },
  setStatusChats: vi.fn(),
  setDateRange: vi.fn(),
  setSectors: vi.fn(),
  setAgents: vi.fn(),
  setQueues: vi.fn(),
  setTags: vi.fn(),
  setType: vi.fn(),
  setAcceptTerms: vi.fn(),
};

vi.mock('@/store/modules/export/humanSupport/export', () => ({
  useHumanSupportExport: () => mockStore,
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
          placeholder: 'Select',
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
        chats_open: 'Open',
        chats_closed: 'Closed',
        filters: {
          sector: 'Sector',
          queue: 'Queue',
          agent: 'Agent',
          tag: 'Tag',
          select_sector: 'Select sector',
          select_queue: 'Select queue',
          select_agent: 'Select agent',
          select_tag: 'Select tag',
          all_sectors: 'All sectors',
          all_queues: 'All queues',
          all_agents: 'All agents',
          all_tags: 'All tags',
        },
        select_format: 'Format',
        warning_terms: 'Warning',
        accept_terms: 'Accept',
      },
    },
  },
});

config.global.plugins = [i18n];

describe('HumanSupport FormExport', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockStore, storeOverrides);

    return mount(FormExport, {
      global: {
        stubs: {
          ExportFilterDate: true,
          FilterMultiSelect: true,
          FormCheckbox: true,
          ExportFooter: true,
          UnnnicRadio: true,
          UnnnicLabel: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="export-data-form"]');

  beforeEach(() => {
    vi.clearAllMocks();

    Object.assign(mockStore, {
      open_chats: { value: true },
      sectors: { value: [] },
      agents: { value: [] },
      queues: { value: [] },
      tags: { value: [] },
      type: { value: '.xlsx' },
      accept_terms: { value: false },
      date_range: { value: { start: '', end: '' } },
    });

    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render description', () => {
      const description = wrapper.find(
        '[data-testid="export-data-form-description"]',
      );
      expect(description.exists()).toBe(true);
    });

    it('should render chat status section', () => {
      const chatsStatus = wrapper.find(
        '[data-testid="export-data-form-chats-status"]',
      );
      expect(chatsStatus.exists()).toBe(true);
    });

    it('should render filters section', () => {
      const filters = wrapper.find('[data-testid="export-data-form-filters"]');
      expect(filters.exists()).toBe(true);
    });

    it('should render all child components', () => {
      expect(
        wrapper.find('[data-testid="export-data-filter-date"]').exists(),
      ).toBe(true);
      expect(
        wrapper
          .find('[data-testid="human-support-form-checkbox-component"]')
          .exists(),
      ).toBe(true);
      expect(
        wrapper.find('[data-testid="human-support-export-footer"]').exists(),
      ).toBe(true);
    });
  });

  describe('Computed properties', () => {
    it('should compute selectedFormat correctly', () => {
      expect(wrapper.vm.selectedFormat).toBe('.xlsx');
    });

    it('should compute selectedFormat as .csv', () => {
      wrapper = createWrapper({ type: { value: '.csv' } });
      expect(wrapper.vm.selectedFormat).toBe('.csv');
    });

    it('should compute selectedChatStatus as open', () => {
      expect(wrapper.vm.selectedChatStatus).toBe('open');
    });

    it('should compute selectedChatStatus as closed', () => {
      wrapper = createWrapper({ open_chats: { value: false } });
      expect(wrapper.vm.selectedChatStatus).toBe('closed');
    });

    it('should compute hasSectorsSelected as false', () => {
      expect(wrapper.vm.hasSectorsSelected).toBe(false);
    });

    it('should compute hasSectorsSelected as true', () => {
      wrapper = createWrapper({
        sectors: { value: [{ value: '1', label: 'Sector 1' }] },
      });
      expect(wrapper.vm.hasSectorsSelected).toBe(true);
    });

    it('should compute isManySectorsSelected', () => {
      wrapper = createWrapper({
        sectors: {
          value: [{ value: '1' }, { value: '2' }],
        },
      });
      expect(wrapper.vm.isManySectorsSelected).toBe(true);
    });

    it('should compute shortCutOptions with translations', () => {
      const options = wrapper.vm.shortCutOptions;
      expect(options).toHaveLength(7);
      expect(options[0].id).toBe('last-7-days');
    });
  });

  describe('Dependency computed properties', () => {
    it('should compute dependsOnValueQueues for single sector', () => {
      wrapper = createWrapper({
        sectors: { value: [{ value: '1', label: 'Sector 1' }] },
      });
      const depends = wrapper.vm.dependsOnValueQueues;
      expect(depends.sector_id).toBe('1');
    });

    it('should compute dependsOnValueQueues for multiple sectors', () => {
      wrapper = createWrapper({
        sectors: { value: [{ value: '1' }, { value: '2' }] },
      });
      const depends = wrapper.vm.dependsOnValueQueues;
      expect(depends.sectors).toBe('1,2');
    });

    it('should compute dependsOnValueAgents', () => {
      wrapper = createWrapper({
        sectors: { value: [{ value: '1' }] },
      });
      const depends = wrapper.vm.dependsOnValueAgents;
      expect(depends.sector_id).toBe('1');
    });

    it('should compute dependsOnValueTags', () => {
      wrapper = createWrapper({
        sectors: { value: [{ value: '1' }] },
      });
      const depends = wrapper.vm.dependsOnValueTags;
      expect(depends.sector_id).toBe('1');
    });
  });

  describe('Event handlers', () => {
    it('should update date range', () => {
      wrapper.vm.updateDateRange({ start: '2024-01-01', end: '2024-01-31' });
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

    it('should update chat status to open', () => {
      wrapper.vm.updateChatStatus('open');
      expect(mockStore.setStatusChats).toHaveBeenCalledWith(true);
    });

    it('should update chat status to closed', () => {
      wrapper.vm.updateChatStatus('closed');
      expect(mockStore.setStatusChats).toHaveBeenCalledWith(false);
    });

    it('should update sectors and clear dependent filters', () => {
      const sectors = [{ value: '1', label: 'Sector 1' }];
      wrapper.vm.updateSectors(sectors);

      expect(mockStore.setSectors).toHaveBeenCalledWith(sectors);
      expect(mockStore.setAgents).toHaveBeenCalledWith([]);
      expect(mockStore.setQueues).toHaveBeenCalledWith([]);
      expect(mockStore.setTags).toHaveBeenCalledWith([]);
    });

    it('should update agents', () => {
      const agents = [{ value: '1', label: 'Agent 1' }];
      wrapper.vm.updateAgents(agents);
      expect(mockStore.setAgents).toHaveBeenCalledWith(agents);
    });

    it('should update queues', () => {
      const queues = [{ value: '1', label: 'Queue 1' }];
      wrapper.vm.updateQueues(queues);
      expect(mockStore.setQueues).toHaveBeenCalledWith(queues);
    });

    it('should update tags', () => {
      const tags = [{ value: '1', label: 'Tag 1' }];
      wrapper.vm.updateTags(tags);
      expect(mockStore.setTags).toHaveBeenCalledWith(tags);
    });

    it('should update format', () => {
      wrapper.vm.updateFormat('.csv');
      expect(mockStore.setType).toHaveBeenCalledWith('.csv');
    });

    it('should update accept terms', () => {
      wrapper.vm.updateAcceptTerms(true);
      expect(mockStore.setAcceptTerms).toHaveBeenCalledWith(true);
    });
  });

  describe('Date methods', () => {
    it('should call getMinDate and return null for empty range', () => {
      const minDate = wrapper.vm.getMinDate();
      expect(minDate).toBeNull();
    });

    it('should call getMaxDate and return today for empty range', () => {
      const maxDate = wrapper.vm.getMaxDate();
      expect(maxDate).toBeTruthy();
    });

    it('should calculate minDate based on selectDateRange', () => {
      wrapper.vm.selectDateRange = { start: '2024-01-01', end: '' };
      const minDate = wrapper.vm.getMinDate();
      expect(minDate).toBeTruthy();
    });

    it('should calculate maxDate based on selectDateRange', () => {
      wrapper.vm.selectDateRange = { start: '2024-01-01', end: '' };
      const maxDate = wrapper.vm.getMaxDate();
      expect(maxDate).toBeTruthy();
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('export-data-form');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
