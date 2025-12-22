import { beforeAll, afterAll, describe, it } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import DynamicHeader from '../DynamicHeader.vue';
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
  shallowMount(DynamicHeader, {
    props: { dashboardType: 'custom', ...props },
    global: {
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
    it('renders HeaderHumanService for human_service', () => {
      wrapper = createWrapper({ dashboardType: 'human_service' });
      const stub = wrapper.findComponent({ name: 'HeaderHumanService' });
      expect(stub.exists()).toBe(true);
    });

    it('renders HeaderHumanSupport for human_support', () => {
      wrapper = createWrapper({ dashboardType: 'human_support' });
      const stub = wrapper.findComponent({ name: 'HeaderHumanSupport' });
      expect(stub.exists()).toBe(true);
    });

    it('renders HeaderConversational for conversational', () => {
      wrapper = createWrapper({ dashboardType: 'conversational' });
      const stub = wrapper.findComponent({ name: 'HeaderConversational' });
      expect(stub.exists()).toBe(true);
    });

    it('renders HeaderDefault for custom', () => {
      wrapper = createWrapper({ dashboardType: 'custom' });
      const stub = wrapper.findComponent({ name: 'HeaderDefault' });
      expect(stub.exists()).toBe(true);
    });

    it('renders HeaderDefault for metaTemplateMessage', () => {
      wrapper = createWrapper({ dashboardType: 'metaTemplateMessage' });
      const stub = wrapper.findComponent({ name: 'HeaderDefault' });
      expect(stub.exists()).toBe(true);
    });

    it('renders HeaderDefault for unknown type', () => {
      wrapper = createWrapper({ dashboardType: 'unknown' });
      const stub = wrapper.findComponent({ name: 'HeaderDefault' });
      expect(stub.exists()).toBe(true);
    });
  });

  describe('Component rendering', () => {
    it('renders dynamic-header testid', () => {
      wrapper = createWrapper();
      expect(wrapper.find('[data-testid="dynamic-header"]').exists()).toBe(
        true,
      );
    });

    it('computes currentComponent correctly', () => {
      wrapper = createWrapper({ dashboardType: 'human_service' });
      expect(wrapper.vm.currentComponent).toBeDefined();

      wrapper = createWrapper({ dashboardType: 'human_support' });
      expect(wrapper.vm.currentComponent).toBeDefined();

      wrapper = createWrapper({ dashboardType: 'conversational' });
      expect(wrapper.vm.currentComponent).toBeDefined();

      wrapper = createWrapper({ dashboardType: 'custom' });
      expect(wrapper.vm.currentComponent).toBeDefined();
    });
  });
});
