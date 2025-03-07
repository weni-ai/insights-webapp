import MetaTemplateMessage from '@/services/api/resources/template/metaTemplateMessage';

const mutations = {
  SET_FAVORITES_TEMPLATES: 'SET_FAVORITES_TEMPLATES',
  SET_SELECTED_FAVORITE_TEMPLATE: 'SET_SELECTED_FAVORITE_TEMPLATE',
  SET_SELECTED_TEMPLATE_UUID: 'SET_SELECTED_TEMPLATE_UUID',
  SET_IS_LOADING_FAVORITES_TEMPLATES: 'SET_IS_LOADING_FAVORITES_TEMPLATES',
};

export default {
  namespaced: true,
  state: {
    favoritesTemplates: [],
    selectedFavoriteTemplate: [],
    selectedTemplateUuid: '',
    isLoadingFavoritesTemplates: false,
  },
  mutations: {
    [mutations.SET_FAVORITES_TEMPLATES](state, payload) {
      state.favoritesTemplates = payload;
    },
    [mutations.SET_SELECTED_FAVORITE_TEMPLATE](state, payload) {
      state.selectedFavoriteTemplate = payload;
    },
    [mutations.SET_IS_LOADING_FAVORITES_TEMPLATES](state, payload) {
      state.isLoadingFavoritesTemplates = payload;
    },
    [mutations.SET_SELECTED_TEMPLATE_UUID](state, payload) {
      state.selectedTemplateUuid = payload;
    },
  },
  actions: {
    async getFavoritesTemplates({ commit }) {
      const response = await MetaTemplateMessage.getFavoritesTemplates();
      commit(mutations.SET_FAVORITES_TEMPLATES, response);
    },

    setSelectedTemplateUuid({ commit }, templateUuid) {
      commit(mutations.SET_SELECTED_TEMPLATE_UUID, templateUuid);
    },

    setSelectedFavorite({ commit, dispatch, state }, template) {
      const favorite = Array.isArray(template) ? template : [template];

      commit(mutations.SET_SELECTED_FAVORITE_TEMPLATE, favorite);

      if (
        favorite[0].value &&
        state.selectedTemplateUuid !== favorite[0].value
      ) {
        dispatch('setSelectedTemplateUuid', favorite[0].value);
      }
    },
  },
};
