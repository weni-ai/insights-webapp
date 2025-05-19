import { mount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useMetaTemplateMessage } from '@/store/modules/templates/metaTemplateMessage';

import { expect, vi } from 'vitest';
import { createI18n } from 'vue-i18n';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import FilterFavoriteTemplate from '../FilterFavoriteTemplateMessage.vue';

vi.mock('@/services/api/resources/template/metaTemplateMessage', () => ({
  default: {
    getFavoritesTemplates: vi.fn().mockResolvedValue([
      { name: 'Fav1', id: '1' },
      { name: 'Fav2', id: '2' },
    ]),
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

describe('FilterFavoriteTemplate.vue', () => {
  let store;
  let wrapper;

  const createWrapper = () => {
    return mount(FilterFavoriteTemplate, {
      global: { plugins: [store, UnnnicSystem] },
    });
  };

  beforeEach(() => {
    store = createTestingPinia({
      initialState: {
        metaTemplateMessage: {
          getFavoritesTemplates: vi.fn(),
          setSelectedFavorite: vi.fn(),
          emptyTemplates: false,
          favoritesTemplates: [
            { id: '1', name: 'Favorite 1' },
            { id: '2', name: 'Favorite 2' },
          ],
          selectedTemplateUuid: '1',
          selectedFavoriteTemplate: '',
        },
        dashboards: {
          currentDashboard: {
            uuid: 'abc',
            config: { is_whatsapp_integration: true },
          },
        },
      },
    });
    wrapper = createWrapper();
  });

  it('renders component correctly when conditions are met', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('calls getFavoritesTemplates on mount', async () => {
    const metaTemplateMessageStore = useMetaTemplateMessage();

    const dispatchSpy = vi.spyOn(
      metaTemplateMessageStore,
      'getFavoritesTemplates',
    );
    wrapper = createWrapper();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('updates selectedFavorite when a favorite is selected', async () => {
    const metaTemplateMessageStore = useMetaTemplateMessage();

    const dispatchSpy = vi.spyOn(
      metaTemplateMessageStore,
      'setSelectedFavorite',
    );

    await wrapper
      .findComponent('[data-testid="select-favorite-template"]')
      .vm.$emit('update:model-value', '1');

    expect(dispatchSpy).toHaveBeenCalledWith('1');
  });

  it('resets selectedFavorite when selectedTemplateUuid changes to non-favorite', async () => {
    const metaTemplateMessageStore = useMetaTemplateMessage();

    const dispatchSpy = vi.spyOn(
      metaTemplateMessageStore,
      'setSelectedFavorite',
    );

    metaTemplateMessageStore.selectedTemplateUuid = '4';

    await wrapper.vm.$nextTick();

    expect(dispatchSpy).toHaveBeenCalledWith({ label: 'Select', value: '' });
  });
});
