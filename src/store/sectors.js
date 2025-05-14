const state = {
  sectors: [],
};

const getters = {
  getSectors: (state) => state.sectors,
  getSectorById: (state) => (uuid) =>
    state.sectors.find((sector) => sector.uuid === uuid),
};

const mutations = {
  SET_SECTORS(state, sectors) {
    state.sectors = sectors;
  },
};

const actions = {
  updateSectors({ commit }, sectors) {
    commit('SET_SECTORS', sectors);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
