import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { createTestingPinia } from '@pinia/testing';
import DetailedAnalysis from '../DetailedAnalysis.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('DetailedAnalysis', () => {
  let wrapper;
  let store;

  const createWrapper = () => {
    store = createTestingPinia({
      initialState: {
        humanSupportAnalysis: {
          activeDetailedTab: 'finished',
        },
      },
    });

    return mount(DetailedAnalysis, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicTab: true,
          DetailedFilters: true,
          Finished: true,
          Attendant: true,
          Pauses: true,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render main section with correct class and id', () => {
      const section = wrapper.find('#detailed-monitoring');
      expect(section.exists()).toBe(true);
      expect(section.classes()).toContain('detailed-monitoring');
    });

    it('should render title element', () => {
      const title = wrapper.find('.detailed-monitoring__title');
      expect(title.exists()).toBe(true);
    });

    it('should render UnnnicTab component', () => {
      const tab = wrapper.find('[data-testid="human-support-tab"]');
      expect(tab.exists()).toBe(true);
    });
  });

  describe('Tab Management', () => {
    const tabs = ['finished', 'attendant', 'pauses'];

    tabs.forEach((tab) => {
      it(`should show filters for ${tab} tab`, async () => {
        const { useHumanSupportAnalysis } = await import(
          '@/store/modules/humanSupport/analysis'
        );
        const analysisStore = useHumanSupportAnalysis();
        analysisStore.activeDetailedTab = tab;

        await wrapper.vm.$nextTick();

        const filters = wrapper.find('.detailed-monitoring__filters');
        expect(filters.exists()).toBe(true);
      });
    });

    it('should pass correct type to DetailedFilters', async () => {
      const filters = wrapper.findComponent({ name: 'DetailedFilters' });
      expect(filters.props('type')).toBe('finished');
    });

    it('should have tab change handler', () => {
      const tab = wrapper.find('[data-testid="human-support-tab"]');
      expect(tab.exists()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('should compute filterType from activeDetailedTab', async () => {
      const { useHumanSupportAnalysis } = await import(
        '@/store/modules/humanSupport/analysis'
      );
      const analysisStore = useHumanSupportAnalysis();

      analysisStore.activeDetailedTab = 'pauses';
      await wrapper.vm.$nextTick();

      const filters = wrapper.findComponent({ name: 'DetailedFilters' });
      expect(filters.props('type')).toBe('pauses');
    });
  });

  describe('Component Integration', () => {
    it('should render tabs section', () => {
      const tabsSection = wrapper.find('.detailed-monitoring__tabs');
      expect(tabsSection.exists()).toBe(true);
    });
  });
});

