import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import Analysis from '../Analysis.vue';

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('Analysis', () => {
  let wrapper;
  let mockModuleStorage;

  const createWrapper = () => {
    return mount(Analysis, {
      global: {
        stubs: {
          StatusCards: true,
          ServicesOpenByHour: true,
          DetailedAnalysis: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="status-cards"]');

  beforeEach(async () => {
    vi.clearAllMocks();

    const { moduleStorage } = await import('@/utils/storage');
    mockModuleStorage = moduleStorage;
    mockModuleStorage.getItem.mockReturnValue(false);
    mockModuleStorage.setItem.mockClear();

    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render all child components', () => {
      expect(wrapper.findComponent({ name: 'StatusCards' }).exists()).toBe(
        true,
      );
      expect(
        wrapper.findComponent({ name: 'ServicesOpenByHour' }).exists(),
      ).toBe(true);
      expect(wrapper.findComponent({ name: 'DetailedAnalysis' }).exists()).toBe(
        true,
      );
    });

    it('should have correct data-testids for child components', () => {
      const statusCards = wrapper.findComponent({ name: 'StatusCards' });
      const servicesOpenByHour = wrapper.findComponent({
        name: 'ServicesOpenByHour',
      });
      const detailedAnalysis = wrapper.findComponent({
        name: 'DetailedAnalysis',
      });

      expect(statusCards.attributes('data-testid')).toBe('status-cards');
      expect(servicesOpenByHour.attributes('data-testid')).toBe(
        'services-open-by-hour',
      );
      expect(detailedAnalysis.attributes('data-testid')).toBe(
        'detailed-analysis',
      );
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(wrapper.find('.analysis').exists()).toBe(true);
    });
  });
});
