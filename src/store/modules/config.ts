import { defineStore } from 'pinia';

import Projects from '@/services/api/resources/projects';

import { moduleStorage } from '@/utils/storage';

interface Project {
  uuid: string;
  currency?: string;
  [key: string]: unknown;
}

export const useConfig = defineStore('config', {
  state: () => ({
    project: { uuid: '' } as Project,
    enableCreateCustomDashboards: false,
    enableCsat: false,
    token: '',
    isActiveRoute: false,
  }),

  getters: {
    projectCurrency: (state) => state.project?.currency || 'BRL',
  },

  actions: {
    setProject(project) {
      this.project = project;
      if (project?.uuid) {
        moduleStorage.setItem('projectUuid', project.uuid);
      }
    },
    setToken(token: string) {
      this.token = token;
      moduleStorage.setItem('token', token);
    },
    setIsActiveRoute(isActive: boolean) {
      this.isActiveRoute = isActive;
    },
    async checkEnableCsat() {
      const enabled = await Projects.verifyProjectCsat();
      this.enableCsat = enabled;
    },
    async loadProjectInfo() {
      if (!this.token || !this.project.uuid) return;

      try {
        const data = await Projects.getProjectInfo();
        this.setProject({ uuid: this.project.uuid, ...(data || {}) });
      } catch (error) {
        console.error('Error loading project info:', error);
      }
    },
  },
});
