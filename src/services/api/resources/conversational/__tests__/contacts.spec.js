import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import contactsService from '../contacts';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useConversational } from '@/store/modules/conversational/conversational';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: vi.fn(),
}));

vi.mock('@/utils/request', () => ({
  createRequestQuery: vi.fn((params) => params),
}));

describe('contactsService', () => {
  const mockProjectUuid = 'test-project-uuid';
  const mockApiResponse = {
    unique: { value: 80 },
    returning: { value: 28, percentage: 35 },
    avg_conversations_per_contact: { value: 1.25 },
  };
  const mockAppliedFilters = {
    'some-filter': 'some-value',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    useConfig.mockReturnValue({
      project: {
        uuid: mockProjectUuid,
      },
    });

    useConversational.mockReturnValue({
      appliedFilters: mockAppliedFilters,
    });
  });

  describe('getConversationalContacts', () => {
    it('should fetch, format, and return conversational contacts successfully', async () => {
      const queryParams = { start_date: '2023-01-01', end_date: '2023-01-31' };
      http.get.mockResolvedValue(mockApiResponse);

      const result =
        await contactsService.getConversationalContacts(queryParams);

      const expectedParams = {
        ...queryParams,
        project_uuid: mockProjectUuid,
        ...mockAppliedFilters,
      };
      expect(createRequestQuery).toHaveBeenCalledWith(queryParams);
      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/contacts/',
        {
          params: expectedParams,
          signal: undefined,
        },
      );

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'unique', value: 80 }),
          expect.objectContaining({
            id: 'returning',
            value: 28,
            percentage: 35,
          }),
          expect.objectContaining({
            id: 'avg_conversations_per_contact',
            value: 1.25,
          }),
        ]),
      );
    });

    it('should forward AbortSignal to the underlying http call', async () => {
      http.get.mockResolvedValue(mockApiResponse);

      const controller = new AbortController();

      await contactsService.getConversationalContacts({}, {
        signal: controller.signal,
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/contacts/',
        expect.objectContaining({ signal: controller.signal }),
      );
    });

    it('should omit percentage on metrics that do not provide it', async () => {
      http.get.mockResolvedValue(mockApiResponse);

      const result = await contactsService.getConversationalContacts();

      const uniqueMetric = result.find((m) => m.id === 'unique');
      const avgMetric = result.find(
        (m) => m.id === 'avg_conversations_per_contact',
      );

      expect(uniqueMetric).not.toHaveProperty('percentage');
      expect(avgMetric).not.toHaveProperty('percentage');
    });

    it('should handle API errors by rejecting the promise', async () => {
      const apiError = new Error('Network Error');
      http.get.mockRejectedValue(apiError);

      await expect(
        contactsService.getConversationalContacts(),
      ).rejects.toThrow('Network Error');
    });

    it('should work correctly with empty query parameters', async () => {
      http.get.mockResolvedValue(mockApiResponse);

      await contactsService.getConversationalContacts();

      const expectedParams = {
        project_uuid: mockProjectUuid,
        ...mockAppliedFilters,
      };
      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/contacts/',
        expect.objectContaining({ params: expectedParams }),
      );
    });

    it('should pass undefined signal when options are not provided', async () => {
      http.get.mockResolvedValue(mockApiResponse);

      await contactsService.getConversationalContacts();

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/contacts/',
        expect.objectContaining({ signal: undefined }),
      );
    });
  });
});
