import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConfig } from '../config';

import { moduleStorage } from '@/utils/storage';

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
});
