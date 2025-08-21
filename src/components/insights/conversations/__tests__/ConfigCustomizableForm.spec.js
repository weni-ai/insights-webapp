import { beforeEach, describe, expect, it } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import ConfigCustomizableForm from '../CustomizableWidget/ConfigCustomizableForm.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}) => {
  return shallowMount(ConfigCustomizableForm, {
    props: {
      type: 'csat',
      isNew: false,
      ...props,
    },
    global: {
      stubs: {
        SentimentAnalysisForm: true,
        CustomizedForm: true,
      },
      mocks: {
        $tc: (key) => key,
      },
    },
  });
};

describe('ConfigCustomizableForm', () => {
  let wrapper;

  const configCustomizableFormTitle = () =>
    wrapper.find('[data-testid="config-customizable-form-title"]');
  const sentimentAnalysisForm = () =>
    wrapper.findComponent({ name: 'SentimentAnalysisForm' });
  const customizedForm = () =>
    wrapper.findComponent({ name: 'CustomizedForm' });

  describe('Component Structure', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('should render component with correct structure', () => {
      expect(configCustomizableFormTitle().exists()).toBe(true);
      expect(sentimentAnalysisForm().exists()).toBe(true);
    });

    it('should display correct title based on type prop', () => {
      expect(configCustomizableFormTitle().text()).toBe(
        'conversations_dashboard.csat',
      );
    });

    it('should display correct title for NPS type', () => {
      wrapper = createWrapper({ type: 'nps' });
      expect(configCustomizableFormTitle().text()).toBe(
        'conversations_dashboard.nps',
      );
    });

    it('should render CustomizedForm when type is custom', () => {
      wrapper = createWrapper({ type: 'custom' });
      expect(customizedForm().exists()).toBe(true);
      expect(sentimentAnalysisForm().exists()).toBe(false);
    });

    it('should pass correct props to SentimentAnalysisForm', () => {
      expect(sentimentAnalysisForm().props('type')).toBe('csat');
      expect(sentimentAnalysisForm().props('isNew')).toBe(false);
    });

    it('should pass correct props to SentimentAnalysisForm for NPS type', () => {
      wrapper = createWrapper({ type: 'nps', isNew: true });
      expect(sentimentAnalysisForm().props('type')).toBe('nps');
      expect(sentimentAnalysisForm().props('isNew')).toBe(true);
    });
  });
});
