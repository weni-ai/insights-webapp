import Projects from '@/services/api/resources/projects';

const mutations = {
  SET_PROJECT: 'SET_PROJECT',
  SET_TOKEN: 'SET_TOKEN',
  SET_ENABLE_CREATE_CUSTOM_DASHBOARDS: 'SET_ENABLE_CREATE_CUSTOM_DASHBOARDS',
};

export default {
  namespaced: true,
  state: {
    project: {
      uuid: '',
    },
    enableCreateCustomDashboards: false,
    token: '',
  },
  mutations: {
    [mutations.SET_PROJECT](state, project) {
      localStorage.setItem('projectUuid', project.uuid);
      state.project = project;
    },
    [mutations.SET_TOKEN](state, token) {
      localStorage.setItem('token', token);
      state.token = token;
    },
    [mutations.SET_ENABLE_CREATE_CUSTOM_DASHBOARDS](
      state,
      enableCreateCustomDashboards,
    ) {
      state.enableCreateCustomDashboards = enableCreateCustomDashboards;
    },
  },
  actions: {
    setProject({ commit }, project) {
      commit(mutations.SET_PROJECT, project);
    },
    setToken({ commit }, token) {
      commit(mutations.SET_TOKEN, token);
    },
    async checkEnableCreateCustomDashboards({ commit }) {
      const enabled = await Projects.verifyProjectIndexer();
      commit(mutations.SET_ENABLE_CREATE_CUSTOM_DASHBOARDS, enabled);
    },
  },
};
