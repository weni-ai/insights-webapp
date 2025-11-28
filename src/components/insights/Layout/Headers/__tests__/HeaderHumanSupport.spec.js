import { beforeAll, afterAll, describe, it } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';
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

const createWrapper = (props = {}, storeState = {}) =>
  shallowMount(HeaderHumanSupport, {
    props: {
      showTagLive: false,
      hasFilters: false,
      isRenderHumanSupportBtnExport: false,
      ...props,
    },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            humanSupport: { activeTab: 'overview', ...storeState.humanSupport },
          },
        }),
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

  describe('Computed properties', () => {
    it('isMonitoring returns true when activeTab is monitoring', () => {
      wrapper = createWrapper(
        {},
        { humanSupport: { activeTab: 'monitoring' } },
      );
      expect(wrapper.vm.isMonitoring).toBe(true);
    });

    it('isMonitoring returns false when activeTab is not monitoring', () => {
      wrapper = createWrapper({}, { humanSupport: { activeTab: 'overview' } });
      expect(wrapper.vm.isMonitoring).toBe(false);
    });

    it('renders LastUpdatedText when isMonitoring is true', () => {
      wrapper = createWrapper(
        {},
        { humanSupport: { activeTab: 'monitoring' } },
      );
      expect(wrapper.findComponent({ name: 'LastUpdatedText' }).exists()).toBe(
        true,
      );
    });

    it('does not render LastUpdatedText when isMonitoring is false', () => {
      wrapper = createWrapper({}, { humanSupport: { activeTab: 'overview' } });
      expect(wrapper.findComponent({ name: 'LastUpdatedText' }).exists()).toBe(
        false,
      );
    });

    it('renders HeaderRefresh when isMonitoring is true', () => {
      wrapper = createWrapper(
        {},
        { humanSupport: { activeTab: 'monitoring' } },
      );
      const refresh = wrapper.findComponent({ name: 'HeaderRefresh' });
      expect(refresh.exists()).toBe(true);
      expect(refresh.props('type')).toBe('human-support');
    });

    it('does not render HeaderRefresh when isMonitoring is false', () => {
      wrapper = createWrapper({}, { humanSupport: { activeTab: 'overview' } });
      expect(wrapper.findComponent({ name: 'HeaderRefresh' }).exists()).toBe(
        false,
      );
    });
  });
});
