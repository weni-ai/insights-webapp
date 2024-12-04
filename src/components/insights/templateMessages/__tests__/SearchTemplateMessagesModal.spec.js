import { beforeEach, describe, expect, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import SearchTemplateMessagesModal from '../SearchTemplateMessagesModal.vue';

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

describe('SearchTemplateMessagesModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(SearchTemplateMessagesModal, {
      props: {
        vmodel: true,
      },
      global: {
        stubs: {
          UnnnicTableNext: true,
          FilterInputText: true,
          FilterSelectDate: true,
          FilterSelect: true,
          QualityTemplateMessageFlag: true,
        },
      },
    });
  });

  it('changes page correctly on pagination update and searchTemplates', async () => {
    const table = wrapper.findComponent(
      '[data-testid="template-messages-table"]',
    );

    table.vm.$emit('update:pagination', 3);
    expect(wrapper.vm.tablePagination.page).toBe(3);
  });

  it('should searchTemplates on update any filter value', async () => {
    const searchTemplatesSpy = vi.spyOn(wrapper.vm, 'searchTemplates');
    const filter = wrapper.findComponent('[data-testid="filter-name"]');
    await filter.vm.$emit('update:modelValue', 'filter');
    expect(searchTemplatesSpy).toHaveBeenCalled();
  });
});
