import { mount, config } from '@vue/test-utils';
import SingleTable from '../SingleTable.vue';
import { beforeEach, describe } from 'vitest';
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

const tableHeaders = [
  { content: 'Label' },
  { content: 'Type' },
  { content: 'Total' },
  { content: 'Clicks in relation to the shot' },
  { content: 'Click rate' },
];

const tableRows = [
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
  { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
];

describe('SingleTable', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SingleTable, {
      global: {
        // stubs: {
        //   UnnnicTableNext: true,
        // },
      },
      props: {
        title: 'Test Table',
        pagination: 1,
        paginationTotal: tableRows.length,
        paginationInterval: tableRows.length,
        headers: tableHeaders,
        rows: tableRows,
      },
    });
  });

  it('renders the table title if provided', () => {
    const title = wrapper.find('[data-testid="single-table-title"]');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Test Table');
  });

  it('does not render the table title if no title is provided', async () => {
    await wrapper.setProps({ title: '' });
    expect(wrapper.find('[data-testid="single-table-title"]').exists()).toBe(
      false,
    );
  });

  it('emits changePage event when pagination changes', async () => {
    const paginationComponent = wrapper.findComponent(
      '[data-testid="single-table"]',
    );

    await paginationComponent.vm.$emit('update:pagination', 2);

    expect(wrapper.emitted('changePage')).toBeTruthy();
    expect(wrapper.emitted('changePage')[0]).toEqual([2]);
  });

  it('displays pagination when hidePagination is false', async () => {
    const paginationCssToken = wrapper.vm.paginationCssToken;
    expect(paginationCssToken).toBe('flex');
  });

  it('hides pagination when hidePagination is true', async () => {
    await wrapper.setProps({ hidePagination: true });
    const paginationCssToken = wrapper.vm.paginationCssToken;
    expect(paginationCssToken).toBe('none');
  });
});
