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

  it('emits clickData event when an item is clicked', async () => {
    const wrapper = createWrapper({ data: [{ label: 'Item 1', value: 70 }] });

    await wrapper
      .find('[data-testid="content-container-group"]')
      .trigger('click');
    expect(wrapper.emitted('clickData')).toBeTruthy();
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

  it('emit request data when change appliedFilters ', async () => {
    const wrapper = createWrapper();
    store.state.dashboards.appliedFilters = [{ filter: 'value' }];
    expect(wrapper.emitted('request-data')).toBeTruthy();
  });
});
