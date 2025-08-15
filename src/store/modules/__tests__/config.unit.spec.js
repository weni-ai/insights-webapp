import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConfig } from '../config';
import Projects from '@/services/api/resources/projects';
import { moduleStorage } from '@/utils/storage';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    verifyProjectIndexer: vi.fn(),
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
  });

  describe('setToken', () => {
    it('should set the token and store it in moduleStorage', () => {
      store.setToken('my-secret-token');

      expect(store.token).toBe('my-secret-token');
      expect(moduleStorage.getItem('token')).toBe('my-secret-token');
    });
  });

  describe('checkEnableCreateCustomDashboards', () => {
    it('should update enableCreateCustomDashboards to true if API returns true', async () => {
      Projects.verifyProjectIndexer.mockResolvedValue(true);

      await store.checkEnableCreateCustomDashboards();

      expect(Projects.verifyProjectIndexer).toHaveBeenCalled();
      expect(store.enableCreateCustomDashboards).toBe(true);
    });

    it('should update enableCreateCustomDashboards to false if API returns false', async () => {
      Projects.verifyProjectIndexer.mockResolvedValue(false);

      await store.checkEnableCreateCustomDashboards();

      expect(store.enableCreateCustomDashboards).toBe(false);
    });
  });
});
