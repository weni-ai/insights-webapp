import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, config, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import { createStore } from 'vuex';

import VtexConversionsForm from '../DrawerConfigContentVtexConversions.vue';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

import MetaTemplateMessageService from '@/services/api/resources/template/metaTemplateMessage';

vi.mock('@/services/api/resources/template/metaTemplateMessage', () => ({
  default: {
    listWabasId: vi
      .fn()
      .mockResolvedValue([{ id: 'waba-id', phone_number: '+5599999999999' }]),
    listTemplates: vi.fn().mockResolvedValue({
      results: [{ id: 'template-id', name: 'Promo' }],
    }),
  },
}));

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

describe('VtexConversionsForm.vue', () => {
  let store;
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(VtexConversionsForm, {
      global: { plugins: [store, UnnnicSystem] },
      props: {
        modelValue: {
          type: 'vtex_conversions',
          name: '',
          config: {
            filter: { waba_id: '', template_id: '', utm_source: '' },
            template_name: '',
          },
        },
        ...props,
      },
    });
  };

  beforeEach(() => {
    store = createStore({
      state: {
        config: {
          project: { uuid: 'test-project-uuid' },
        },
      },
    });
    wrapper = createWrapper();
  });

  it('should render component correctly', async () => {
    await nextTick();
    expect(wrapper.find('[data-testid="vtex-conversions-form"]').exists()).toBe(
      true,
    );
  });

  it('should fetch and select waba automatically if only one exists', async () => {
    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.vm.selectedWaba[0]?.value).toBe('waba-id');
  });

  it('should fetch templates when WABA is selected', async () => {
    const templatesSpy = vi.spyOn(MetaTemplateMessageService, 'listTemplates');

    wrapper.vm.selectedWaba = [{ label: 'WABA Test', value: 'waba-id' }];

    await flushPromises();

    expect(templatesSpy).toHaveBeenCalledWith({
      limit: 20,
      waba_id: 'waba-id',
      project_uuid: 'test-project-uuid',
      fields: 'name,id',
      search: '',
    });

    expect(wrapper.vm.templates.length).toBeGreaterThan(0);
  });

  it('should update modelValue when user fills fields', async () => {
    wrapper.vm.widgetData.name = 'My config';
    wrapper.vm.widgetData.config.filter.utm_source = 'store_utm';
    wrapper.vm.widgetData.config.template_name = 'Promo';
    wrapper.vm.widgetData.config.filter.template_id = 'template-id';
    wrapper.vm.widgetData.config.filter.waba_id = 'waba-id';

    await nextTick();

    const emitted = wrapper.emitted('update:modelValue');

    expect(emitted[emitted.length - 1][0].name).toBe('My config');

    expect(wrapper.emitted('update-disable-primary-button')[2][0]).toBe(false);
  });

  it('should call handlerIsEditingWidgetData when editing existing widget', async () => {
    const wrapper = createWrapper({
      modelValue: {
        type: 'vtex_conversions',
        name: 'Editing',
        config: {
          filter: {
            waba_id: 'waba-id',
            template_id: 'template-id',
            utm_source: 'vtex',
          },
          template_name: 'Promo',
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.widgetData.name).toBe('Editing');
    expect(wrapper.vm.selectedTemplate[0].label).toBe('Promo');
  });

  it('should reset widgetData on click reset buttons', async () => {
    const resetMetaFieldsSpy = vi.spyOn(wrapper.vm, 'resetMetaFields');

    wrapper.vm.widgetData.name = 'My config';
    wrapper.vm.widgetData.config.filter.utm_source = 'store_utm';
    wrapper.vm.widgetData.config.template_name = 'Promo';
    wrapper.vm.widgetData.config.filter.template_id = 'template-id';
    wrapper.vm.widgetData.config.filter.waba_id = 'waba-id';

    await nextTick();

    const resetMetaData = wrapper.find(
      '[data-testid="reset-meta-fields-button"]',
    );
    const resetVtexData = wrapper.find(
      '[data-testid="reset-vtex-fields-button"]',
    );

    await resetMetaData.trigger('click');

    expect(resetMetaFieldsSpy).toHaveBeenCalled();
    expect(wrapper.vm.widgetData.config.filter.template_id).toBe('');
    expect(wrapper.vm.widgetData.config.filter.waba_id).toBe('');
    expect(wrapper.vm.selectedWaba).toStrictEqual([
      { value: '', label: expect.any(String) },
    ]);
    expect(wrapper.vm.selectedTemplate).toStrictEqual([
      { value: '', label: expect.any(String) },
    ]);

    await resetVtexData.trigger('click');

    expect(wrapper.vm.widgetData.config.filter.utm_source).toBe('');
  });

  it('should emit reset-widget when reset widget button click', async () => {
    const resetWidgetButton = wrapper.find('[data-testid="reset-widget"]');
    await resetWidgetButton.trigger('click');
    expect(wrapper.emitted('reset-widget')).toBeTruthy();
  });
});
