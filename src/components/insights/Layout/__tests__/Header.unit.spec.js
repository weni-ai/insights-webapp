import { beforeAll, afterAll, describe, it } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import Header from '../Header.vue';
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
  routes: [
    {
      path: '/dashboard/:dashboardUuid',
      name: 'dashboard',
      component: { template: '<div/>' },
    },
    {
      path: '/dashboard/:dashboardUuid/report',
      name: 'report',
      component: { template: '<div/>' },
    },
  ],
});

const createWrapper = (storeState = {}) =>
  mount(Header, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            dashboards: {
              currentDashboard: { name: 'test', uuid: '123' },
              dashboards: [{ name: 'test', uuid: '123' }],
              dashboardDefault: { uuid: '123' },
              currentDashboardFilters: [],
              appliedFilters: {},
              ...storeState.dashboards,
            },
            widgets: {
              currentExpansiveWidget: {},
              ...storeState.widgets,
            },
            humanSupport: {
              activeTab: 'overview',
              ...storeState.humanSupport,
            },
          },
          stubActions: false,
        }),
        router,
      ],
      stubs: {
        HeaderSelectDashboard: true,
        DynamicHeader: true,
        UnnnicBreadcrumb: true,
        UnnnicButtonIcon: true,
      },
    },
  });

describe('Header', () => {
  let wrapper;

  describe('Component rendering', () => {
    it('renders header when currentDashboard exists', async () => {
      await router.push({
        name: 'dashboard',
        params: { dashboardUuid: '123' },
      });
      wrapper = createWrapper();
      expect(
        wrapper.find('[data-testid="insights-layout-header"]').exists(),
      ).toBe(true);
    });

    it('does not render when currentDashboard is null', () => {
      wrapper = createWrapper({ dashboards: { currentDashboard: null } });
      expect(
        wrapper.find('[data-testid="insights-layout-header"]').exists(),
      ).toBe(false);
    });

    it('renders content section when not in expansive mode', async () => {
      await router.push({
        name: 'dashboard',
        params: { dashboardUuid: '123' },
      });
      wrapper = createWrapper();
      expect(
        wrapper.find('[data-testid="insights-layout-header-content"]').exists(),
      ).toBe(true);
    });

    it('renders expansive section when in expansive mode', () => {
      wrapper = createWrapper({
        widgets: { currentExpansiveWidget: { uuid: '456', name: 'Widget' } },
      });
      expect(
        wrapper
          .find('[data-testid="insights-layout-header-expansive"]')
          .exists(),
      ).toBe(true);
    });
  });

  describe('Dashboard type detection', () => {
    const cases = [
      ['human_service_dashboard.title', 'human_service'],
      ['human_support_dashboard.title', 'human_support'],
      ['conversations_dashboard.title', 'conversational'],
    ];

    cases.forEach(([name, type]) => {
      it(`detects ${type} for ${name}`, async () => {
        await router.push({
          name: 'dashboard',
          params: { dashboardUuid: '123' },
        });
        wrapper = createWrapper({
          dashboards: {
            currentDashboard: { name, uuid: '123' },
            dashboards: [{ name, uuid: '123' }],
          },
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.dashboardHeaderType).toBe(type);
      });
    });

    it('detects metaTemplateMessage for whatsapp integration', async () => {
      await router.push({
        name: 'dashboard',
        params: { dashboardUuid: '123' },
      });
      wrapper = createWrapper({
        dashboards: {
          currentDashboard: {
            name: 'test',
            uuid: '123',
            config: { is_whatsapp_integration: true },
          },
          dashboards: [
            {
              name: 'test',
              uuid: '123',
              config: { is_whatsapp_integration: true },
            },
          ],
        },
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.dashboardHeaderType).toBe('metaTemplateMessage');
    });

    it('defaults to custom for unknown dashboard', async () => {
      await router.push({
        name: 'dashboard',
        params: { dashboardUuid: '123' },
      });
      wrapper = createWrapper({
        dashboards: {
          currentDashboard: { name: 'unknown', uuid: '123' },
          dashboards: [{ name: 'unknown', uuid: '123' }],
        },
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.dashboardHeaderType).toBe('custom');
    });
  });

  describe('Expansive mode', () => {
    it('detects expansive mode when currentExpansiveWidget exists', () => {
      wrapper = createWrapper({
        widgets: { currentExpansiveWidget: { uuid: '1', name: 'Test' } },
      });
      expect(wrapper.vm.isExpansiveMode).toBe(true);
    });

    it('not in expansive mode when currentExpansiveWidget is empty', () => {
      wrapper = createWrapper({ widgets: { currentExpansiveWidget: {} } });
      expect(wrapper.vm.isExpansiveMode).toBe(false);
    });
  });

  describe('Breadcrumbs', () => {
    it('generates breadcrumbs for dashboard route', async () => {
      await router.push({
        name: 'dashboard',
        params: { dashboardUuid: '123' },
      });
      wrapper = createWrapper({
        dashboards: {
          currentDashboard: { name: 'test_dashboard', uuid: '123' },
        },
      });
      const crumbs = wrapper.vm.breadcrumbs;
      expect(crumbs).toHaveLength(1);
      expect(crumbs[0].routeName).toBe('dashboard');
    });

    it('generates breadcrumbs for report route', async () => {
      await router.push({ name: 'report', params: { dashboardUuid: '123' } });
      wrapper = createWrapper({
        dashboards: {
          currentDashboard: { name: 'test_dashboard', uuid: '123' },
        },
      });
      const crumbs = wrapper.vm.breadcrumbs;
      expect(crumbs).toHaveLength(2);
    });

    it('returns empty array when dashboardUuid does not match', async () => {
      await router.push({
        name: 'dashboard',
        params: { dashboardUuid: '999' },
      });
      wrapper = createWrapper({
        dashboards: { currentDashboard: { name: 'test', uuid: '123' } },
      });
      expect(wrapper.vm.breadcrumbs).toEqual([]);
    });
  });

  describe('Component structure', () => {
    it('passes dashboardHeaderType to DynamicHeader', async () => {
      await router.push({
        name: 'dashboard',
        params: { dashboardUuid: '123' },
      });
      wrapper = createWrapper({
        dashboards: {
          currentDashboard: {
            name: 'human_service_dashboard.title',
            uuid: '123',
          },
          dashboards: [{ name: 'human_service_dashboard.title', uuid: '123' }],
        },
      });
      await wrapper.vm.$nextTick();
      const dynamicHeader = wrapper.findComponent({ name: 'DynamicHeader' });
      expect(dynamicHeader.props('dashboardType')).toBe('human_service');
    });
  });
});
