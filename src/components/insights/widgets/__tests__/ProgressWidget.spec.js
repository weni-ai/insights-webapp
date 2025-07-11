import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import ProgressWidget from '../ProgressWidget.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const defaultProps = {
  title: 'Test Progress Widget',
  progressItems: [
    { text: 'Item 1', value: 75, backgroundColor: '#f0f0f0', color: '#333' },
    { text: 'Item 2', value: 50 },
  ],
};

const createWrapper = (props = {}) => {
  return mount(ProgressWidget, {
    global: { plugins: [UnnnicSystem] },
    props: { ...defaultProps, ...props },
  });
};

const expectElementExists = (wrapper, testId, shouldExist = true) => {
  expect(wrapper.find(`[data-testid="${testId}"]`).exists()).toBe(shouldExist);
};

const expectElementText = (wrapper, testId, expectedText) => {
  expect(wrapper.find(`[data-testid="${testId}"]`).text()).toBe(expectedText);
};

describe('ProgressWidget.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Loading State', () => {
    it('should show skeleton when isLoading is true', async () => {
      await wrapper.setProps({ isLoading: true });

      expectElementExists(wrapper, 'progress-widget-skeleton');
      expectElementExists(wrapper, 'progress-widget', false);
    });

    it('should show content when isLoading is false', () => {
      expectElementExists(wrapper, 'progress-widget-skeleton', false);
      expectElementExists(wrapper, 'progress-widget');
    });
  });

  describe('Content Rendering', () => {
    it('should render title correctly', () => {
      expectElementText(
        wrapper,
        'progress-widget-title',
        'Test Progress Widget',
      );
    });

    it('should render tabs with correct configuration', () => {
      expectElementExists(wrapper, 'progress-widget-tabs');
      expect(wrapper.vm.tabs).toEqual([
        { name: 'IA', key: 'intelligence-artificial' },
        { name: 'Human support', key: 'human-support' },
      ]);
    });

    it('should render progress items', () => {
      const progressItems = wrapper.findAll(
        '[data-testid="progress-widget-progress-item"]',
      );
      expect(progressItems).toHaveLength(2);
    });

    it('should render card when provided', async () => {
      const card = {
        title: 'Card Title',
        value: '123',
        valueDescription: 'Low',
        tooltipInfo: 'Test tooltip',
        isLoading: false,
      };

      await wrapper.setProps({ card });

      expectElementExists(wrapper, 'progress-widget-card');

      const cardConversations = wrapper.findComponent({
        name: 'CardConversations',
      });
      expect(cardConversations.exists()).toBe(true);
      expect(cardConversations.props('title')).toBe('Card Title');
      expect(cardConversations.props('value')).toBe('123');
    });

    it('should not render card when not provided', () => {
      expectElementExists(wrapper, 'progress-widget-card', false);
    });

    it('should render footer when footerText is provided', async () => {
      await wrapper.setProps({ footerText: 'Footer text' });

      expectElementExists(wrapper, 'progress-widget-footer');
      expectElementText(wrapper, 'progress-widget-footer-text', 'Footer text');
    });

    it('should not render footer when footerText is not provided', () => {
      expectElementExists(wrapper, 'progress-widget-footer', false);
    });
  });

  describe('Tab Functionality', () => {
    it('should emit tabChange event when tab is changed', async () => {
      const shortTab = wrapper.findComponent({ name: 'ShortTab' });
      await shortTab.vm.$emit('tab-change', 'human-support');

      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual(['human-support']);
    });

    it('should handle tab change correctly', async () => {
      await wrapper.vm.handleTabChange('intelligence-artificial');

      expect(wrapper.emitted('tab-change')).toBeTruthy();
      expect(wrapper.emitted('tab-change')[0]).toEqual([
        'intelligence-artificial',
      ]);
    });
  });

  describe('Props Integration', () => {
    it('should render all elements when all props are provided', async () => {
      const props = {
        title: 'Complete Widget',
        card: {
          title: 'Complete Card',
          value: '456',
          valueDescription: 'High',
          tooltipInfo: 'Complete tooltip',
          isLoading: false,
        },
        progressItems: [
          {
            text: 'Complete Item',
            value: 90,
            backgroundColor: '#green',
            color: '#white',
          },
        ],
        footerText: 'Complete footer',
        isLoading: false,
      };

      await wrapper.setProps(props);

      expectElementText(wrapper, 'progress-widget-title', props.title);
      expectElementExists(wrapper, 'progress-widget-card');
      expectElementExists(wrapper, 'progress-widget-footer');
      expectElementText(
        wrapper,
        'progress-widget-footer-text',
        props.footerText,
      );

      const cardConversations = wrapper.findComponent({
        name: 'CardConversations',
      });
      expect(cardConversations.exists()).toBe(true);
      expect(cardConversations.props('title')).toBe('Complete Card');

      const progressItems = wrapper.findAll(
        '[data-testid="progress-widget-progress-item"]',
      );
      expect(progressItems).toHaveLength(1);
    });

    it('should render minimal elements when only required props are provided', () => {
      const minimalWrapper = createWrapper({
        title: 'Minimal Widget',
        progressItems: [{ text: 'Minimal Item', value: 25 }],
      });

      expectElementExists(minimalWrapper, 'progress-widget-title');
      expectElementExists(minimalWrapper, 'progress-widget-tabs');
      expectElementExists(minimalWrapper, 'progress-widget-card', false);
      expectElementExists(minimalWrapper, 'progress-widget-footer', false);

      const progressItems = minimalWrapper.findAll(
        '[data-testid="progress-widget-progress-item"]',
      );
      expect(progressItems).toHaveLength(1);
    });
  });

  describe('Computed Properties', () => {
    it('should compute showProgressWidget correctly', async () => {
      expect(wrapper.vm.showProgressWidget).toBe(true);

      await wrapper.setProps({ isLoading: true });
      expect(wrapper.vm.showProgressWidget).toBe(false);
    });

    it('should compute tabs correctly', () => {
      expect(wrapper.vm.tabs).toEqual([
        { name: 'IA', key: 'intelligence-artificial' },
        { name: 'Human support', key: 'human-support' },
      ]);
    });
  });

  describe('Component Structure', () => {
    const requiredElements = [
      'progress-widget-header',
      'progress-widget-title',
      'progress-widget-actions',
      'progress-widget-tabs',
      'progress-widget-content',
    ];

    requiredElements.forEach((testId) => {
      it(`should render ${testId} element`, () => {
        expectElementExists(wrapper, testId);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty progress items array', async () => {
      await wrapper.setProps({ progressItems: [] });

      const progressItems = wrapper.findAll(
        '[data-testid="progress-widget-progress-item"]',
      );
      expect(progressItems).toHaveLength(0);
    });

    it('should handle progress items without optional properties', async () => {
      await wrapper.setProps({
        progressItems: [{ text: 'Simple Item', value: 60 }],
      });

      const progressItems = wrapper.findAll(
        '[data-testid="progress-widget-progress-item"]',
      );
      expect(progressItems).toHaveLength(1);
    });
  });
});
