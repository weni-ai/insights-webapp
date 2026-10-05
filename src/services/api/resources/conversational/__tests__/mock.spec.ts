import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import mockService from '../mock';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

describe('mockService', () => {
  const mockProjectUuid = 'test-project-uuid';

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    useConfig.mockReturnValue({
      project: {
        uuid: mockProjectUuid,
      },
    });
  });

  describe('getShouldShowMock', () => {
    it('should request the should-show-mock endpoint with project_uuid', async () => {
      http.get.mockResolvedValue({ should_show_mock: true });

      await mockService.getShouldShowMock();

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/should-show-mock/',
        { params: { project_uuid: mockProjectUuid } },
      );
    });

    it('should return should_show_mock from the response', async () => {
      http.get.mockResolvedValue({ should_show_mock: true });

      await expect(mockService.getShouldShowMock()).resolves.toBe(true);

      http.get.mockResolvedValue({ should_show_mock: false });

      await expect(mockService.getShouldShowMock()).resolves.toBe(false);
    });

    it('should return false when should_show_mock is missing', async () => {
      http.get.mockResolvedValue({});

      await expect(mockService.getShouldShowMock()).resolves.toBe(false);
    });
  });
});
