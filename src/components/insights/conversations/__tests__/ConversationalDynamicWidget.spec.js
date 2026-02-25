import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  vi,
} from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import ConversationalDynamicWidget from '../ConversationalDynamicWidget.vue';
import i18n from '@/utils/plugins/i18n';

const shouldUseMockRef = ref(false);
const mockSetIsDrawerCustomizableOpen = vi.fn();

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: () => ({
    shouldUseMock: shouldUseMockRef,
    setIsDrawerCustomizableOpen: mockSetIsDrawerCustomizableOpen,
  }),
}));

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
        AddWidget: true,
      },
    },
  });

describe('ConversationalDynamicWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shouldUseMockRef.value = false;
  });

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

  describe('Mock overlay (shouldUseMock = true)', () => {
    beforeEach(() => {
      shouldUseMockRef.value = true;
    });

    it('renders AddWidget overlay when shouldUseMock is true and type is not add', () => {
      const wrapper = createWrapper({ type: 'csat' });
      expect(wrapper.find('[data-testid="mock-widget-overlay"]').exists()).toBe(
        true,
      );
    });

    it('does not render AddWidget overlay when type is add', () => {
      const wrapper = createWrapper({ type: 'add' });
      expect(wrapper.find('[data-testid="mock-widget-overlay"]').exists()).toBe(
        false,
      );
    });

    it('applies mock-hover CSS class when overlay is shown', () => {
      const wrapper = createWrapper({ type: 'nps' });
      expect(
        wrapper
          .find('.conversational-dynamic-widget')
          .classes('conversational-dynamic-widget--mock-hover'),
      ).toBe(true);
    });

    it('does not apply mock-hover CSS class for add type', () => {
      const wrapper = createWrapper({ type: 'add' });
      expect(
        wrapper
          .find('.conversational-dynamic-widget')
          .classes('conversational-dynamic-widget--mock-hover'),
      ).toBe(false);
    });

    it.each(['csat', 'nps', 'sales_funnel', 'custom', 'crosstab'])(
      'renders overlay for %s widget type',
      (type) => {
        const wrapper = createWrapper({ type, uuid: 'test-uuid' });
        expect(
          wrapper.find('[data-testid="mock-widget-overlay"]').exists(),
        ).toBe(true);
      },
    );

    it('calls setIsDrawerCustomizableOpen when overlay action is triggered', async () => {
      const wrapper = createWrapper({ type: 'csat' });
      const overlay = wrapper.findComponent({ name: 'AddWidget' });
      await overlay.vm.$emit('action');
      expect(mockSetIsDrawerCustomizableOpen).toHaveBeenCalledWith(
        true,
        'add',
        true,
      );
    });
  });

  describe('Mock overlay (shouldUseMock = false)', () => {
    it('does not render AddWidget overlay when shouldUseMock is false', () => {
      const wrapper = createWrapper({ type: 'csat' });
      expect(wrapper.find('[data-testid="mock-widget-overlay"]').exists()).toBe(
        false,
      );
    });

    it('does not apply mock-hover CSS class when shouldUseMock is false', () => {
      const wrapper = createWrapper({ type: 'csat' });
      expect(
        wrapper
          .find('.conversational-dynamic-widget')
          .classes('conversational-dynamic-widget--mock-hover'),
      ).toBe(false);
    });
  });
});
