import GPT from '@/services/api/resources/GPT';

const mutations = {
  ADD_INSIGHT: 'ADD_INSIGHT',
};

export default {
  namespaced: true,

  state: {
    insights: [],
  },

  mutations: {
    [mutations.ADD_INSIGHT](state, { request, received }) {
      state.insights.push({ request, received });
    },
  },

  actions: {
    async getInsights({ commit }, { prompt }) {
      const response = await GPT.getInsights(prompt);

      commit(mutations.ADD_INSIGHT, {
        request: prompt,
        received: response.output.text?.[0] || '',
      });
    },
  },
};
