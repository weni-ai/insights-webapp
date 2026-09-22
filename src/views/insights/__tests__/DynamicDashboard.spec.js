import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, config, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { defineComponent, h } from 'vue';

import DynamicDashboard from '../DynamicDashboard.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';

const AsyncStub = defineComponent({
  name: 'AsyncDashboardStub',
  setup(_, { slots }) {
    return () => h('div', { class: 'async-dashboard-stub' }, slots.default?.());
  },
});

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    defineAsyncComponent: (loader) => {
      // Keep the dynamic import promise from rejecting after teardown by
      // settling it immediately, while rendering a sync stub in tests.
      if (typeof loader === 'function') {
        Promise.resolve()
          .then(() => loader())
          .catch(() => undefined);
      }
      return AsyncStub;
    },
  };
});

config.global.mocks = {
  $t: (key) => key,
};

describe('DynamicDashboard.vue', () => {
  let wrapper;
  let dashboardsStore;
  let widgetsStore;

  beforeEach(async () => {
    wrapper = mount(DynamicDashboard, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
    });

    dashboardsStore = useDashboards();
    widgetsStore = useWidgets();
    await flushPromises();
  });

  afterEach(async () => {
    wrapper?.unmount();
    wrapper = null;
    await flushPromises();
  });

  describe('Computed Properties', () => {
    it('should return correct dashboard type for custom dashboard', () => {
      expect(wrapper.vm.dashboardType).toBe('custom_dashboard');
    });

    it('should return correct dashboard type for expansive widget', async () => {
      widgetsStore.currentExpansiveWidget = { id: 1 };
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.dashboardType).toBe('expansive_widget');
    });

    it('should return correct dashboard type for whatsapp integration', async () => {
      dashboardsStore.currentDashboard = {
        config: { is_whatsapp_integration: true },
      };
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.dashboardType).toBe('meta_template_message');
    });

    it('should return correct dashboard type for ctwa dashboard', async () => {
      dashboardsStore.currentDashboard = {
        config: { type: 'ctwa' },
      };
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.dashboardType).toBe('ctwa');
    });
  });

  describe('Store Interactions', () => {
    it('should call getCurrentDashboardWidgets when dashboard UUID changes', async () => {
      const getCurrentDashboardWidgetsSpy = vi.spyOn(
        widgetsStore,
        'getCurrentDashboardWidgets',
      );
      const resetCurrentDashboardWidgetsSpy = vi.spyOn(
        widgetsStore,
        'resetCurrentDashboardWidgets',
      );
      const resetAppliedFiltersSpy = vi.spyOn(
        dashboardsStore,
        'resetAppliedFilters',
      );

      dashboardsStore.currentDashboard = { uuid: 'new-uuid' };
      await wrapper.vm.$nextTick();

      expect(resetCurrentDashboardWidgetsSpy).toHaveBeenCalled();
      expect(getCurrentDashboardWidgetsSpy).toHaveBeenCalled();
      expect(resetAppliedFiltersSpy).not.toHaveBeenCalled();
    });

    it('should call resetAppliedFilters when switching between dashboards', async () => {
      const resetAppliedFiltersSpy = vi.spyOn(
        dashboardsStore,
        'resetAppliedFilters',
      );

      dashboardsStore.currentDashboard = { uuid: 'first-uuid' };
      await wrapper.vm.$nextTick();

      expect(resetAppliedFiltersSpy).not.toHaveBeenCalled();

      dashboardsStore.currentDashboard = { uuid: 'second-uuid' };
      await wrapper.vm.$nextTick();

      expect(resetAppliedFiltersSpy).toHaveBeenCalled();
    });

    it('should reset currentWidgetEditing when switching between dashboards', async () => {
      const updateCurrentWidgetEditingSpy = vi.spyOn(
        widgetsStore,
        'updateCurrentWidgetEditing',
      );

      dashboardsStore.currentDashboard = { uuid: 'first-uuid' };
      await wrapper.vm.$nextTick();

      expect(updateCurrentWidgetEditingSpy).not.toHaveBeenCalled();

      dashboardsStore.currentDashboard = { uuid: 'second-uuid' };
      await wrapper.vm.$nextTick();

      expect(updateCurrentWidgetEditingSpy).toHaveBeenCalledWith(null);
    });

    it('should not reset currentWidgetEditing on initial dashboard load', async () => {
      const updateCurrentWidgetEditingSpy = vi.spyOn(
        widgetsStore,
        'updateCurrentWidgetEditing',
      );

      dashboardsStore.currentDashboard = { uuid: 'initial-uuid' };
      await wrapper.vm.$nextTick();

      expect(updateCurrentWidgetEditingSpy).not.toHaveBeenCalled();
    });
  });
});
