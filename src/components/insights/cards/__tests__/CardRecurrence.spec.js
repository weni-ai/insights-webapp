import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import CardRecurrence from '../CardRecurrence.vue';
import { useDashboards } from '@/store/modules/dashboards';

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
    store = createTestingPinia({
      initialState: {
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

  it('renders ProgressChart component when not in error state', () => {
    const wrapper = createWrapper({ data: [{ label: 'Item 1', value: 70 }] });
    const progressChart = wrapper.findComponent({ name: 'ProgressChart' });
    expect(progressChart.exists()).toBe(true);
  });

  it('emits clickData event when ProgressChart emits clickData', async () => {
    const testData = [{ label: 'Item 1', value: 70 }];
    const wrapper = createWrapper({ data: testData });
    const progressChart = wrapper.findComponent({ name: 'ProgressChart' });

    const clickData = { label: 'Item 1', data: 70 };
    await progressChart.vm.$emit('clickData', clickData);

    expect(wrapper.emitted('clickData')).toBeTruthy();
    expect(wrapper.emitted('clickData')[0][0]).toEqual(clickData);
  });

  it('passes correct props to ProgressChart component', () => {
    const testData = [
      { label: 'Item 1', value: 70 },
      { label: 'Item 2', value: 30 },
    ];
    const wrapper = createWrapper({ data: testData, isLoading: true });
    const progressChart = wrapper.findComponent({ name: 'ProgressChart' });

    expect(progressChart.props('data')).toEqual(testData);
    expect(progressChart.props('isLoading')).toBe(true);
  });

  it('passes loading state to ProgressChart component', () => {
    const wrapper = createWrapper({ isLoading: true });
    const progressChart = wrapper.findComponent({ name: 'ProgressChart' });
    expect(progressChart.props('isLoading')).toBe(true);
  });

  it('emit seeMore when see more link clicked', async () => {
    const wrapper = createWrapper({ seeMore: true });
    await wrapper.find('[data-testid="see-more-link"]').trigger('click');
    expect(wrapper.emitted('seeMore')).toBeTruthy();
  });

  it('emit request data when change appliedFilters', async () => {
    const wrapper = createWrapper();
    const dashboardsStore = useDashboards();
    dashboardsStore.appliedFilters = [{ filter: 'value' }];
    expect(wrapper.emitted('request-data')).toBeTruthy();
  });

  it('does not render ProgressChart when in error state', () => {
    const wrapper = createWrapper({ data: [] }); // Empty data triggers error state
    const progressChart = wrapper.findComponent({ name: 'ProgressChart' });
    expect(progressChart.exists()).toBe(false);
  });
});
