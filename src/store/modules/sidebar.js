export default {
    namespaced: true,
    state: {
      chartVisible: false,
    },
    mutations: {
      setChartVisibility(state, isVisible) {
        state.chartVisible = isVisible;
      },
    },
    actions: {
      updateChartVisibility({ commit }, isVisible) {
        commit('setChartVisibility', isVisible);
      },
    },
  };