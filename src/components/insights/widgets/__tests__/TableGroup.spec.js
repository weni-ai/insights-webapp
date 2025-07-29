import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import TableGroup from '../TableGroup.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
    },
  ],
});

const createWrapper = (props = {}) => {
  return mount(TableGroup, {
    props: {
      tabs: {
        tab1: {
          name: 'Tab 1',
          fields: [{ display: true, name: 'Field 1', value: 'field1' }],
        },
        tab2: { name: 'Tab 2' },
      },
      data: [{ field1: 'Value' }],
      ...props,
    },
    global: {
      plugins: [router],
    },
  });
};

describe('TableGroup', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Rendering', () => {
    it('renders the tab component with the correct props', () => {
      const tab = wrapper.findComponent('[data-testid="tab"]');
      expect(tab.exists()).toBe(true);
      expect(tab.props('tabs')).toEqual(['tab1', 'tab2']);

      expect(tab.props('activeTab')).toBe('tab1');
    });

    it('renders the correct number of tab heads based on the provided tabs', () => {
      expect(wrapper.text()).toContain('Tab 1');
      expect(wrapper.text()).toContain('Tab 2');
    });

    it('renders the table component in the active tab panel', () => {
      const table = wrapper.findComponent('[data-testid="table"]');
      expect(table.exists()).toBe(true);
      expect(table.props('headers')).toEqual([
        { content: 'Field 1', value: 'field1' },
      ]);
      expect(table.props('rows')).toEqual([
        { field1: 'Value', content: ['Value'] },
      ]);
    });

    it('returns null when no activeTab is found and no default tab is available', () => {
      wrapper.vm.activeTabName = 'nonExistingTab';
      nextTick();
      expect(wrapper.vm.activeTab).toBeNull();
    });
  });

  describe('Props Handling', () => {
    it('renders the loading state when isLoading is true', async () => {
      await wrapper.setProps({ isLoading: true });
      const table = wrapper.findComponent('[data-testid="table"]');
      expect(table.props('isLoading')).toBe(true);
    });

    it('displays the correct pagination details based on paginationTotal and paginationInterval', () => {
      const paginationTotal = 50;
      const paginationInterval = 10;
      wrapper = createWrapper({ paginationTotal });
      wrapper.vm.paginationInterval = paginationInterval;
      nextTick();

      const table = wrapper.findComponent('[data-testid="table"]');
      expect(table.props('paginationTotal')).toBe(paginationTotal);
      expect(wrapper.vm.paginationConfig.limit).toBe(paginationInterval);
    });
  });

  describe('Table Data Handling', () => {
    it('computes dynamic headers from activeTab fields', () => {
      const headers = wrapper.vm.activeTable.headers;

      expect(headers).toEqual([{ content: 'Field 1', value: 'field1' }]);
    });

    it('computes dynamic rows from the provided data', () => {
      const rows = wrapper.vm.activeTable.rows;

      expect(rows).toEqual([{ field1: 'Value', content: ['Value'] }]);
    });

    it('formats row values correctly for dates, arrays, and strings', async () => {
      const mockData = [{ field1: '2024-01-01T15:30:00-03:00' }];
      await wrapper.setProps({ data: mockData });

      const rows = wrapper.vm.activeTable.rows;

      const expectedFormat = /^\d{2}:\d{2} \| \d{2}\/\d{2}\/\d{4}$/;
      expect(rows[0].content[0]).toMatch(expectedFormat);
    });
  });

  describe('Pagination Functionality', () => {
    it('computes the correct pagination offset and limit', () => {
      expect(wrapper.vm.paginationConfig).toEqual({ limit: 5, offset: 0 });

      wrapper.setData({ page: 1 });
      expect(wrapper.vm.paginationConfig).toEqual({ limit: 5, offset: 5 });
    });

    it('resets the page when route query changes', async () => {
      await wrapper.setData({ page: 1 });

      wrapper.vm.$options.watch['$route.query'].handler.call(
        wrapper.vm,
        {
          slug: 'tab1',
        },
        { slug: 'tab2' },
      );

      expect(wrapper.vm.page).toBe(0);
    });

    it('updates the page decresing 1 when table emits update:pagination', async () => {
      const table = wrapper.findComponent('[data-testid="table"]');

      await table.vm.$emit('update:pagination', 1);

      expect(wrapper.vm.page).toBe(0);
    });
  });

  describe('Event Handling', () => {
    it('updates the activeTabName when the change event is triggered on tab', async () => {
      const tab = wrapper.findComponent('[data-testid="tab"]');

      await tab.vm.$emit('change', 'tab2');

      expect(wrapper.vm.activeTabName).toBe('tab2');
    });
  });

  describe('Unmount Behavior', () => {
    it('removes the slug query parameter from the route on unmount', async () => {
      router.currentRoute.query = { slug: 'testSlug' };
      const replaceSpy = vi.spyOn(router, 'replace');

      await wrapper.unmount();

      expect(replaceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.not.objectContaining({ slug: 'testSlug' }),
        }),
      );
    });
  });
});
