import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import McpDisclaimer from '@/components/McpDisclaimer.vue';

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

import { moduleStorage } from '@/utils/storage';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
});

config.global.plugins = [i18n];

const unnnicStubs = {
  UnnnicDisclaimer: {
    template:
      '<div data-testid="mcp-disclaimer" v-bind="$attrs"><slot name="description" /></div>',
    props: ['type', 'title'],
  },
};

const createWrapper = () => {
  return shallowMount(McpDisclaimer, {
    global: { stubs: unnnicStubs },
  });
};

describe('McpDisclaimer', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  const findDisclaimer = () =>
    wrapper.findComponent('[data-testid="mcp-disclaimer"]');
  const findLink = () => wrapper.find('[data-testid="mcp-disclaimer-link"]');

  describe('Rendering', () => {
    it('should render the disclaimer', () => {
      expect(findDisclaimer().exists()).toBe(true);
    });

    it('should set type to informational', () => {
      expect(findDisclaimer().props('type')).toBe('informational');
    });

    it('should pass title prop', () => {
      expect(findDisclaimer().props('title')).toBeDefined();
    });

    it('should render the setup guide link', () => {
      expect(findLink().exists()).toBe(true);
    });

    it('should set correct href on the link', () => {
      expect(findLink().attributes('href')).toBe(
        'https://developers.vtex.com/docs/guides/connect-the-vtex-cx-platform-mcp',
      );
    });

    it('should open link in a new tab', () => {
      expect(findLink().attributes('target')).toBe('_blank');
    });

    it('should set noopener noreferrer on the link', () => {
      expect(findLink().attributes('rel')).toBe('noopener noreferrer');
    });
  });

  describe('View guide click', () => {
    it('should write to moduleStorage when link is clicked', async () => {
      await findLink().trigger('click');
      expect(moduleStorage.setItem).toHaveBeenCalledWith(
        'mcp_news_show_disclaimer',
        false,
      );
    });

    it('should emit dismiss when link is clicked', async () => {
      await findLink().trigger('click');
      expect(wrapper.emitted('dismiss')).toHaveLength(1);
    });
  });
});
