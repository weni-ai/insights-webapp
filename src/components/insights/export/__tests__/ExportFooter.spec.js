import { beforeEach, describe, expect, it } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import ExportFooter from '../ExportFooter.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
});

config.global.plugins = [i18n];

describe('ExportFooter', () => {
  let wrapper;

  const defaultProps = {
    selectedFormat: '.xlsx',
    acceptTerms: false,
    formatLabel: 'Format',
    warningTermsText: 'Warning message',
    acceptTermsText: 'I accept terms',
  };

  const createWrapper = (props = {}) => {
    return mount(ExportFooter, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UnnnicRadio: true,
          UnnnicCheckbox: true,
          UnnnicLabel: true,
          UnnnicIcon: true,
        },
      },
    });
  };

  const section = () => wrapper.find('.export-footer');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render format section with radio buttons', () => {
      const formatSection = wrapper.find('.export-footer__format');
      expect(formatSection.exists()).toBe(true);
    });

    it('should render terms section', () => {
      const termsSection = wrapper.find('.export-footer__terms');
      expect(termsSection.exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('should accept selectedFormat prop', () => {
      wrapper = createWrapper({ selectedFormat: '.csv' });
      expect(wrapper.props('selectedFormat')).toBe('.csv');
    });

    it('should accept acceptTerms prop', () => {
      wrapper = createWrapper({ acceptTerms: true });
      expect(wrapper.props('acceptTerms')).toBe(true);
    });

    it('should use default values', () => {
      wrapper = createWrapper({
        formatLabel: undefined,
        warningTermsText: undefined,
        acceptTermsText: undefined,
      });
      expect(wrapper.props('formatLabel')).toBe('');
      expect(wrapper.props('warningTermsText')).toBe('');
      expect(wrapper.props('acceptTermsText')).toBe('');
    });
  });

  describe('Events', () => {
    it('should emit format-change event when format changes', async () => {
      await wrapper.vm.handleFormatChange('.csv');

      expect(wrapper.emitted('format-change')).toBeTruthy();
      expect(wrapper.emitted('format-change')[0]).toEqual(['.csv']);
    });

    it('should emit accept-terms-change event', async () => {
      await wrapper.vm.handleAcceptTermsChange(true);

      expect(wrapper.emitted('accept-terms-change')).toBeTruthy();
      expect(wrapper.emitted('accept-terms-change')[0]).toEqual([true]);
    });

    it('should handle multiple format changes', async () => {
      await wrapper.vm.handleFormatChange('.csv');
      await wrapper.vm.handleFormatChange('.xlsx');

      expect(wrapper.emitted('format-change')).toHaveLength(2);
      expect(wrapper.emitted('format-change')[1]).toEqual(['.xlsx']);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('export-footer');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
