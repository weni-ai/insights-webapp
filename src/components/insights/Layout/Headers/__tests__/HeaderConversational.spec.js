import { beforeAll, afterAll, describe, it } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import HeaderConversational from '../HeaderConversational.vue';
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
  shallowMount(HeaderConversational, {
    props: {
      hasFilters: false,
      isRenderConversationalBtnExport: false,
      ...props,
    },
    global: {
      stubs: {
        InsightsLayoutHeaderFilters: true,
        HeaderRefresh: true,
        ConversationalExport: true,
      },
    },
  });

describe('HeaderConversational', () => {
  let wrapper;

  describe('Component rendering', () => {
    it('renders HeaderRefresh always', () => {
      wrapper = createWrapper();
      expect(wrapper.findComponent({ name: 'HeaderRefresh' }).exists()).toBe(
        true,
      );
    });

    it('passes type="conversations" to HeaderRefresh', () => {
      wrapper = createWrapper();
      expect(
        wrapper.findComponent({ name: 'HeaderRefresh' }).props('type'),
      ).toBe('conversations');
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

    it('renders ConversationalExport when flag is true', () => {
      wrapper = createWrapper({ isRenderConversationalBtnExport: true });
      expect(
        wrapper.findComponent({ name: 'ConversationalExport' }).exists(),
      ).toBe(true);
    });

    it('does not render ConversationalExport when flag is false', () => {
      wrapper = createWrapper({ isRenderConversationalBtnExport: false });
      expect(
        wrapper.findComponent({ name: 'ConversationalExport' }).exists(),
      ).toBe(false);
    });
  });
});
