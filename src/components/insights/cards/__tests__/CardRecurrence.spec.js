import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import CardRecurrence from '../CardRecurrence.vue';

describe('CardRecurrence.vue', () => {
  let store;

  const createWrapper = (props) => {
    return mount(CardRecurrence, {
      global: { plugins: [store] },
      props: {
        isLoading: false,
        widget: { name: 'Test Widget' },
        data: [],
        ...props,
      },
    });
  };

  beforeEach(() => {
    store = createStore({
      state: {
        dashboards: {
          appliedFilters: [],
        },
      },
    });
  });

  it('renders widget name', () => {
    const wrapper = createWrapper({ data: [{ label: 'Test', value: 50 }] });
    expect(wrapper.text()).toContain('Test Widget');
  });

  it('emits open-config event when button is clicked', async () => {
    const wrapper = createWrapper();
    await wrapper
      .find('[data-testid="card-recurrence-config-button-configurable"]')
      .trigger('click');
    expect(wrapper.emitted('open-config')).toBeTruthy();
  });

  it('always renders exactly 5 rows', () => {
    const wrapper = createWrapper({ data: [{ label: 'Item 1', value: 70 }] });
    const groups = wrapper.findAll('[data-testid="content-container-group"]');
    expect(groups).toHaveLength(5);
  });

  it('emits clickData event only when clicking row with data', async () => {
    const testData = [{ label: 'Item 1', value: 70 }];
    const wrapper = createWrapper({ data: testData });

    await wrapper.findAll('[data-testid="content-container-group"]')[0].trigger('click');
    expect(wrapper.emitted('clickData')).toBeTruthy();
    expect(wrapper.emitted('clickData')[0][0]).toEqual({ label: 'Item 1', data: 70 });

    await wrapper.findAll('[data-testid="content-container-group"]')[1].trigger('click');
    expect(wrapper.emitted('clickData')).toHaveLength(1);
  });

  it('renders content correctly for rows with data', () => {
    const testData = [
      { label: 'Item 1', value: 70 },
      { label: 'Item 2', value: 30 }
    ];
    const wrapper = createWrapper({ data: testData });
    
    const contentTexts = wrapper.findAll('.content__container-item-text');
    expect(contentTexts[0].text()).toBe('Item 1');
    expect(contentTexts[1].text()).toBe('Item 2');
  });

  it('shows loading icon when isLoading is true', () => {
    const wrapper = createWrapper({ isLoading: true });
    expect(wrapper.find('[data-testid="icon-loading"]').exists()).toBe(true);
  });

  it('emit seeMore when see more link clicked', async () => {
    const wrapper = createWrapper({ seeMore: true });
    await wrapper.find('[data-testid="see-more-link"]').trigger('click');
    expect(wrapper.emitted('seeMore')).toBeTruthy();
  });

  it('emit request data when change appliedFilters', async () => {
    const wrapper = createWrapper();
    store.state.dashboards.appliedFilters = [{ filter: 'value' }];
    expect(wrapper.emitted('request-data')).toBeTruthy();
  });

  it('applies empty state styling to rows without data', () => {
    const wrapper = createWrapper({ data: [{ label: 'Item 1', value: 70 }] });
    const groups = wrapper.findAll('[data-testid="content-container-group"]');
    
    expect(groups[0].find('.content').exists()).toBe(true);
    
    for (let i = 1; i < 5; i++) {
      expect(groups[i].find('.content').exists()).toBe(false);
    }
  });
});
