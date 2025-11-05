import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import Analysis from '../Analysis.vue';

const mockModuleStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};

vi.mock('@/utils/storage', () => ({
  moduleStorage: mockModuleStorage,
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

  const createWrapper = () => {
    return mount(Analysis, {
      global: {
        stubs: {
          StatusCards: true,
          ServicesOpenByHour: true,
          DetailedAnalysis: true,
          NewsHumanSupportModal: true,
        },
      },
    });
  };

  const section = () => wrapper.find('[data-testid="status-cards"]');

  beforeEach(() => {
    vi.clearAllMocks();

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
      expect(
        wrapper.findComponent({ name: 'DetailedAnalysis' }).exists(),
      ).toBe(true);
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

  describe('News Modal functionality', () => {
    it('should render NewsHumanSupportModal component', () => {
      const modal = wrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.exists()).toBe(true);
    });

    it('should show modal on first visit', async () => {
      wrapper.unmount();
      mockModuleStorage.getItem.mockReturnValue(false);

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      const modal = newWrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.props('modelValue')).toBe(true);

      newWrapper.unmount();
    });

    it('should not show modal if already shown', async () => {
      wrapper.unmount();
      mockModuleStorage.getItem.mockReturnValue(true);

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      const modal = newWrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.props('modelValue')).toBe(false);

      newWrapper.unmount();
    });

    it('should save to storage when modal is closed', async () => {
      mockModuleStorage.getItem.mockReturnValue(false);

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      const modal = newWrapper.findComponent({ name: 'NewsHumanSupportModal' });
      await modal.vm.$emit('close');

      expect(mockModuleStorage.setItem).toHaveBeenCalledWith(
        'news_modal_analysis_shown',
        true,
      );

      newWrapper.unmount();
    });

    it('should hide modal after close event', async () => {
      mockModuleStorage.getItem.mockReturnValue(false);

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      const modal = newWrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.props('modelValue')).toBe(true);

      await modal.vm.$emit('close');
      await newWrapper.vm.$nextTick();

      expect(modal.props('modelValue')).toBe(false);

      newWrapper.unmount();
    });

    it('should pass correct type prop to NewsHumanSupportModal', () => {
      const modal = wrapper.findComponent({ name: 'NewsHumanSupportModal' });
      expect(modal.props('type')).toBe('analysis');
    });

    it('should check storage with correct key on mount', async () => {
      wrapper.unmount();
      vi.clearAllMocks();

      const newWrapper = createWrapper();
      await newWrapper.vm.$nextTick();

      expect(mockModuleStorage.getItem).toHaveBeenCalledWith(
        'news_modal_analysis_shown',
        false,
      );

      newWrapper.unmount();
    });
  });
});

