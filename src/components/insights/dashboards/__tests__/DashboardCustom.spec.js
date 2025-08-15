import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import DashboardCustom from '../DashboardCustom.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';
import { useOnboarding } from '@/store/modules/onboarding';
import { moduleStorage } from '@/utils/storage';

describe('DashboardCustom', () => {
  let wrapper;
  let dashboardsStore;
  let widgetsStore;
  let onboardingStore;

  const mockWidget = {
    uuid: '123',
    type: 'card',
    name: 'Test Widget',
    grid_position: {
      column_start: 1,
      column_end: 2,
      row_start: 1,
      row_end: 2,
    },
  };

  const mockDashboard = {
    is_deletable: true,
    grid: {
      columns: 2,
      rows: 2,
    },
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    wrapper = mount(DashboardCustom, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
        stubs: {
          DynamicWidget: true,
          DrawerConfigGallery: true,
          IconLoading: true,
          WidgetOnboarding: true,
          FlowResultContactListModal: true,
        },
      },
    });

    dashboardsStore = useDashboards();
    widgetsStore = useWidgets();
    onboardingStore = useOnboarding();

    // Setup default store values
    dashboardsStore.currentDashboard = mockDashboard;
    widgetsStore.currentDashboardWidgets = [mockWidget];
    widgetsStore.isLoadingCurrentDashboardWidgets = false;
    widgetsStore.currentWidgetEditing = null;
    onboardingStore.showConfigWidgetOnboarding = false;
  });

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('shows loading state when isLoadingCurrentDashboardWidgets is true', async () => {
    widgetsStore.isLoadingCurrentDashboardWidgets = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.dashboard__loading').exists()).toBe(true);
  });

  it('renders widgets when not loading', () => {
    expect(wrapper.findComponent({ name: 'DynamicWidget' }).exists()).toBe(
      true,
    );
  });

  it('applies correct grid style based on dashboard configuration', () => {
    const dashboard = wrapper.find('.dashboard');
    expect(dashboard.attributes('style')).toContain(
      'grid-template-columns: repeat(2, 1fr)',
    );
    expect(dashboard.attributes('style')).toContain(
      'grid-template-rows: repeat(2, 1fr)',
    );
  });

  it('handles widget open config correctly', async () => {
    const widget = { ...mockWidget };
    await wrapper.vm.handlerWidgetOpenConfig(widget);
    expect(widgetsStore.updateCurrentWidgetEditing).toHaveBeenCalledWith(
      widget,
    );
  });

  it('calculates widget style correctly', () => {
    const style = wrapper.vm.getWidgetStyle(mockWidget.grid_position);
    expect(style).toEqual({
      gridColumn: '1 / 3',
      gridRow: '1 / 3',
    });
  });

  it('returns correct widget onboarding id', () => {
    const cardId = wrapper.vm.getWidgetOnboardingId({ type: 'card' });
    const graphId = wrapper.vm.getWidgetOnboardingId({ type: 'graph' });
    expect(cardId).toBe('widget-card-metric');
    expect(graphId).toBe('widget-graph-empty');
  });

  it('handles flow result contact list modal correctly', async () => {
    const data = { label: 'Test', flow: { id: 1 } };
    await wrapper.vm.openFlowResultContactList(data);
    expect(wrapper.vm.showFlowResultsContactListModal).toBe(true);
    expect(wrapper.vm.flowResultsContactListParams).toEqual(data);

    await wrapper.vm.closeFlowResultContactList();
    expect(wrapper.vm.showFlowResultsContactListModal).toBe(false);
    expect(wrapper.vm.flowResultsContactListParams).toEqual({});
  });

  it('shows onboarding when conditions are met', async () => {
    moduleStorage.setItem('hasWidgetsOnboardingComplete', false);
    widgetsStore.currentDashboardWidgets = [
      {
        type: 'card',
        name: '',
        grid_position: {
          column_start: 1,
          column_end: 2,
          row_start: 1,
          row_end: 2,
        },
      },
      {
        type: 'empty_column',
        grid_position: {
          column_start: 2,
          column_end: 3,
          row_start: 1,
          row_end: 2,
        },
      },
    ];

    await wrapper.vm.handlerWidgetsOnboarding();
    expect(onboardingStore.setShowConfigWidgetsOnboarding).toHaveBeenCalledWith(
      true,
    );
  });
});
