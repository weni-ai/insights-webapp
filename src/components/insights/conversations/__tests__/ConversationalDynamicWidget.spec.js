import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import ConversationalDynamicWidget from '../ConversationalDynamicWidget.vue';
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
  shallowMount(ConversationalDynamicWidget, {
    props: { type: 'add', ...props },
    global: {
      stubs: {
        ConversationalCsat: true,
        ConversationalNps: true,
        ConversationalCustom: true,
        ConversationalCrosstab: true,
        ConversationalSalesFunnel: true,
        ConversationalAdd: true,
      },
    },
  });

describe('ConversationalDynamicWidget', () => {
  describe('Component Delegation', () => {
    it('renders ConversationalCsat for csat type', () => {
      const wrapper = createWrapper({ type: 'csat' });
      expect(
        wrapper.findComponent({ name: 'ConversationalCsat' }).exists(),
      ).toBe(true);
    });

    it('renders ConversationalNps for nps type', () => {
      const wrapper = createWrapper({ type: 'nps' });
      expect(
        wrapper.findComponent({ name: 'ConversationalNps' }).exists(),
      ).toBe(true);
    });

    it('renders ConversationalCustom for custom type', () => {
      const wrapper = createWrapper({ type: 'custom', uuid: 'test-uuid' });
      expect(
        wrapper.findComponent({ name: 'ConversationalCustom' }).exists(),
      ).toBe(true);
    });

    it('renders ConversationalCrosstab for crosstab type', () => {
      const wrapper = createWrapper({ type: 'crosstab', uuid: 'test-uuid' });
      expect(
        wrapper.findComponent({ name: 'ConversationalCrosstab' }).exists(),
      ).toBe(true);
    });

    it('renders ConversationalSalesFunnel for sales_funnel type', () => {
      const wrapper = createWrapper({ type: 'sales_funnel' });
      expect(
        wrapper.findComponent({ name: 'ConversationalSalesFunnel' }).exists(),
      ).toBe(true);
    });

    it('renders ConversationalAdd for add type', () => {
      const wrapper = createWrapper({ type: 'add' });
      expect(
        wrapper.findComponent({ name: 'ConversationalAdd' }).exists(),
      ).toBe(true);
    });

    it('passes uuid prop to child component', () => {
      const wrapper = createWrapper({ type: 'custom', uuid: 'test-uuid-123' });
      const customComponent = wrapper.findComponent({
        name: 'ConversationalCustom',
      });
      expect(customComponent.props('uuid')).toBe('test-uuid-123');
    });
  });

  describe('Component rendering', () => {
    it('renders with correct class', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.conversational-dynamic-widget').exists()).toBe(
        true,
      );
    });

    it('computes currentComponent correctly', () => {
      const wrapper = createWrapper({ type: 'csat' });
      expect(wrapper.vm.currentComponent).toBeDefined();
    });
  });
});
