import { mount, config } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import HumanServiceAgentsTable from '../index.vue';

import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];

global.window.parent = {
  postMessage: vi.fn(),
};

describe('HumanServiceAgentsTable', () => {
  let wrapper;
  let store;

  const mockHeaders = [
    { name: 'status', value: 'status', display: true, hidden_name: false },
    { name: 'agent', value: 'agent', display: true, hidden_name: false },
    { name: 'in_progress', value: 'opened', display: true, hidden_name: false },
    { name: 'closeds', value: 'closed', display: true, hidden_name: false },
    {
      name: 'column1',
      value: 'custom_status.column1',
      display: true,
      hidden_name: false,
    },
    {
      name: 'column2',
      value: 'custom_status.column2',
      display: true,
      hidden_name: false,
    },
    {
      name: 'hidden_column',
      value: 'hidden_column',
      display: true,
      hidden_name: true,
    },
    {
      name: 'not_displayed',
      value: 'not_displayed',
      display: false,
      hidden_name: false,
    },
  ];

  const mockItems = [
    {
      agent: 'Alice',
      status: { status: 'green', label: 'Online' },
      opened: 5,
      closed: 3,
      link: { url: '/link1' },
    },
    {
      agent: 'Bob',
      status: { status: 'gray', label: 'Offline' },
      opened: 2,
      closed: 7,
      link: { url: '/link2' },
    },
    {
      agent: 'Marcus',
      status: { status: 'gray', label: 'Offline' },
      opened: 2,
      closed: 7,
      link: { url: '/link4' },
    },
    {
      agent: 'Charlie',
      status: { status: 'green', label: 'Online' },
      opened: 8,
      closed: 6,
      link: { url: '/link3' },
    },
  ];

  const mockItemsExpansive = [
    {
      agent: 'Alice',
      status: { status: 'green', label: 'Online' },
      opened: 5,
      closed: 3,
      link: { url: '/link1' },
      custom_status: {
        column1: 1800, // 30 minutes
        column2: 3600, // 1 hour
      },
    },
    {
      agent: 'Bob',
      status: { status: 'gray', label: 'Offline' },
      opened: 2,
      closed: 7,
      link: { url: '/link2' },
      custom_status: {
        column1: 900, // 15 minutes
        column2: 1200, // 20 minutes
      },
    },
    {
      agent: 'Marcus',
      status: { status: 'gray' },
      opened: 2,
      closed: 7,
      link: { url: '/link4' },
      custom_status: {
        column1: 3600, // 1 hour
        column2: 7200, // 2 hours
      },
    },
    {
      agent: 'Charlie',
      status: { status: 'green' },
      opened: 8,
      closed: 6,
      link: { url: '/link3' },
      custom_status: {
        column1: 0,
        column2: null,
      },
    },
  ];

  const createMockStore = (overrideState = {}) => {
    return createTestingPinia({
      initialState: {
        agentsColumnsFilter: {
          visibleColumns: ['column1', 'column2'],
          ...overrideState.agentsColumnsFilter,
        },
      },
    });
  };

  beforeEach(() => {
    store = createMockStore();
    wrapper = mount(HumanServiceAgentsTable, {
      props: {
        isLoading: false,
        headerTitle: 'Title',
        headers: mockHeaders,
        items: mockItems,
        isExpansive: false,
      },
      global: {
        plugins: [i18n, UnnnicSystem, store],
        stubs: {
          AgentsTableHeader: true,
          UnnnicTableNext: true,
          UnnnicButtonIcon: {
            template:
              '<button data-testid="expand-button" @click="$emit(\'click\')">{{icon}}</button>',
            props: ['icon', 'size'],
            emits: ['click'],
          },
          AgentStatus: true,
        },
        mocks: {
          $t: (key) => key,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (wrapper) wrapper.unmount();
  });

  describe('Component rendering', () => {
    it('renders correctly with given props', () => {
      const title = wrapper.find(
        '[data-testid="widget-human-service-agent-title"]',
      );

      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('Title');

      expect(
        wrapper
          .findComponent('[data-testid="human-service-agents-table"]')
          .exists(),
      ).toBe(true);
    });

    it('does not render title when headerTitle is empty', async () => {
      await wrapper.setProps({ headerTitle: '' });
      await wrapper.vm.$nextTick();

      const headerSection = wrapper.find('header');
      expect(headerSection.exists()).toBe(false);
    });

    it('renders expand button when not in expansive mode', () => {
      const expandButton = wrapper.findComponent(
        '[data-testid="expand-button"]',
      );

      expect(expandButton.exists()).toBe(true);
    });

    it('renders AgentsTableHeader when in expansive mode', async () => {
      await wrapper.setProps({ isExpansive: true });
      await wrapper.vm.$nextTick();

      const agentsTableHeader = wrapper.findComponent(
        '[data-testid="agents-table-header"]',
      );

      expect(agentsTableHeader.exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('passes isLoading prop to the table', async () => {
      await wrapper.setProps({ isLoading: true });
      await wrapper.vm.$nextTick();

      const table = wrapper.findComponent(
        '[data-testid="human-service-agents-table"]',
      );
      expect(table.exists()).toBe(true);
    });

    it('handles the isExpansive prop', async () => {
      expect(wrapper.props('isExpansive')).toBe(false);

      await wrapper.setProps({ isExpansive: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.props('isExpansive')).toBe(true);
    });

    it('correctly passes table locale from i18n', () => {
      const table = wrapper.findComponent(
        '[data-testid="human-service-agents-table"]',
      );

      expect(table.attributes('locale')).toBe('en');
    });
  });

  describe('Events', () => {
    it('emits seeMore when expand button is clicked', async () => {
      const expandButton = wrapper.findComponent(
        '[data-testid="expand-button"]',
      );

      await expandButton.trigger('click');

      expect(wrapper.emitted('seeMore')).toBeTruthy();
      expect(wrapper.emitted('seeMore').length).toBe(1);
    });

    it('calls redirectItem on table emitted "row-click"', async () => {
      const redirectSpy = vi.spyOn(wrapper.vm, 'redirectItem');

      const table = wrapper.findComponent(
        '[data-testid="human-service-agents-table"]',
      );

      await table.vm.$emit('row-click', mockItems[0]);
      expect(redirectSpy).toHaveBeenCalledWith(mockItems[0]);
    });

    it('updates sort state when sort event is emitted', async () => {
      const table = wrapper.findComponent(
        '[data-testid="human-service-agents-table"]',
      );

      await table.vm.$emit('sort', { header: 'in_progress', order: 'asc' });

      expect(wrapper.vm.sort).toEqual({
        header: 'in_progress',
        order: 'asc',
      });
    });
  });

  describe('Computed properties', () => {
    describe('formattedHeaders', () => {
      it('formats headers correctly in non-expansive mode', () => {
        const formattedHeaders = wrapper.vm.formattedHeaders;

        expect(formattedHeaders.length).toBe(6);

        expect(formattedHeaders[0]).toHaveProperty('content');
        expect(formattedHeaders[0]).toHaveProperty('isSortable');
      });

      it('handles case when headers are empty or null', async () => {
        await wrapper.setProps({ headers: null });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.formattedHeaders).toEqual([]);

        await wrapper.setProps({ headers: [] });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.formattedHeaders).toEqual([]);
      });
    });

    describe('formattedItems', () => {
      it('formats items correctly in non-expansive mode', () => {
        const formattedItems = wrapper.vm.formattedItems;
        expect(formattedItems.length).toBe(4);
        const firstItem = formattedItems[0];
        expect(firstItem.content).toHaveLength(4);
        expect(firstItem.view_mode_url).toBe('/link3');
        expect(firstItem.link).toBeUndefined();
      });

      it('returns empty array when no headers or items', async () => {
        await wrapper.setProps({ headers: [], items: [] });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.formattedItems).toEqual([]);
      });
    });
  });

  describe('Methods', () => {
    describe('formatSecondsToTime', () => {
      it('formats basic time values correctly', () => {
        expect(wrapper.vm.formatSecondsToTime(0)).toBe('00:00:00');
        expect(wrapper.vm.formatSecondsToTime(30)).toBe('00:00:30'); // 30 seconds
        expect(wrapper.vm.formatSecondsToTime(60)).toBe('00:01:00'); // 1 minute
        expect(wrapper.vm.formatSecondsToTime(61)).toBe('00:01:01'); // 1m 1s
        expect(wrapper.vm.formatSecondsToTime(3600)).toBe('01:00:00'); // 1 hour
        expect(wrapper.vm.formatSecondsToTime(3661)).toBe('01:01:01'); // 1h 1m 1s
      });

      it('formats the specific bug case correctly', () => {
        // This was the problematic case: 4436 seconds should be 01:13:56, not 00:13:56
        expect(wrapper.vm.formatSecondsToTime(4436)).toBe('01:13:56');
      });

      it('formats larger time values correctly', () => {
        expect(wrapper.vm.formatSecondsToTime(7200)).toBe('02:00:00'); // 2 hours
        expect(wrapper.vm.formatSecondsToTime(7323)).toBe('02:02:03'); // 2h 2m 3s
        expect(wrapper.vm.formatSecondsToTime(86400)).toBe('24:00:00'); // 24 hours
        expect(wrapper.vm.formatSecondsToTime(90061)).toBe('25:01:01'); // 25h 1m 1s
        expect(wrapper.vm.formatSecondsToTime(363600)).toBe('101:00:00'); // 101 hours
      });

      it('handles decimal values by flooring them', () => {
        expect(wrapper.vm.formatSecondsToTime(30.7)).toBe('00:00:30');
        expect(wrapper.vm.formatSecondsToTime(61.9)).toBe('00:01:01');
        expect(wrapper.vm.formatSecondsToTime(3600.5)).toBe('01:00:00');
      });

      it('handles edge cases and invalid inputs', () => {
        expect(wrapper.vm.formatSecondsToTime(0)).toBe('00:00:00');
        expect(wrapper.vm.formatSecondsToTime(null)).toBe('00:00:00');
        expect(wrapper.vm.formatSecondsToTime(undefined)).toBe('00:00:00');
        expect(wrapper.vm.formatSecondsToTime('')).toBe('00:00:00');
        expect(wrapper.vm.formatSecondsToTime(false)).toBe('00:00:00');
      });

      it('formats common real-world scenarios', () => {
        expect(wrapper.vm.formatSecondsToTime(900)).toBe('00:15:00'); // 15 minutes
        expect(wrapper.vm.formatSecondsToTime(1800)).toBe('00:30:00'); // 30 minutes
        expect(wrapper.vm.formatSecondsToTime(2700)).toBe('00:45:00'); // 45 minutes
        expect(wrapper.vm.formatSecondsToTime(5400)).toBe('01:30:00'); // 1.5 hours
        expect(wrapper.vm.formatSecondsToTime(28800)).toBe('08:00:00'); // 8 hours (work day)
      });
    });

    describe('redirectItem', () => {
      it('posts a redirect message with the correct path', () => {
        const item = { view_mode_url: '/test-url' };
        wrapper.vm.redirectItem(item);

        expect(window.parent.postMessage).toHaveBeenCalledWith(
          {
            event: 'redirect',
            path: '/test-url/insights',
          },
          '*',
        );
      });
    });

    describe('sortItems', () => {
      it('sorts items by the default order when no header is specified', () => {
        wrapper.vm.sort = { header: '', order: '' };

        const sortedItems = wrapper.vm.sortItems([...mockItems]);
        expect(sortedItems).toHaveLength(4);
      });
    });

    describe('sortHeadersByVisibleColumns', () => {
      it('sorts headers according to visibleColumns order', () => {
        const headers = [
          { name: 'column2', value: 'custom_status.column2' },
          { name: 'column1', value: 'custom_status.column1' },
          { name: 'column3', value: 'custom_status.column3' },
        ];

        const visibleColumns = ['column1', 'column3', 'column2'];

        const sortedHeaders = wrapper.vm.sortHeadersByVisibleColumns(
          headers,
          visibleColumns,
        );

        expect(sortedHeaders[0].name).toBe('column1');
        expect(sortedHeaders[1].name).toBe('column3');
        expect(sortedHeaders[2].name).toBe('column2');
      });

      it('prioritizes in_progress and closeds over other columns', () => {
        const headers = [
          { name: 'column2', value: 'custom_status.column2' },
          { name: 'in_progress', value: 'opened' },
          { name: 'column1', value: 'custom_status.column1' },
          { name: 'closeds', value: 'closed' },
        ];

        const visibleColumns = ['column1', 'column2', 'in_progress', 'closeds'];

        const sortedHeaders = wrapper.vm.sortHeadersByVisibleColumns(
          headers,
          visibleColumns,
        );

        expect(sortedHeaders[0].name).toBe('in_progress');
        expect(sortedHeaders[1].name).toBe('closeds');
        expect(sortedHeaders[2].name).toBe('column1');
        expect(sortedHeaders[3].name).toBe('column2');
      });

      it('prioritizes headers that are in visibleColumns', () => {
        const headers = [
          { name: 'not_visible', value: 'not_visible' },
          { name: 'column1', value: 'custom_status.column1' },
          { name: 'column3', value: 'custom_status.column3' },
        ];

        const visibleColumns = ['column1', 'column3'];

        const sortedHeaders = wrapper.vm.sortHeadersByVisibleColumns(
          headers,
          visibleColumns,
        );

        expect(sortedHeaders[0].name).toBe('column1');
        expect(sortedHeaders[1].name).toBe('column3');
        expect(sortedHeaders[2].name).toBe('not_visible');
      });

      it('preserves the original array', () => {
        const headers = [
          { name: 'column2', value: 'custom_status.column2' },
          { name: 'column1', value: 'custom_status.column1' },
        ];

        const originalHeaders = [...headers];
        const visibleColumns = ['column1', 'column2'];

        wrapper.vm.sortHeadersByVisibleColumns(headers, visibleColumns);

        expect(headers[0].name).toBe(originalHeaders[0].name);
        expect(headers[1].name).toBe(originalHeaders[1].name);
      });
    });
  });

  describe('Expansive mode tests', () => {
    let expansiveWrapper;

    beforeEach(() => {
      const expansiveStore = createMockStore({
        agentsColumnsFilter: {
          visibleColumns: ['in_progress', 'closeds', 'column1', 'column2'],
        },
      });

      expansiveWrapper = mount(HumanServiceAgentsTable, {
        props: {
          isLoading: false,
          headerTitle: 'Expansive Title',
          headers: mockHeaders,
          items: mockItemsExpansive,
          isExpansive: true,
        },
        global: {
          plugins: [i18n, UnnnicSystem, expansiveStore],
          stubs: {
            UnnnicButtonIcon: {
              template:
                '<button data-testid="expand-button" @click="$emit(\'click\')">{{icon}}</button>',
              props: ['icon', 'size'],
              emits: ['click'],
            },
            UnnnicTableNext: true,
            AgentsTableHeader: true,
            AgentStatus: true,
          },
          mocks: {
            $t: (key) => key,
          },
        },
      });
    });

    afterEach(() => {
      if (expansiveWrapper) {
        expansiveWrapper.unmount();
      }
    });

    it('correctly formats headers in expansive mode', async () => {
      const headers = expansiveWrapper.vm.formattedHeaders;

      expect(headers.length).toBe(6);

      expect(headers[0].content).toBe('status');
      expect(headers[1].content).toBe('agent');

      expect(headers[1].size).toBe(1);

      expect(headers[0].size).toBe(0.5);
      expect(headers[2].size).toBe(0.5);
    });

    it('maintains the order of dynamic headers according to visibleColumns', () => {
      const customOrderStore = createMockStore({
        agentsColumnsFilter: {
          visibleColumns: ['column2', 'in_progress', 'column1', 'closeds'],
        },
      });

      const customOrderWrapper = mount(HumanServiceAgentsTable, {
        props: {
          isLoading: false,
          headerTitle: 'Custom Order',
          headers: mockHeaders,
          items: mockItemsExpansive,
          isExpansive: true,
        },
        global: {
          plugins: [i18n, UnnnicSystem, customOrderStore],
          stubs: {
            UnnnicButtonIcon: true,
            UnnnicTableNext: true,
            AgentsTableHeader: true,
            AgentStatus: true,
          },
          mocks: {
            $t: (key) => key,
          },
        },
      });

      const formattedHeaders = customOrderWrapper.vm.formattedHeaders;

      expect(formattedHeaders[0].content).toBe('status');
      expect(formattedHeaders[1].content).toBe('agent');

      expect(formattedHeaders[2].content).toBe('in_progress');
      expect(formattedHeaders[3].content).toBe('closeds');
      expect(formattedHeaders[4].content).toBe('column2');
      expect(formattedHeaders[5].content).toBe('column1');

      customOrderWrapper.unmount();
    });

    it('handles items with null or missing custom status values', () => {
      const items = expansiveWrapper.vm.formattedItems;
      const charlieItem = items.find((item) => item.agent === 'Charlie');

      expect(charlieItem).toBeTruthy();

      const charlieContent = charlieItem.content;

      const visibleColumns = ['in_progress', 'closeds', 'column1', 'column2'];
      let contentIndex = 2;

      let column1Index = -1;
      let column2Index = -1;

      if (visibleColumns.includes('in_progress')) {
        contentIndex++;
      }
      if (visibleColumns.includes('closeds')) {
        contentIndex++;
      }
      if (visibleColumns.includes('column1')) {
        column1Index = contentIndex++;
      }
      if (visibleColumns.includes('column2')) {
        column2Index = contentIndex++;
      }

      expect(charlieContent[column1Index]).toBe('00:00:00');
      expect(charlieContent[column2Index]).toBe('00:00:00');
    });
  });

  describe('Sorting functionality', () => {
    it('sorts by default when no header is selected', () => {
      const items = [...mockItems];
      wrapper.vm.sort = { header: '', order: '' };

      const sortedItems = wrapper.vm.sortItems(items);

      expect(sortedItems[0].agent).toBe('Charlie');
      expect(sortedItems[1].agent).toBe('Alice');

      expect(sortedItems[2].agent).toBe('Bob');
      expect(sortedItems[3].agent).toBe('Marcus');
    });

    it('sorts by status in non-expansive mode', async () => {
      await wrapper.setData({ sort: { header: 'status', order: 'desc' } });

      await wrapper.vm.$nextTick();

      const headers = wrapper.vm.formattedHeaders;
      const statusHeader = headers[0].content;

      wrapper.vm.sort.header = statusHeader;

      console.log(wrapper.vm.formattedItems);

      expect(wrapper.vm.formattedItems[0].status.status).toBe('gray');
      expect(wrapper.vm.formattedItems[1].status.status).toBe('gray');
      expect(wrapper.vm.formattedItems[2].status.status).toBe('green');
      expect(wrapper.vm.formattedItems[3].status.status).toBe('green');

      wrapper.vm.sort.order = 'asc';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.formattedItems[0].status.status).toBe('green');
      expect(wrapper.vm.formattedItems[1].status.status).toBe('green');
      expect(wrapper.vm.formattedItems[2].status.status).toBe('gray');
      expect(wrapper.vm.formattedItems[3].status.status).toBe('gray');
    });

    it('sorts by status in expansive mode', () => {
      const expansiveStore = createMockStore({
        agentsColumnsFilter: {
          visibleColumns: ['in_progress', 'closeds', 'column1', 'column2'],
        },
      });

      const expansiveWrapper = mount(HumanServiceAgentsTable, {
        props: {
          isLoading: false,
          headerTitle: 'Expansive Title',
          headers: mockHeaders,
          items: mockItemsExpansive,
          isExpansive: true,
        },
        global: {
          plugins: [i18n, UnnnicSystem, expansiveStore],
          stubs: {
            UnnnicButtonIcon: true,
            UnnnicTableNext: true,
            AgentsTableHeader: true,
            AgentStatus: true,
          },
          mocks: {
            $t: (key) => key,
          },
        },
      });

      const headers = expansiveWrapper.vm.formattedHeaders;
      const statusHeader = headers[0].content;

      expansiveWrapper.vm.sort = { header: statusHeader, order: 'asc' };
      const sortedItems = expansiveWrapper.vm.sortItems([
        ...mockItemsExpansive,
      ]);

      expect(sortedItems[0].status.status).toBe('green');
      expect(sortedItems[1].status.status).toBe('green');

      expect(sortedItems[2].status.status).toBe('gray');
      expect(sortedItems[3].status.status).toBe('gray');

      expansiveWrapper.vm.sort.order = 'desc';
      const sortedItemsDesc = expansiveWrapper.vm.sortItems([
        ...mockItemsExpansive,
      ]);

      expect(sortedItemsDesc[0].status.status).toBe('gray');
      expect(sortedItemsDesc[1].status.status).toBe('gray');

      expect(sortedItemsDesc[2].status.status).toBe('green');
      expect(sortedItemsDesc[3].status.status).toBe('green');

      expansiveWrapper.unmount();
    });
  });
});
