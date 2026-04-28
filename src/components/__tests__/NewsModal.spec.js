import { describe, it, expect, beforeEach, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import NewsModal from '../NewsModal.vue';

vi.mock('@weni/unnnic-system', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    UnnnicPagination: {
      name: 'UnnnicPagination',
      props: ['modelValue', 'max', 'show'],
      template: '<div />',
    },
    UnnnicDialog: {
      name: 'UnnnicDialog',
      template: '<div data-testid="news-modal"><slot /></div>',
      props: ['open'],
      emits: ['update:open'],
    },
    UnnnicDialogContent: {
      name: 'UnnnicDialogContent',
      template: '<div><slot /></div>',
      props: ['size', 'class'],
    },
    UnnnicDialogHeader: {
      name: 'UnnnicDialogHeader',
      template: '<div><slot /></div>',
    },
    UnnnicDialogTitle: {
      name: 'UnnnicDialogTitle',
      template: '<div><slot /></div>',
    },
  };
});

const mockNews = [
  {
    description: 'First news description',
    secondDescription: 'First news second description',
    image: '/path/to/image1.gif',
  },
  {
    description: 'Second news description',
    secondDescription: '',
    image: '/path/to/image2.gif',
  },
  {
    description: 'Third news description',
    secondDescription: 'Third news second description',
    image: '/path/to/image3.gif',
  },
];

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
});

config.global.plugins = [i18n];

describe('NewsModal', () => {
  let wrapper;

  const createWrapper = (props = {}) =>
    mount(NewsModal, {
      props: {
        modelValue: true,
        title: 'News Title',
        news: mockNews,
        ...props,
      },
    });

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render modal', () => {
      expect(wrapper.find('[data-testid="news-modal"]').exists()).toBe(true);
    });

    it('should render content section', () => {
      expect(wrapper.find('[data-testid="news-modal-content"]').exists()).toBe(
        true,
      );
    });

    it('should render description section', () => {
      expect(
        wrapper.find('[data-testid="news-modal-description"]').exists(),
      ).toBe(true);
    });

    it('should render description text', () => {
      expect(
        wrapper.find('[data-testid="news-modal-description-text"]').exists(),
      ).toBe(true);
    });

    it('should render image', () => {
      expect(wrapper.find('[data-testid="news-modal-image"]').exists()).toBe(
        true,
      );
    });

    it('should render pagination', () => {
      expect(
        wrapper.find('[data-testid="news-modal-pagination"]').exists(),
      ).toBe(true);
    });
  });

  describe('Props handling', () => {
    it('should display correct title', () => {
      const title = wrapper.findComponent({ name: 'UnnnicDialogTitle' });
      expect(title.text()).toBe('News Title');
    });

    it('should display correct open state', () => {
      const modal = wrapper.findComponent({ name: 'UnnnicDialog' });
      expect(modal.props('open')).toBe(true);
    });

    it('should render dialog header with close control', () => {
      const header = wrapper.findComponent({ name: 'UnnnicDialogHeader' });
      expect(header.exists()).toBe(true);
    });

    it('should have large dialog content', () => {
      const content = wrapper.findComponent({ name: 'UnnnicDialogContent' });
      expect(content.props('size')).toBe('large');
    });
  });

  describe('Current news item display', () => {
    it('should display first news item by default', () => {
      const description = wrapper.find(
        '[data-testid="news-modal-description-text"]',
      );
      expect(description.html()).toContain(mockNews[0].description);
    });

    it('should display second description when available', () => {
      expect(
        wrapper
          .find('[data-testid="news-modal-description-second-text"]')
          .exists(),
      ).toBe(true);
    });

    it('should not display second description when not available', async () => {
      wrapper.vm.page = 2;
      await wrapper.vm.$nextTick();

      expect(
        wrapper
          .find('[data-testid="news-modal-description-second-text"]')
          .exists(),
      ).toBe(false);
    });

    it('should display correct image src', () => {
      const image = wrapper.find('[data-testid="news-modal-image"]');
      expect(image.attributes('src')).toBe(mockNews[0].image);
    });

    it('should display correct image alt', () => {
      const image = wrapper.find('[data-testid="news-modal-image"]');
      expect(image.attributes('alt')).toBe(mockNews[0].description);
    });
  });

  describe('Pagination functionality', () => {
    it('should initialize page to 1', () => {
      expect(wrapper.vm.page).toBe(1);
    });

    it('should set pageSize to news length', () => {
      expect(wrapper.vm.pageSize).toBe(mockNews.length);
    });

    it('should pass correct props to pagination', () => {
      const pagination = wrapper.findComponent({ name: 'UnnnicPagination' });
      expect(pagination.props('modelValue')).toBe(1);
      expect(pagination.props('max')).toBe(mockNews.length);
      expect(pagination.props('show')).toBe(mockNews.length);
    });

    it('should update page when pagination changes', async () => {
      await wrapper.vm.updatePage(2);
      expect(wrapper.vm.page).toBe(2);
    });

    it('should display correct news item after page change', async () => {
      await wrapper.vm.updatePage(2);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentNewsItem).toEqual(mockNews[1]);
    });

    it('should display correct news item for page 3', async () => {
      await wrapper.vm.updatePage(3);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentNewsItem).toEqual(mockNews[2]);
    });
  });

  describe('Computed properties', () => {
    it('should compute currentNewsItem correctly for page 1', () => {
      expect(wrapper.vm.currentNewsItem).toEqual(mockNews[0]);
    });

    it('should compute currentNewsItem correctly for page 2', async () => {
      wrapper.vm.page = 2;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.currentNewsItem).toEqual(mockNews[1]);
    });

    it('should compute currentNewsItem correctly for page 3', async () => {
      wrapper.vm.page = 3;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.currentNewsItem).toEqual(mockNews[2]);
    });
  });

  describe('Events', () => {
    it('should emit close when modal is closed', async () => {
      const modal = wrapper.findComponent({ name: 'UnnnicDialog' });
      await modal.vm.$emit('update:open', false);

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should emit close with correct value', async () => {
      const modal = wrapper.findComponent({ name: 'UnnnicDialog' });
      await modal.vm.$emit('update:open', false);

      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe('CSS classes', () => {
    it('should have correct content class', () => {
      expect(
        wrapper.find('[data-testid="news-modal-content"]').classes(),
      ).toContain('news-modal__content');
    });

    it('should have correct description class', () => {
      expect(
        wrapper.find('[data-testid="news-modal-description"]').classes(),
      ).toContain('news-modal__description');
    });

    it('should have correct image class', () => {
      expect(
        wrapper.find('[data-testid="news-modal-image"]').classes(),
      ).toContain('news-modal__image');
    });

    it('should have correct pagination class', () => {
      expect(
        wrapper.find('[data-testid="news-modal-pagination"]').classes(),
      ).toContain('news-modal__pagination');
    });
  });
});
