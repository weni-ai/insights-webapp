import * as jwt from '@/utils/jwt';
import { verifyIfWeniEmail } from '@/utils/user';

const mutations = {
  SET_PROJECT: 'SET_PROJECT',
  SET_TOKEN: 'SET_TOKEN',
};

export default {
  namespaced: true,
  state: {
    project: {
      uuid: 'b24ee4dd-d8d8-430d-990a-794586f4ceb4', // Temporary mock uuid
    },
    token: '',
  },
  mutations: {
    [mutations.SET_PROJECT](state, project) {
      state.project = project;
    },
    [mutations.SET_TOKEN](state, token) {
      state.token = token;
    },
  },
  actions: {
    async setProject({ commit }, project) {
      commit(mutations.SET_PROJECT, project);
    },
    setToken({ commit }, token) {
      commit(mutations.SET_TOKEN, token);
    },
  },
  getters: {
    enableSystem(state) {
      const userEmail = jwt.decode(state.token).email;
      return verifyIfWeniEmail(userEmail);
    },
  },
};
