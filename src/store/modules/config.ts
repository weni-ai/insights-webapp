import { defineStore } from 'pinia';

import Projects from '@/services/api/resources/projects';
import { moduleStorage } from '@/utils/storage';

export const useConfig = defineStore('config', {
  state: () => ({
    project: { uuid: '' },
    enableCreateCustomDashboards: false,
    enableCsat: false,
    token: '',
    isActiveRoute: false,
  }),

  actions: {
    setProject(project) {
      this.project = project;
      moduleStorage.setItem('projectUuid', project.uuid);
    },
    setToken(token: string) {
      this.token = token;
      moduleStorage.setItem('token', token);
    },
    setIsActiveRoute(isActive: boolean) {
      this.isActiveRoute = isActive;
    },

    async checkEnableCreateCustomDashboards() {
      const enabled = await Projects.verifyProjectIndexer();
      this.enableCreateCustomDashboards = enabled;
    },

    async checkEnableCsat() {
      const enabled = await Projects.verifyProjectCsat();
      this.enableCsat = enabled;
    },
  },
});
