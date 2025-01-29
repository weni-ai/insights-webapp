import { mount, config } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('HumanServiceAgentsTable', () => {
  let wrapper;

  const mockHeaders = [
    { name: 'Agent', display: true },
    { name: 'Opened', display: true },
    { name: 'Closed', display: true },
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

  beforeEach(() => {
    wrapper = mount(HumanServiceAgentsTable, {
      props: {
        isLoading: false,
        headerTitle: 'Title',
        headers: mockHeaders,
        items: mockItems,
      },
    });
  });

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

  it('formats headers correctly', () => {
    const formattedHeaders = wrapper.vm.formattedHeaders;
    expect(formattedHeaders).toHaveLength(3);
    expect(formattedHeaders[0]).toMatchObject({
      content: 'Agent',
      isSortable: true,
      size: 0.4,
    });
  });

  it('formats items correctly', () => {
    const formattedItems = wrapper.vm.formattedItems;
    expect(formattedItems).toHaveLength(4);
    expect(formattedItems[0].content).toHaveLength(4);
  });

  it('call redirectItem on table emitted "row-click"', async () => {
    const redirectSpy = vi.spyOn(wrapper.vm, 'redirectItem');

    const table = wrapper.findComponent(
      '[data-testid="human-service-agents-table"]',
    );

    await table.vm.$emit('row-click', mockItems[0]);
    expect(redirectSpy).toHaveBeenCalledWith(mockItems[0]);
  });

  it('updates sort state and sorts items correctly when sort event is emitted', async () => {
    const table = wrapper.findComponent(
      '[data-testid="human-service-agents-table"]',
    );
    await table.vm.$emit('sort', { header: 'Opened', order: 'asc' });

    expect(wrapper.vm.sort).toMatchObject({ header: 'Opened', order: 'asc' });

    const sortedItems = wrapper.vm.formattedItems;
    expect(sortedItems[0].opened).toBe(2);
  });

  it('renders loading state correctly', async () => {
    await wrapper.setProps({ isLoading: true });
    const table = wrapper.findComponent(
      '[data-testid="human-service-agents-table"]',
    );
    expect(table.props('isLoading')).toBe(true);
  });

  it('handles empty headers and items gracefully', async () => {
    await wrapper.setProps({ headers: [], items: [] });
    expect(wrapper.vm.formattedHeaders).toHaveLength(0);
    expect(wrapper.vm.formattedItems).toHaveLength(0);
  });

  it('calls sortItems correctly for string values', () => {
    wrapper.setData({
      sort: { header: 'Agent', order: 'desc' },
    });
    const sortedItems = wrapper.vm.sortItems(mockItems);
    expect(sortedItems[0].opened).toBe(2);
  });

  it('calls sortItems correctly for non-string values', () => {
    wrapper.setData({
      sort: { header: 'Opened', order: 'desc' },
    });
    const sortedItems = wrapper.vm.sortItems(mockItems);
    expect(sortedItems[0].opened).toBe(8);
  });
});
