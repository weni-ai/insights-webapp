import { mount, config } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStore } from 'vuex';

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
      status: 'green',
      opened: 5,
      closed: 3,
      link: { url: '/link1' },
    },
    {
      agent: 'Bob',
      status: 'grey',
      opened: 2,
      closed: 7,
      link: { url: '/link2' },
    },
    {
      agent: 'Marcus',
      status: 'grey',
      opened: 2,
      closed: 7,
      link: { url: '/link4' },
    },
    {
      agent: 'Charlie',
      status: 'green',
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
    return createStore({
      modules: {
        agentsColumnsFilter: {
          namespaced: true,
          state: {
            visibleColumns: ['column1', 'column2'],
            ...overrideState.agentsColumnsFilter,
          },
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
        expect(firstItem.view_mode_url).toBe('/link1');
        expect(firstItem.link).toBeUndefined();
      });

      it('returns empty array when no headers or items', async () => {
        await wrapper.setProps({ headers: [], items: [] });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.formattedItems).toEqual([]);
      });

      it('preserves item properties in formatted items', () => {
        const formattedItems = wrapper.vm.formattedItems;
        const originalItem = mockItems[0];
        const formattedItem = formattedItems[0];

        expect(formattedItem.agent).toBe(originalItem.agent);
        expect(formattedItem.status).toBe(originalItem.status);
        expect(formattedItem.opened).toBe(originalItem.opened);
        expect(formattedItem.closed).toBe(originalItem.closed);

        expect(formattedItem.view_mode_url).toBe(originalItem.link.url);
      });
    });
  });

  describe('Methods', () => {
    describe('formatSecondsToTime', () => {
      it('formats seconds to time strings correctly', () => {
        expect(wrapper.vm.formatSecondsToTime(0)).toBe('00:00:00');
        expect(wrapper.vm.formatSecondsToTime(61)).toBe('00:01:01'); // 1m 1s
        expect(wrapper.vm.formatSecondsToTime(363600)).toBe('101:00:00'); // 101h
      });

      it('handles edge cases in formatSecondsToTime', () => {
        expect(wrapper.vm.formatSecondsToTime(0)).toBe('00:00:00');
        expect(wrapper.vm.formatSecondsToTime(null)).toBe('00:00:00');
        expect(wrapper.vm.formatSecondsToTime(undefined)).toBe('00:00:00');
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
  });

  describe('Expansive mode tests', () => {
    let expansiveWrapper;

    beforeEach(() => {
      const expansiveStore = createMockStore();
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

      expect(headers.length).toBeGreaterThan(4);
    });
  });
});
