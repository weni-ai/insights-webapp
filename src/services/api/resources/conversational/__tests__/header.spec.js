import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import headerService from '../header';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

vi.mock('@/utils/request', () => ({
  createRequestQuery: vi.fn((params) => params),
}));

describe('headerService', () => {
  const mockProjectUuid = 'test-project-uuid';
  const mockApiResponse = {
    total_conversations: { value: 150, percentage: 100 },
    resolved: { value: 120, percentage: 80 },
    unresolved: { value: 20, percentage: 13.33 },
    abandoned: { value: 10, percentage: 6.67 },
    transferred_to_human: { value: 5, percentage: 3.33 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    useConfig.mockReturnValue({
      project: {
        uuid: mockProjectUuid,
      },
    });
  });

  describe('getConversationalHeaderTotals', () => {
    it('should fetch, format, and return conversational totals successfully', async () => {
      // Arrange
      const queryParams = { start_date: '2023-01-01', end_date: '2023-01-31' };
      http.get.mockResolvedValue(mockApiResponse);

      // Act
      const result =
        await headerService.getConversationalHeaderTotals(queryParams);

      // Assert
      const expectedParams = {
        ...queryParams,
        project_uuid: mockProjectUuid,
      };
      expect(createRequestQuery).toHaveBeenCalledWith(queryParams);
      expect(http.get).toHaveBeenCalledWith('/metrics/conversations/totals/', {
        params: expectedParams,
      });

      expect(result).toHaveLength(5);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'total_conversations', value: 150 }),
          expect.objectContaining({ id: 'resolved', value: 120 }),
          expect.objectContaining({ id: 'unresolved', value: 20 }),
          expect.objectContaining({ id: 'abandoned', value: 10 }),
          expect.objectContaining({ id: 'transferred_to_human', value: 5 }),
        ]),
      );
    });

    it('should handle API errors by rejecting the promise', async () => {
      // Arrange
      const apiError = new Error('Network Error');
      http.get.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        headerService.getConversationalHeaderTotals(),
      ).rejects.toThrow('Network Error');
    });

    it('should work correctly with empty query parameters', async () => {
      // Arrange
      http.get.mockResolvedValue(mockApiResponse);

      // Act
      await headerService.getConversationalHeaderTotals();

      // Assert
      const expectedParams = {
        project_uuid: mockProjectUuid,
      };
      expect(http.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ params: expectedParams }),
      );
    });
  });
});
