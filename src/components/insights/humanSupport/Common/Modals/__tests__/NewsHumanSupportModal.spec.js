import { describe, it, expect, beforeEach } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import NewsHumanSupportModal from '../NewsHumanSupportModal.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      news: {
        title: 'News Title',
        human_support_dashboard: {
          monitoring: {
            first_text: 'Monitoring first text',
            second_text: 'Monitoring second text',
            third_text: 'Monitoring third text',
            fourth_text: 'Monitoring fourth text',
            fifth_text: 'Monitoring fifth text',
            sixth_text: 'Monitoring sixth text',
            seventh_text: 'Monitoring seventh text',
          },
          analysis: {
            first_text: 'Analysis first text',
            second_text: 'Analysis second text',
            third_text: 'Analysis third text',
            fourth_text: 'Analysis fourth text',
          },
        },
      },
    },
  },
});

config.global.plugins = [i18n];

describe('NewsHumanSupportModal', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(NewsHumanSupportModal, {
      props: {
        modelValue: true,
        type: 'monitoring',
        ...props,
      },
      global: {
        stubs: {
          NewsModal: true,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render NewsModal component', () => {
      expect(wrapper.findComponent({ name: 'NewsModal' }).exists()).toBe(true);
    });

    it('should render with correct data-testid', () => {
      expect(
        wrapper.find('[data-testid="news-human-support-modal"]').exists(),
      ).toBe(true);
    });
  });

  describe('Props handling', () => {
    it('should pass modelValue prop to NewsModal', () => {
      const newsModal = wrapper.findComponent({ name: 'NewsModal' });
      expect(newsModal.props('modelValue')).toBe(true);
    });

    it('should pass title prop to NewsModal', () => {
      const newsModal = wrapper.findComponent({ name: 'NewsModal' });
      expect(newsModal.props('title')).toBe('News Title');
    });

    it('should pass news array to NewsModal', () => {
      const newsModal = wrapper.findComponent({ name: 'NewsModal' });
      expect(newsModal.props('news')).toBeDefined();
      expect(Array.isArray(newsModal.props('news'))).toBe(true);
    });

    it('should handle modelValue false', async () => {
      await wrapper.setProps({ modelValue: false });
      const newsModal = wrapper.findComponent({ name: 'NewsModal' });
      expect(newsModal.props('modelValue')).toBe(false);
    });
  });

  describe('Monitoring type news', () => {
    beforeEach(() => {
      wrapper = createWrapper({ type: 'monitoring' });
    });

    it('should have 5 news items for monitoring', () => {
      expect(wrapper.vm.news.length).toBe(5);
    });

    it('should have correct structure for monitoring news', () => {
      const news = wrapper.vm.news;
      news.forEach((item) => {
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('image');
      });
    });

    it('should include secondDescription in some items', () => {
      const newsWithSecondDescription = wrapper.vm.news.filter(
        (item) => item.secondDescription,
      );
      expect(newsWithSecondDescription.length).toBeGreaterThan(0);
    });

    it('should have correct translations for monitoring', () => {
      const news = wrapper.vm.news;
      expect(news[0].description).toBe('Monitoring first text');
      expect(news[1].description).toBe('Monitoring second text');
      expect(news[2].description).toBe('Monitoring third text');
    });

    it('should have images for all monitoring news', () => {
      const news = wrapper.vm.news;
      news.forEach((item) => {
        expect(item.image).toBeDefined();
      });
    });
  });

  describe('Analysis type news', () => {
    beforeEach(() => {
      wrapper = createWrapper({ type: 'analysis' });
    });

    it('should have 3 news items for analysis', () => {
      expect(wrapper.vm.news.length).toBe(3);
    });

    it('should have correct structure for analysis news', () => {
      const news = wrapper.vm.news;
      news.forEach((item) => {
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('image');
      });
    });

    it('should have correct translations for analysis', () => {
      const news = wrapper.vm.news;
      expect(news[0].description).toBe('Analysis first text');
      expect(news[1].description).toBe('Analysis second text');
      expect(news[2].description).toBe('Analysis third text');
    });

    it('should have images for all analysis news', () => {
      const news = wrapper.vm.news;
      news.forEach((item) => {
        expect(item.image).toBeDefined();
      });
    });

    it('should have secondDescription in last item', () => {
      const news = wrapper.vm.news;
      expect(news[2].secondDescription).toBe('Analysis fourth text');
    });
  });

  describe('Events', () => {
    it('should emit close when NewsModal emits close', async () => {
      const newsModal = wrapper.findComponent({ name: 'NewsModal' });
      await newsModal.vm.$emit('close');

      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should emit close once', async () => {
      const newsModal = wrapper.findComponent({ name: 'NewsModal' });
      await newsModal.vm.$emit('close');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('should call handleClose method', async () => {
      const newsModal = wrapper.findComponent({ name: 'NewsModal' });
      await newsModal.vm.$emit('close');

      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('Type switching', () => {
    it('should have different news content for different types', () => {
      const monitoringWrapper = createWrapper({ type: 'monitoring' });
      const analysisWrapper = createWrapper({ type: 'analysis' });

      expect(monitoringWrapper.vm.news[0].description).not.toBe(
        analysisWrapper.vm.news[0].description,
      );

      monitoringWrapper.unmount();
      analysisWrapper.unmount();
    });
  });

  describe('Title handling', () => {
    it('should set title from translations', () => {
      expect(wrapper.vm.title).toBe('News Title');
    });

    it('should pass correct title to NewsModal', () => {
      const newsModal = wrapper.findComponent({ name: 'NewsModal' });
      expect(newsModal.props('title')).toBe(wrapper.vm.title);
    });
  });
});

