import { beforeAll, afterAll, describe, it, vi } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import DynamicHeader from '../DynamicHeader.vue';
import i18n from '@/utils/plugins/i18n';

vi.mock('moment', () => ({ default: () => ({ format: () => '2024-01-15' }) }));

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

const createWrapper = (props = {}, storeState = {}) =>
  shallowMount(DynamicHeader, {
    props: { dashboardType: 'custom', ...props },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            dashboards: {
              currentDashboard: { name: 'test_dashboard' },
              currentDashboardFilters: [],
              appliedFilters: {},
              ...storeState.dashboards,
            },
            humanSupport: { activeTab: 'overview', ...storeState.humanSupport },
          },
          stubActions: false,
        }),
        router,
      ],
      stubs: {
        HeaderHumanService: true,
        HeaderHumanSupport: true,
        HeaderConversational: true,
        HeaderDefault: true,
      },
    },
  });

describe('DynamicHeader', () => {
  let wrapper;

  describe('Component Delegation', () => {
    [
      ['human_service', 'HeaderHumanService'],
      ['human_support', 'HeaderHumanSupport'],
      ['conversational', 'HeaderConversational'],
      ['custom', 'HeaderDefault'],
      ['unknown', 'HeaderDefault'],
    ].forEach(([type, component]) => {
      it(`renders ${component} for ${type}`, () => {
        wrapper = createWrapper({ dashboardType: type });
        const stub = wrapper.findComponent({ name: component });
        expect(stub.exists()).toBe(true);
      });
    });
  });

  describe('Props Passing', () => {
    it('passes hasFilters correctly', () => {
      wrapper = createWrapper(
        {},
        { dashboards: { currentDashboardFilters: [{ name: 'f1' }] } },
      );
      expect(wrapper.vm.componentProps.hasFilters).toBe(true);
    });

    it('passes all props for human_service', () => {
      wrapper = createWrapper(
        { dashboardType: 'human_service' },
        {
          dashboards: {
            currentDashboard: { name: 'human_service_dashboard.title' },
            currentDashboardFilters: [{ name: 'date', type: 'date_range' }],
            appliedFilters: {
              date: { __gte: '2024-01-15', __lte: '2024-01-15' },
            },
          },
        },
      );
      const props = wrapper.vm.componentProps;
      expect(props.hasFilters).toBe(true);
      expect(props.showTagLive).toBe(true);
      expect(props.isRenderInsightButton).toBe(true);
      expect(props.isRenderHumanSupportBtnExport).toBe(true);
    });

    it('passes props for human_support', () => {
      wrapper = createWrapper(
        { dashboardType: 'human_support' },
        {
          dashboards: {
            currentDashboard: { name: 'human_support_dashboard.title' },
          },
        },
      );
      expect(wrapper.vm.componentProps.isRenderHumanSupportBtnExport).toBe(
        true,
      );
    });

    it('passes props for conversational', () => {
      wrapper = createWrapper(
        { dashboardType: 'conversational' },
        {
          dashboards: {
            currentDashboard: { name: 'conversations_dashboard.title' },
          },
        },
      );
      expect(wrapper.vm.componentProps).toHaveProperty(
        'isRenderConversationalBtnExport',
      );
    });
  });

  describe('Computed Properties', () => {
    it('hasFilters reflects filter state', () => {
      wrapper = createWrapper(
        {},
        { dashboards: { currentDashboardFilters: [{ name: 'f' }] } },
      );
      expect(wrapper.vm.hasFilters).toBe(true);
      wrapper = createWrapper();
      expect(wrapper.vm.hasFilters).toBe(false);
    });

    it('showTagLive for monitoring', () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboard: { name: 'human_support_dashboard.title' },
          },
          humanSupport: { activeTab: 'monitoring' },
        },
      );
      expect(wrapper.vm.showTagLive).toBe(true);
    });

    it('showTagLive for today filter', () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboardFilters: [
              { name: 'created_on', type: 'date_range' },
            ],
            appliedFilters: {
              created_on: { __gte: '2024-01-15', __lte: '2024-01-15' },
            },
          },
        },
      );
      expect(wrapper.vm.showTagLive).toBe(true);
    });

    it('showTagLive without date filter', () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboardFilters: [{ name: 'date', type: 'date_range' }],
          },
        },
      );
      expect(wrapper.vm.showTagLive).toBe(true);
    });

    it('isRenderInsightButton for human service', () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboard: { name: 'human_service_dashboard.title' },
          },
        },
      );
      expect(wrapper.vm.isRenderInsightButton).toBe(true);
      wrapper = createWrapper();
      expect(wrapper.vm.isRenderInsightButton).toBe(false);
    });

    it('isRenderHumanSupportBtnExport for dashboards', () => {
      [
        'human_service_dashboard.title',
        'human_support_dashboard.title',
      ].forEach((name) => {
        wrapper = createWrapper(
          {},
          { dashboards: { currentDashboard: { name } } },
        );
        expect(wrapper.vm.isRenderHumanSupportBtnExport).toBe(true);
      });
      wrapper = createWrapper();
      expect(wrapper.vm.isRenderHumanSupportBtnExport).toBe(false);
    });

    [true, false].forEach((enabled) => {
      it(`isRenderConversationalBtnExport ${enabled}`, () => {
        wrapper = createWrapper(
          { dashboardType: 'conversational' },
          {
            dashboards: {
              currentDashboard: { name: 'conversations_dashboard.title' },
            },
          },
        );
        wrapper.vm.$pinia._s.get('featureFlag').isFeatureFlagEnabled = vi.fn(
          () => enabled,
        );
        expect(wrapper.vm.isRenderConversationalBtnExport).toBe(enabled);
      });
    });
  });

  describe('Dashboard Detection', () => {
    [
      ['isHumanServiceDashboard', 'human_service_dashboard.title'],
      ['isHumanSupportDashboard', 'human_support_dashboard.title'],
      ['isConversationalDashboard', 'conversations_dashboard.title'],
    ].forEach(([prop, name]) => {
      it(`detects ${name}`, () => {
        wrapper = createWrapper(
          {},
          { dashboards: { currentDashboard: { name } } },
        );
        expect(wrapper.vm[prop]).toBe(true);
      });
    });

    it('detects monitoring dashboard', () => {
      wrapper = createWrapper(
        {},
        {
          dashboards: {
            currentDashboard: { name: 'human_support_dashboard.title' },
          },
          humanSupport: { activeTab: 'monitoring' },
        },
      );
      expect(wrapper.vm.isHumanSupportMonitoringDashboard).toBe(true);
    });
  });
});
