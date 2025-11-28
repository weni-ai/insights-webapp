import { beforeAll, afterAll, describe, it } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import HeaderHumanService from '../HeaderHumanService.vue';
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

const createWrapper = (props = {}) =>
  shallowMount(HeaderHumanService, {
    props: {
      showTagLive: false,
      hasFilters: false,
      isRenderInsightButton: false,
      isRenderHumanSupportBtnExport: false,
      ...props,
    },
    global: {
      stubs: {
        HeaderTagLive: true,
        LastUpdatedText: true,
        InsightsLayoutHeaderFilters: true,
        HeaderGenerateInsightButton: true,
        HumanSupportExport: true,
      },
    },
  });

describe('HeaderHumanService', () => {
  let wrapper;

  describe('Component rendering', () => {
    it('renders LastUpdatedText always', () => {
      wrapper = createWrapper();
      expect(wrapper.findComponent({ name: 'LastUpdatedText' }).exists()).toBe(
        true,
      );
    });

    it('renders HeaderTagLive when showTagLive is true', () => {
      wrapper = createWrapper({ showTagLive: true });
      expect(
        wrapper
          .find('[data-testid="insights-layout-header-tag-live"]')
          .exists(),
      ).toBe(true);
    });

    it('does not render HeaderTagLive when showTagLive is false', () => {
      wrapper = createWrapper({ showTagLive: false });
      expect(
        wrapper
          .find('[data-testid="insights-layout-header-tag-live"]')
          .exists(),
      ).toBe(false);
    });

    it('renders filters when hasFilters is true', () => {
      wrapper = createWrapper({ hasFilters: true });
      expect(
        wrapper.find('[data-testid="insights-layout-header-filters"]').exists(),
      ).toBe(true);
    });

    it('does not render filters when hasFilters is false', () => {
      wrapper = createWrapper({ hasFilters: false });
      expect(
        wrapper.find('[data-testid="insights-layout-header-filters"]').exists(),
      ).toBe(false);
    });

    it('renders InsightButton when flag is true', () => {
      wrapper = createWrapper({ isRenderInsightButton: true });
      expect(
        wrapper
          .find(
            '[data-testid="insights-layout-header-generate-insight-button"]',
          )
          .exists(),
      ).toBe(true);
    });

    it('does not render InsightButton when flag is false', () => {
      wrapper = createWrapper({ isRenderInsightButton: false });
      expect(
        wrapper
          .find(
            '[data-testid="insights-layout-header-generate-insight-button"]',
          )
          .exists(),
      ).toBe(false);
    });

    it('renders HumanSupportExport when flag is true', () => {
      wrapper = createWrapper({ isRenderHumanSupportBtnExport: true });
      expect(
        wrapper.findComponent({ name: 'HumanSupportExport' }).exists(),
      ).toBe(true);
    });

    it('does not render HumanSupportExport when flag is false', () => {
      wrapper = createWrapper({ isRenderHumanSupportBtnExport: false });
      expect(
        wrapper.findComponent({ name: 'HumanSupportExport' }).exists(),
      ).toBe(false);
    });
  });
});
