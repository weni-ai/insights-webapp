import { beforeAll, afterAll, describe, it } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';
import HeaderHumanSupport from '../HeaderHumanSupport.vue';
import i18n from '@/utils/plugins/i18n';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter((p) => p !== i18n);
  config.global.plugins.push(
    createI18n({ legacy: false, locale: 'en', messages: { en: {} } }),
  );
});

afterAll(() => {
  config.global.plugins = config.global.plugins.filter((p) => p !== i18n);
});

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div/>' } }],
});

const createWrapper = (storeState = {}) =>
  shallowMount(HeaderHumanSupport, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            dashboards: {
              currentDashboardFilters: [],
              appliedFilters: {},
              ...storeState.dashboards,
            },
            humanSupport: { activeTab: 'analysis', ...storeState.humanSupport },
          },
          stubActions: false,
        }),
        router,
      ],
      stubs: {
        HeaderTagLive: true,
        LastUpdatedText: true,
        HeaderRefresh: true,
        InsightsLayoutHeaderFilters: true,
        HumanSupportExport: true,
      },
    },
  });

describe('HeaderHumanSupport', () => {
  let wrapper;

  describe('Component rendering', () => {
    it('renders HumanSupportExport always', () => {
      wrapper = createWrapper();
      expect(
        wrapper.findComponent({ name: 'HumanSupportExport' }).exists(),
      ).toBe(true);
    });

    it('renders HeaderTagLive when in monitoring tab', () => {
      wrapper = createWrapper({
        humanSupport: { activeTab: 'monitoring' },
      });
      expect(
        wrapper
          .find('[data-testid="insights-layout-header-tag-live"]')
          .exists(),
      ).toBe(true);
    });

    it('does not render HeaderTagLive when in analysis tab', () => {
      wrapper = createWrapper({
        humanSupport: { activeTab: 'analysis' },
      });
      expect(
        wrapper
          .find('[data-testid="insights-layout-header-tag-live"]')
          .exists(),
      ).toBe(false);
    });

    it('renders filters when hasFilters is true', () => {
      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [{ name: 'filter1' }] },
      });
      expect(
        wrapper.find('[data-testid="insights-layout-header-filters"]').exists(),
      ).toBe(true);
    });

    it('does not render filters when hasFilters is false', () => {
      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [] },
      });
      expect(
        wrapper.find('[data-testid="insights-layout-header-filters"]').exists(),
      ).toBe(false);
    });
  });

  describe('Monitoring-specific rendering', () => {
    it('renders LastUpdatedText when in monitoring tab', () => {
      wrapper = createWrapper({
        humanSupport: { activeTab: 'monitoring' },
      });
      expect(wrapper.findComponent({ name: 'LastUpdatedText' }).exists()).toBe(
        true,
      );
    });

    it('does not render LastUpdatedText when in analysis tab', () => {
      wrapper = createWrapper({
        humanSupport: { activeTab: 'analysis' },
      });
      expect(wrapper.findComponent({ name: 'LastUpdatedText' }).exists()).toBe(
        false,
      );
    });

    it('renders HeaderRefresh when in monitoring tab', () => {
      wrapper = createWrapper({
        humanSupport: { activeTab: 'monitoring' },
      });
      const refresh = wrapper.findComponent({ name: 'HeaderRefresh' });
      expect(refresh.exists()).toBe(true);
      expect(refresh.props('type')).toBe('human-support');
    });

    it('does not render HeaderRefresh when in analysis tab', () => {
      wrapper = createWrapper({
        humanSupport: { activeTab: 'analysis' },
      });
      expect(wrapper.findComponent({ name: 'HeaderRefresh' }).exists()).toBe(
        false,
      );
    });
  });

  describe('Computed properties', () => {
    it('isMonitoring returns true when activeTab is monitoring', () => {
      wrapper = createWrapper({
        humanSupport: { activeTab: 'monitoring' },
      });
      expect(wrapper.vm.isMonitoring).toBe(true);
    });

    it('isMonitoring returns false when activeTab is analysis', () => {
      wrapper = createWrapper({
        humanSupport: { activeTab: 'analysis' },
      });
      expect(wrapper.vm.isMonitoring).toBe(false);
    });

    it('hasFilters returns correct value', () => {
      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [{ name: 'f1' }] },
      });
      expect(wrapper.vm.hasFilters).toBe(true);

      wrapper = createWrapper({
        dashboards: { currentDashboardFilters: [] },
      });
      expect(wrapper.vm.hasFilters).toBe(false);
    });
  });
});
