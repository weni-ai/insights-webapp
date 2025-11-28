import { beforeAll, afterAll, describe, it } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import HeaderDefault from '../HeaderDefault.vue';
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
  shallowMount(HeaderDefault, {
    props: { hasFilters: false, ...props },
    global: {
      stubs: {
        InsightsLayoutHeaderFilters: true,
        HeaderDashboardSettings: true,
      },
    },
  });

describe('HeaderDefault', () => {
  let wrapper;

  describe('Component rendering', () => {
    it('renders HeaderDashboardSettings always', () => {
      wrapper = createWrapper();
      expect(
        wrapper.findComponent({ name: 'HeaderDashboardSettings' }).exists(),
      ).toBe(true);
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
  });
});
