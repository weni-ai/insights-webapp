import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import BetaText from '../BetaText.vue';

const mockDashboardsStore = {
  currentDashboard: { value: { name: 'conversations_dashboard.title' } },
};

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: () => mockDashboardsStore,
}));

vi.mock('pinia', () => ({
  storeToRefs: (store) => store,
}));

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

describe('BetaText', () => {
  let wrapper;

  const createWrapper = () => mount(BetaText);

  const betaContainer = () => wrapper.find('[data-testid="beta-container"]');
  const betaText = () => wrapper.find('[data-testid="beta-text"]');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Conditional rendering', () => {
    it('should render when dashboard is conversational', () => {
      mockDashboardsStore.currentDashboard.value.name =
        'conversations_dashboard.title';
      wrapper = createWrapper();

      expect(betaContainer().exists()).toBe(true);
      expect(betaText().exists()).toBe(true);
      expect(betaText().text()).toBe('BETA');
    });

    it('should not render when dashboard is not conversational', () => {
      mockDashboardsStore.currentDashboard.value.name = 'other_dashboard.title';
      wrapper = createWrapper();

      expect(betaContainer().exists()).toBe(false);
      expect(betaText().exists()).toBe(false);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes when rendered', () => {
      mockDashboardsStore.currentDashboard.value.name =
        'conversations_dashboard.title';
      wrapper = createWrapper();

      expect(betaContainer().classes()).toContain('beta_text_container');
      expect(betaText().classes()).toContain('beta_text');
    });

    it('should match snapshot when not rendered', () => {
      mockDashboardsStore.currentDashboard.value.name = 'other_dashboard.title';
      wrapper = createWrapper();

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should match snapshot when rendered', () => {
      mockDashboardsStore.currentDashboard.value.name =
        'conversations_dashboard.title';
      wrapper = createWrapper();

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Computed property', () => {
    const testCases = [
      { name: 'conversations_dashboard.title', expected: true },
      { name: 'other_dashboard.title', expected: false },
      { name: '', expected: false },
      { name: null, expected: false },
    ];

    testCases.forEach(({ name, expected }) => {
      it(`should return ${expected} for dashboard name "${name}"`, () => {
        mockDashboardsStore.currentDashboard.value.name = name;
        wrapper = createWrapper();

        expect(wrapper.vm.isConversationalDashboard).toBe(expected);
      });
    });
  });
});
