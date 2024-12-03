import { beforeEach, describe } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import QualityTemplateMessageFlag from '../QualityTemplateMessageFlag.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('QualityTemplateMessageFlag', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(QualityTemplateMessageFlag, {});
  });

  it('renders correctly with "high" quality', async () => {
    await wrapper.setProps({ quality: 'high', showDot: true, showInfo: true });
    expect(wrapper.classes()).toContain('quality-template-message-flag--high');
    expect(wrapper.find('.dot').exists()).toBe(true);
    expect(wrapper.find('.info').exists()).toBe(true);
  });

  it('renders correctly with "medium" quality and no dot/info', () => {
    const wrapper = mount(QualityTemplateMessageFlag, {
      props: { quality: 'medium', showDot: false, showInfo: false },
    });

    expect(wrapper.classes()).toContain(
      'quality-template-message-flag--medium',
    );
    expect(wrapper.find('.dot').exists()).toBe(false);
    expect(wrapper.find('.info').exists()).toBe(false);
  });

  it('renders correctly with "low" quality', () => {
    const wrapper = mount(QualityTemplateMessageFlag, {
      props: { quality: 'low', showDot: true, showInfo: false },
    });

    expect(wrapper.classes()).toContain('quality-template-message-flag--low');
    expect(wrapper.find('.dot').exists()).toBe(true);
    expect(wrapper.find('.info').exists()).toBe(false);
  });

  it('applies the correct color scheme for each quality level', async () => {
    await wrapper.setProps({ quality: 'high', showDot: true });

    expect(wrapper.find('.dot').attributes('scheme')).toBe('aux-green-500');

    await wrapper.setProps({ quality: 'medium', showDot: true });

    expect(wrapper.find('.dot').attributes('scheme')).toBe('aux-orange-500');

    await wrapper.setProps({ quality: 'low', showDot: true });

    expect(wrapper.find('.dot').attributes('scheme')).toBe('aux-red-500');
  });
});
