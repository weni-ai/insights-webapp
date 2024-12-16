import { beforeEach, describe, it } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];

import MetaTemplateMessage from '../MetaTemplateMessage.vue';

const templateMock = {
  title: 'Template Title',
  text: 'Template Text',
  hint: `Template Hint`,
  quality: 'high',
  name: 'template_test',
  image: 'https://img.com/img.png',
  buttons: [
    { icon: 'open_in_new', label: 'button1' },
    { icon: 'reply', label: 'button2' },
  ],
};

const createWrapper = () => {
  return mount(MetaTemplateMessage, {
    global: {
      stubs: {
        QualityTemplateMessageFlag: true,
      },
    },
    props: {
      template: templateMock,
    },
  });
};

describe('MetaTemplateMessage', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders the component with all template data', () => {
    const wrapperText = wrapper.text();
    expect(wrapperText).toContain('template_test');

    expect(wrapperText).toContain('Template Title');
    expect(wrapperText).toContain('Template Text');
    expect(wrapperText).toContain('Template Hint');

    const image = wrapper.find('[data-testid="template-image"]');
    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('https://img.com/img.png');

    const buttons = wrapper.findAll('[data-testid="template-button"]');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text()).toContain('button1');
    expect(buttons[1].text()).toContain('button2');
  });

  it('does not render the image if "image" prop is missing', async () => {
    await wrapper.setProps({ template: { image: null } });

    const image = wrapper.find('[data-testid="template-image"]');
    expect(image.exists()).toBe(false);
  });

  it('renders the quality flag with the correct quality', () => {
    const qualityFlag = wrapper.findComponent({
      name: 'QualityTemplateMessageFlag',
    });
    expect(qualityFlag.exists()).toBe(true);
    expect(qualityFlag.props('quality')).toBe('high');
  });

  it('emits "open-edit-template" when the edit button is clicked', async () => {
    const editButton = wrapper.find('[data-testid="template-edit-button"]');
    await editButton.trigger('click');

    expect(wrapper.emitted('open-edit-template')).toBeTruthy();
  });

  it('renders buttons dynamically based on props', () => {
    const buttons = wrapper.findAll('[data-testid="template-button"]');
    expect(buttons).toHaveLength(2);

    expect(buttons[0].text()).toContain('button1');
    expect(buttons[1].text()).toContain('button2');
  });

  it('handles missing props gracefully', async () => {
    await wrapper.setProps({
      template: { ...templateMock, buttons: null, text: null, hint: null },
    });

    const buttons = wrapper.findAll('[data-testid="template-button"]');
    expect(buttons).toHaveLength(0);

    expect(wrapper.text()).not.toContain('Template Text');
    expect(wrapper.text()).not.toContain('Template Hint');
  });
});
