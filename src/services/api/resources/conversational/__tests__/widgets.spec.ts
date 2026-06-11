import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import WidgetConversationalService from '../widgets';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useConversational } from '@/store/modules/conversational/conversational';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/services/api/http2', () => ({
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

describe('WidgetConversationalService - product ranking endpoints', () => {
  const mockProjectUuid = 'test-project-uuid';
  const mockAppliedFilters = {
    start_date: '2026-01-01',
    end_date: '2026-01-31',
  };
  const mockResponse = {
    results: [{ label: 'azeite', value: 12.23, full_value: 17 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    useConfig.mockReturnValue({ project: { uuid: mockProjectUuid } });
    useConversational.mockReturnValue({ appliedFilters: mockAppliedFilters });
  });

  describe('getSearchTermsData', () => {
    it('calls the search-terms endpoint with merged params and returns data', async () => {
      http.get.mockResolvedValue(mockResponse);

      const result = await WidgetConversationalService.getSearchTermsData({
        widget_uuid: 'w-1',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/search-terms/',
        expect.objectContaining({
          params: {
            project_uuid: mockProjectUuid,
            ...mockAppliedFilters,
            widget_uuid: 'w-1',
          },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('forwards the AbortSignal', async () => {
      http.get.mockResolvedValue(mockResponse);
      const controller = new AbortController();

      await WidgetConversationalService.getSearchTermsData(
        {},
        { signal: controller.signal },
      );

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/search-terms/',
        expect.objectContaining({ signal: controller.signal }),
      );
    });

    it('rejects when the API fails', async () => {
      http.get.mockRejectedValue(new Error('Network Error'));

      await expect(
        WidgetConversationalService.getSearchTermsData(),
      ).rejects.toThrow('Network Error');
    });
  });

  describe('getAddedToCartData', () => {
    it('calls the added-to-cart endpoint with merged params and returns data', async () => {
      http.get.mockResolvedValue(mockResponse);

      const result = await WidgetConversationalService.getAddedToCartData({
        widget_uuid: 'w-2',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/added-to-cart/',
        expect.objectContaining({
          params: {
            project_uuid: mockProjectUuid,
            ...mockAppliedFilters,
            widget_uuid: 'w-2',
          },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('forwards the AbortSignal', async () => {
      http.get.mockResolvedValue(mockResponse);
      const controller = new AbortController();

      await WidgetConversationalService.getAddedToCartData(
        {},
        { signal: controller.signal },
      );

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/added-to-cart/',
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });
});
