import { describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

import DetailedFilters from '../DetailedFilters.vue';

const i18n = createI18n({ legacy: false });
config.global.plugins = [i18n];

const createWrapper = (props = {}, storeOverrides = {}) => {
  const store = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      humanSupport: {
        appliedFilters: {
          sectors: [],
          queues: [],
          tags: [],
        },
        ...storeOverrides,
      },
    },
  });

  return mount(DetailedFilters, {
    props: {
      type: 'attendant',
      ...props,
    },
    global: {
      plugins: [store],
      stubs: {
        FilterSelect: {
          template: `
            <div 
              :data-testid="\`mock-filter-select-\${type}\`"
              @click="$emit('change', { value: 'test', label: 'Test' })"
            ></div>
          `,
          props: ['type', 'source', 'modelValue', 'filterParams'],
          emits: ['update:modelValue', 'change'],
          methods: {
            clearData: vi.fn(),
          },
        },
        TransitionGroup: false,
      },
      mocks: {
        $t: (key) => key,
      },
    },
  });
};

describe('DetailedFilters', () => {
  let wrapper;

  const getDetailedFilters = (type) =>
    wrapper.find(`[data-testid="detailed-filters-${type}"]`);
  const getFilterSelect = (type) =>
    wrapper.find(`[data-testid="detailed-filter-${type}"]`);
  const getAllFilterSelects = () =>
    wrapper.findAll('[data-testid^="detailed-filter-"]');

  describe('Component Rendering', () => {
    it('should render with attendant type', () => {
      wrapper = createWrapper({ type: 'attendant' });

      expect(getDetailedFilters('attendant').exists()).toBe(true);
      expect(getFilterSelect('attendant').exists()).toBe(true);
    });

    it('should render single attendant filter for attendant type', () => {
      wrapper = createWrapper({ type: 'attendant' });

      const filters = getAllFilterSelects();
      expect(filters).toHaveLength(1);
    });

    it('should render single attendant filter for pauses type', () => {
      wrapper = createWrapper({ type: 'pauses' });

      const filters = getAllFilterSelects();
      expect(filters).toHaveLength(1);
      expect(getFilterSelect('attendant').exists()).toBe(true);
    });

    it('should render all three filters for finished type', () => {
      wrapper = createWrapper({ type: 'finished' });

      const filters = getAllFilterSelects();
      expect(filters).toHaveLength(3);
      expect(getFilterSelect('attendant').exists()).toBe(true);
      expect(getFilterSelect('contact').exists()).toBe(true);
      expect(getFilterSelect('ticket_id').exists()).toBe(true);
    });
  });

  describe('Filter Configuration', () => {
    it('should pass correct props to attendant filter', () => {
      wrapper = createWrapper({
        type: 'attendant',
      });

      expect(wrapper.vm.filters.attendant.type).toBe('attendant');
      expect(wrapper.vm.filters.attendant.source).toBe('agents');
    });

    it('should pass filterParams to filters', () => {
      wrapper = createWrapper(
        { type: 'finished' },
        {
          appliedFilters: {
            sectors: [{ value: 's1' }],
            queues: [{ value: 'q1' }],
            tags: [{ value: 't1' }],
          },
        },
      );

      const filterParams = wrapper.vm.filterParams;

      expect(filterParams.sectors).toEqual(['s1']);
      expect(filterParams.queues).toEqual(['q1']);
      expect(filterParams.tags).toEqual(['t1']);
    });
  });

  describe('Filter State Management', () => {
    it('should update filter selected value on change', async () => {
      wrapper = createWrapper({ type: 'attendant' });

      wrapper.vm.filters.attendant.selected = [
        { value: 'a1', label: 'Agent 1' },
      ];
      await nextTick();

      expect(wrapper.vm.filters.attendant.selected).toEqual([
        { value: 'a1', label: 'Agent 1' },
      ]);
    });

    it('should call saveAppliedDetailFilter when filter changes', async () => {
      wrapper = createWrapper({ type: 'attendant' });
      const humanSupportStore = useHumanSupport();

      wrapper.vm.handleFilterChange('attendant', {
        value: 'a1',
        label: 'Agent 1',
        email: 'agent1@test.com',
      });
      await nextTick();

      expect(humanSupportStore.saveAppliedDetailFilter).toHaveBeenCalledWith(
        'agent',
        'agent1@test.com',
        'Agent 1',
      );
    });

    it('should clear filter when empty value is emitted', async () => {
      wrapper = createWrapper({ type: 'attendant' });
      const humanSupportStore = useHumanSupport();

      wrapper.vm.handleFilterChange('attendant', { value: '', label: '' });
      await nextTick();

      expect(humanSupportStore.saveAppliedDetailFilter).toHaveBeenCalledWith(
        'agent',
        '',
        '',
      );
    });

    it('should use email for attendant filter value', async () => {
      wrapper = createWrapper({ type: 'attendant' });
      const humanSupportStore = useHumanSupport();

      wrapper.vm.handleFilterChange('attendant', {
        value: 'uuid-1',
        label: 'Agent 1',
        email: 'agent1@test.com',
      });
      await nextTick();

      expect(humanSupportStore.saveAppliedDetailFilter).toHaveBeenCalledWith(
        'agent',
        'agent1@test.com',
        'Agent 1',
      );
    });

    it('should use value directly for contact filter', async () => {
      wrapper = createWrapper({ type: 'finished' });
      const humanSupportStore = useHumanSupport();

      wrapper.vm.handleFilterChange('contact', {
        value: 'contact-1',
        label: 'Contact 1',
      });
      await nextTick();

      expect(humanSupportStore.saveAppliedDetailFilter).toHaveBeenCalledWith(
        'contact',
        'contact-1',
        'Contact 1',
      );
    });
  });

  describe('Type Change Handling', () => {
    it('should clear contact and ticket_id filters when changing from finished to attendant', async () => {
      wrapper = createWrapper({ type: 'finished' });

      wrapper.vm.filters.contact.selected = [
        { value: 'c1', label: 'Contact 1' },
      ];
      wrapper.vm.filters.ticket_id.selected = [
        { value: 't1', label: 'Ticket 1' },
      ];

      await wrapper.setProps({ type: 'attendant' });
      await nextTick();

      expect(wrapper.vm.filters.contact.selected).toEqual([]);
      expect(wrapper.vm.filters.ticket_id.selected).toEqual([]);
    });

    it('should call saveAppliedDetailFilter to clear non-finished filters', async () => {
      wrapper = createWrapper({ type: 'finished' });
      const humanSupportStore = useHumanSupport();

      await wrapper.setProps({ type: 'attendant' });
      await nextTick();

      expect(humanSupportStore.saveAppliedDetailFilter).toHaveBeenCalledWith(
        'contact',
        '',
        '',
      );
      expect(humanSupportStore.saveAppliedDetailFilter).toHaveBeenCalledWith(
        'ticketId',
        '',
        '',
      );
    });

    it('should reset new filters when switching between types', async () => {
      wrapper = createWrapper({ type: 'attendant' });

      wrapper.vm.filters.attendant.selected = [
        { value: 'a1', label: 'Agent 1' },
      ];

      await wrapper.setProps({ type: 'finished' });
      await nextTick();

      expect(wrapper.vm.filters.contact.selected).toEqual([]);
      expect(wrapper.vm.filters.ticket_id.selected).toEqual([]);
    });

    it('should not reset filters when changing within same filter set', async () => {
      wrapper = createWrapper({ type: 'attendant' });

      wrapper.vm.filters.attendant.selected = [
        { value: 'a1', label: 'Agent 1' },
      ];

      await wrapper.setProps({ type: 'pauses' });
      await nextTick();

      expect(wrapper.vm.filters.attendant.selected).toEqual([
        { value: 'a1', label: 'Agent 1' },
      ]);
    });
  });

  describe('Filter Refs Management', () => {
    it('should store filter refs correctly', async () => {
      wrapper = createWrapper({ type: 'finished' });
      await nextTick();

      const mockRef = { clearData: vi.fn() };
      wrapper.vm.setFilterRef(mockRef, 'contact');

      expect(wrapper.vm.filterRefs.contact).toStrictEqual(mockRef);
    });

    it('should call clearData on filter refs when clearing non-finished filters', async () => {
      wrapper = createWrapper({ type: 'finished' });

      const mockContactRef = { clearData: vi.fn() };
      const mockTicketRef = { clearData: vi.fn() };

      wrapper.vm.filterRefs.contact = mockContactRef;
      wrapper.vm.filterRefs.ticket_id = mockTicketRef;

      await wrapper.setProps({ type: 'attendant' });
      await nextTick();

      expect(mockContactRef.clearData).toHaveBeenCalled();
      expect(mockTicketRef.clearData).toHaveBeenCalled();
    });
  });

  describe('Initial Mount Behavior', () => {
    it('should clear non-finished filters on mount when type is not finished', () => {
      wrapper = createWrapper({ type: 'attendant' });
      const humanSupportStore = useHumanSupport();

      wrapper.vm.clearNonFinishedFilters();

      expect(humanSupportStore.saveAppliedDetailFilter).toHaveBeenCalledWith(
        'contact',
        '',
        '',
      );
      expect(humanSupportStore.saveAppliedDetailFilter).toHaveBeenCalledWith(
        'ticketId',
        '',
        '',
      );
    });

    it('should not clear non-finished filters on mount when type is finished', () => {
      wrapper = createWrapper({ type: 'finished' });
      const humanSupportStore = useHumanSupport();

      const callsBefore =
        humanSupportStore.saveAppliedDetailFilter.mock.calls.length;
      wrapper.vm.clearNonFinishedFilters();

      expect(humanSupportStore.saveAppliedDetailFilter.mock.calls.length).toBe(
        callsBefore,
      );
    });
  });
});
