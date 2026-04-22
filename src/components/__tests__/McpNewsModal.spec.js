import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import McpNewsModal from '@/components/McpNewsModal.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
});

config.global.plugins = [i18n];

const unnnicStubs = {
  UnnnicDialog: {
    template: '<div data-testid="mcp-dialog"><slot /></div>',
    props: ['open'],
  },
  UnnnicDialogContent: {
    template: '<div><slot /></div>',
    props: ['size'],
  },
  UnnnicDialogHeader: { template: '<div><slot /></div>' },
  UnnnicDialogTitle: { template: '<div><slot /></div>' },
  UnnnicDialogFooter: { template: '<div><slot /></div>' },
  UnnnicDialogClose: { template: '<div><slot /></div>' },
  UnnnicButton: {
    template: '<button :data-testid="$attrs[`data-testid`]"></button>',
    props: ['text', 'type'],
  },
  UnnnicIcon: {
    template: '<span />',
    props: ['icon', 'size', 'scheme'],
  },
};

const createWrapper = (props = {}) => {
  return shallowMount(McpNewsModal, {
    props: { modelValue: true, ...props },
    global: { stubs: unnnicStubs },
  });
};

describe('McpNewsModal', () => {
  let wrapper;

  beforeEach(() => {
    vi.restoreAllMocks();
    wrapper = createWrapper();
  });

  const findDialog = () => wrapper.findComponent('[data-testid="mcp-dialog"]');
  const findBody = () => wrapper.find('[data-testid="mcp-news-modal-body"]');
  const findNotNowButton = () =>
    wrapper.findComponent('[data-testid="mcp-news-not-now-button"]');
  const findViewGuideButton = () =>
    wrapper.findComponent('[data-testid="mcp-news-view-guide-button"]');

  describe('Initial render', () => {
    it('should render the dialog', () => {
      expect(findDialog().exists()).toBe(true);
    });

    it('should render the body section', () => {
      expect(findBody().exists()).toBe(true);
    });

    it('should render the description', () => {
      expect(wrapper.find('.mcp-news-modal__description').exists()).toBe(true);
    });

    it('should render the flow diagram', () => {
      expect(wrapper.find('.mcp-news-modal__flow-diagram').exists()).toBe(true);
    });

    it('should render the flow steps', () => {
      expect(wrapper.find('.mcp-news-modal__flow-steps').exists()).toBe(true);
    });

    it('should render three flow step labels', () => {
      const labels = wrapper.findAll('.mcp-news-modal__flow-label');
      expect(labels).toHaveLength(3);
    });

    it('should render the prompt bubble', () => {
      expect(wrapper.find('.mcp-news-modal__prompt-bubble').exists()).toBe(
        true,
      );
    });

    it('should render three feature items', () => {
      const items = wrapper.findAll('.mcp-news-modal__feature-item');
      expect(items).toHaveLength(3);
    });

    it('should render the privacy note', () => {
      expect(wrapper.find('.mcp-news-modal__privacy').exists()).toBe(true);
      expect(wrapper.find('.mcp-news-modal__privacy-text').exists()).toBe(true);
    });

    it('should render both action buttons', () => {
      expect(findNotNowButton().exists()).toBe(true);
      expect(findViewGuideButton().exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('should pass open as true to dialog when modelValue is true', () => {
      expect(findDialog().props('open')).toBe(true);
    });

    it('should pass open as false to dialog when modelValue is false', () => {
      wrapper = createWrapper({ modelValue: false });
      expect(findDialog().props('open')).toBe(false);
    });
  });

  describe('Not now button', () => {
    it('should emit not-now when clicked', async () => {
      await findNotNowButton().vm.$emit('click');
      expect(wrapper.emitted('not-now')).toHaveLength(1);
    });

    it('should have tertiary type', () => {
      expect(findNotNowButton().props('type')).toBe('tertiary');
    });
  });

  describe('View setup guide button', () => {
    it('should emit view-guide when clicked', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      await findViewGuideButton().vm.$emit('click');

      expect(wrapper.emitted('view-guide')).toHaveLength(1);
      openSpy.mockRestore();
    });

    it('should call window.open with the setup guide URL', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      await findViewGuideButton().vm.$emit('click');

      expect(openSpy).toHaveBeenCalledWith(
        'https://developers.vtex.com/docs/guides/connect-the-vtex-cx-platform-mcp',
        '_blank',
      );
      openSpy.mockRestore();
    });

    it('should have primary type', () => {
      expect(findViewGuideButton().props('type')).toBe('primary');
    });
  });

  describe('Dialog events', () => {
    it('should forward update:open as update:modelValue', async () => {
      await findDialog().vm.$emit('update:open', false);
      expect(wrapper.emitted('update:modelValue')).toContainEqual([false]);
    });
  });
});
