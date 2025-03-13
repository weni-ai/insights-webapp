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

  it('renders correctly template status', async () => {
    await wrapper.setProps({ status: 'APPROVED' });
    expect(wrapper.classes()).toContain(
      'quality-template-message-flag--approved',
    );
  });
});
