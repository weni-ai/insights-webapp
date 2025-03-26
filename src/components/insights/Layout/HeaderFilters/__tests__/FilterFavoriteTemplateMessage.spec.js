import { mount, config } from '@vue/test-utils';
import { createStore } from 'vuex';
import { vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import FilterFavoriteTemplate from '../FilterFavoriteTemplateMessage.vue';

vi.mock('@/services/api/resources/template/metaTemplateMessage', () => ({
  default: {
    getFavoritesTemplates: vi.fn().mockResolvedValue([
      { name: 'Fav1', id: 1 },
      { name: 'Fav2', id: 2 },
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
    store = createStore({
      state: {
        metaTemplateMessage: {
          emptyTemplates: false,
          favoritesTemplates: [
            { id: '1', name: 'Favorite 1' },
            { id: '2', name: 'Favorite 2' },
          ],
          selectedTemplateUuid: null,
          selectedFavoriteTemplate: '',
        },
        dashboards: {
          currentDashboard: { config: { is_whatsapp_integration: true } },
        },
      },
      actions: {
        'metaTemplateMessage/getFavoritesTemplates': vi.fn(),
        'metaTemplateMessage/setSelectedFavorite': vi.fn(),
      },
    });
    wrapper = createWrapper();
  });

  it('renders component correctly when conditions are met', () => {
    expect(wrapper.exists()).toBe(true);
  });

  //   it('calls getFavoritesTemplates on mount', async () => {
  //     mount(FilterFavoriteTemplate, { global: { plugins: [store] } });
  //     await new Promise((resolve) => setTimeout(resolve, 0));
  //     expect(store.dispatch).toHaveBeenCalledWith(
  //       'metaTemplateMessage/getFavoritesTemplates',
  //       expect.any(String),
  //     );
  //   });

  //   it('updates selectedFavorite when a favorite is selected', async () => {
  //     const wrapper = mount(FilterFavoriteTemplate, {
  //       global: { plugins: [store] },
  //     });

  //     await wrapper
  //       .findComponent({ name: 'UnnnicSelectSmart' })
  //       .vm.$emit('update:model-value', '1');

  //     expect(store.dispatch).toHaveBeenCalledWith(
  //       'metaTemplateMessage/setSelectedFavorite',
  //       '1',
  //     );
  //   });

  //   it('resets selectedFavorite when selectedTemplateUuid changes to non-favorite', async () => {
  //     const wrapper = mount(FilterFavoriteTemplate, {
  //       global: { plugins: [store] },
  //     });

  //     store.state.metaTemplateMessage.selectedTemplateUuid = '999';
  //     await new Promise((resolve) => setTimeout(resolve, 0));

  //     expect(store.dispatch).toHaveBeenCalledWith(
  //       'metaTemplateMessage/setSelectedFavorite',
  //       '',
  //     );
  //   });
});
