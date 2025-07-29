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
    global: {
      plugins: [UnnnicSystem],
      stubs: ['ProgressTable'],
      mocks: {
        $tc: (key) => key,
      },
    },
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

  describe('Content Rendering', () => {
    it('should render table', () => {
      expect(
        wrapper.find('[data-testid="progress-widget-table"]').exists(),
      ).toBe(true);
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
            label: 'Complete Item',
            value: 90,
            description: 'Complete description',
            backgroundColor: '#green',
            color: '#white',
            subItems: [
              {
                label: 'Sub Item',
                value: 80,
              },
            ],
          },
        ],
        footerText: 'Complete footer',
        isLoading: false,
      };

      await wrapper.setProps(props);

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

      const progressTable = wrapper.findComponent(
        '[data-testid="progress-widget-table"]',
      );
      expect(progressTable.exists()).toBe(true);
      expect(progressTable.props('progressItems')).toEqual(
        wrapper.vm.treatedProgressItems,
      );
    });

    it('should render minimal elements when only required props are provided', () => {
      const minimalWrapper = createWrapper({
        title: 'Minimal Widget',
        progressItems: [{ text: 'Minimal Item', value: 25 }],
      });

      expectElementExists(minimalWrapper, 'progress-widget-card', false);
      expectElementExists(minimalWrapper, 'progress-widget-footer', false);

      const progressTable = minimalWrapper.findComponent(
        '[data-testid="progress-widget-table"]',
      );
      expect(progressTable.exists()).toBe(true);
      expect(progressTable.props('progressItems')).toEqual(
        minimalWrapper.vm.treatedProgressItems,
      );
    });
  });

  describe('Component Structure', () => {
    const requiredElements = [
      'progress-widget-content',
      'progress-widget-table',
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

      const progressTable = wrapper.findComponent(
        '[data-testid="progress-widget-table"]',
      );
      expect(progressTable.exists()).toBe(false);
    });
  });
});
