import { describe, it, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ConversationalAdd from '../ConversationalAdd.vue';

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
      expect(mockData[0].color).toBe('#AD71F8'); // colorBgPurpleStrong
      expect(mockData[0].backgroundColor).toBe('#EDDCFE'); // colorBgPurplePlain
    });
  });
});
