import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';
import ConversationalAdd from '../ConversationalAdd.vue';
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

const createWrapper = () =>
  shallowMount(ConversationalAdd, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
        }),
      ],
      stubs: {
        AddCustomizableWidget: true,
        ProgressWidget: true,
      },
    },
  });

describe('ConversationalAdd', () => {
  describe('Component rendering', () => {
    it('renders ProgressWidget with mock data', () => {
      const wrapper = createWrapper();
      const progressWidget = wrapper.findComponent({ name: 'ProgressWidget' });
      expect(progressWidget.exists()).toBe(true);
      expect(progressWidget.props('title')).toBe('ADD');
      expect(progressWidget.props('progressItems')).toHaveLength(5);
      expect(progressWidget.props('isLoading')).toBe(false);
    });

    it('renders AddCustomizableWidget as overlay', () => {
      const wrapper = createWrapper();
      expect(
        wrapper.findComponent({ name: 'AddCustomizableWidget' }).exists(),
      ).toBe(true);
      expect(
        wrapper
          .findComponent({ name: 'AddCustomizableWidget' })
          .classes('conversational-add__overlay'),
      ).toBe(true);
    });

    it('has handleOpenDrawer method', () => {
      const wrapper = createWrapper();
      expect(typeof wrapper.vm.handleOpenDrawer).toBe('function');
    });

    it('mock data has correct CSAT format', () => {
      const wrapper = createWrapper();
      const mockData = wrapper.vm.MOCK_DATA;

      expect(mockData).toHaveLength(5);
      expect(mockData[0].text).toContain('🤩');
      expect(mockData[0].value).toBe(57);
      expect(mockData[0].color).toBe('#8D72E0'); // colorPurple500
      expect(mockData[0].backgroundColor).toBe('#EEECFB'); // colorPurple100
    });
  });
});
