import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConfig } from '../config';

import Projects from '@/services/api/resources/projects';
import { moduleStorage } from '@/utils/storage';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    getProjectInfo: vi.fn(),
    verifyProjectCsat: vi.fn(),
  },
}));

describe('useConfig Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConfig();
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with default values', () => {
      expect(store.project).toEqual({ uuid: '' });
      expect(store.token).toBe('');
      expect(store.enableCreateCustomDashboards).toBe(false);
    });
  });

  describe('setProject', () => {
    it('should set the project and store uuid in moduleStorage', () => {
      const project = { uuid: 'project-123', name: 'Test Project' };
      store.setProject(project);

      expect(store.project).toEqual(project);
      expect(moduleStorage.getItem('projectUuid')).toBe('project-123');
    });

    it('should not persist uuid when it is missing', () => {
      store.setProject({ name: 'No uuid' });

      expect(moduleStorage.getItem('projectUuid')).toBe(null);
    });
  });

  describe('projectCurrency', () => {
    it('should default to BRL when the project has no currency', () => {
      expect(store.projectCurrency).toBe('BRL');
    });

    it('should return the project currency when it is set', () => {
      store.setProject({ uuid: 'project-123', currency: 'USD' });

      expect(store.projectCurrency).toBe('USD');
    });

    it('should fall back to BRL when the project currency is empty', () => {
      store.setProject({ uuid: 'project-123', currency: '' });

      expect(store.projectCurrency).toBe('BRL');
    });
  });

  describe('setToken', () => {
    it('should set the token and store it in moduleStorage', () => {
      store.setToken('my-secret-token');

      expect(store.token).toBe('my-secret-token');
      expect(moduleStorage.getItem('token')).toBe('my-secret-token');
    });
  });

  describe('loadProjectInfo', () => {
    it('should skip the request when token is missing', async () => {
      store.setProject({ uuid: 'project-123' });

      await store.loadProjectInfo();

      expect(Projects.getProjectInfo).not.toHaveBeenCalled();
    });

    it('should skip the request when project uuid is missing', async () => {
      store.setToken('my-secret-token');

      await store.loadProjectInfo();

      expect(Projects.getProjectInfo).not.toHaveBeenCalled();
    });

    it('should fetch project info and store the response', async () => {
      store.setToken('my-secret-token');
      store.setProject({ uuid: 'project-123' });
      Projects.getProjectInfo.mockResolvedValueOnce({
        uuid: 'project-123',
        name: 'Test Project',
      });

      await store.loadProjectInfo();

      expect(Projects.getProjectInfo).toHaveBeenCalled();
      expect(store.project).toEqual({
        uuid: 'project-123',
        name: 'Test Project',
      });
    });

    it('should keep the current uuid when the request fails', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      store.setToken('my-secret-token');
      store.setProject({ uuid: 'project-123' });
      Projects.getProjectInfo.mockRejectedValueOnce(new Error('fail'));

      await store.loadProjectInfo();

      expect(store.project).toEqual({ uuid: 'project-123' });
      consoleError.mockRestore();
    });
  });
});
