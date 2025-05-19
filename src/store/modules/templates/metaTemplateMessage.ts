import { defineStore } from 'pinia';
import MetaTemplateMessage from '@/services/api/resources/template/metaTemplateMessage';

export const useMetaTemplateMessage = defineStore('metaTemplateMessage', {
  state: () => ({
    showSearchTemplateMetaModal: false,
    favoritesTemplates: [],
    selectedFavoriteTemplate: [{ value: '' }],
    selectedTemplateUuid: '',
    isLoadingFavoritesTemplates: false,
    emptyTemplates: false,
  }),
  actions: {
    async getFavoritesTemplates(dashboard) {
      const response = await MetaTemplateMessage.getFavoritesTemplates({
        dashboard,
      });
      this.favoritesTemplates = response;
    },
    setSelectedTemplateUuid(templateUuid) {
      this.selectedTemplateUuid = templateUuid;
    },
    setSelectedFavorite(template) {
      const favorite = Array.isArray(template) ? template : [template];

      this.selectedFavoriteTemplate = favorite;

      if (
        favorite[0].value &&
        this.selectedTemplateUuid !== favorite[0].value
      ) {
        this.setSelectedTemplateUuid = favorite[0].value;
      }
    },
    setEmptyTemplates(payload) {
      this.emptyTemplates = payload;
    },
    handlerShowSearchTemplateModal(payload) {
      this.showSearchTemplateMetaModal = payload;
    },
  },
});
