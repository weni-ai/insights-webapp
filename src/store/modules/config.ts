import { defineStore } from 'pinia';

import Projects from '@/services/api/resources/projects';

export const useConfig = defineStore('config', {
  state: () => ({
    project: { uuid: '' },
    enableCreateCustomDashboards: false,
    token: '',
  }),

  actions: {
    setProject(project) {
      this.project = project;
      localStorage.setItem('projectUuid', project.uuid);
    },
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
    },

    async checkEnableCreateCustomDashboards() {
      const enabled = await Projects.verifyProjectIndexer();
      this.enableCreateCustomDashboards = enabled;
    },
  },
});
