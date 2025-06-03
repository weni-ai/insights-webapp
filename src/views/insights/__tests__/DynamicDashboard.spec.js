import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import DynamicDashboard from '../DynamicDashboard.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@weni/unnnic-system';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];
config.global.mocks = {
  $t: (key) => key,
};

describe('DynamicDashboard.vue', () => {
  let wrapper;
  let dashboardsStore;
  let widgetsStore;

  beforeEach(() => {
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
      expect(resetAppliedFiltersSpy).toHaveBeenCalled();
      expect(getCurrentDashboardWidgetsSpy).toHaveBeenCalled();
    });
  });
});
