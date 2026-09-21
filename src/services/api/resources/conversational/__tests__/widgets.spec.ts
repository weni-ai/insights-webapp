import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import WidgetConversationalService from '../widgets';
import http from '@/services/api/http';
import http2 from '@/services/api/http2';
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

  describe('getCsatData', () => {
    it('returns mock data when options.mock is true', async () => {
      const result = await WidgetConversationalService.getCsatData(
        'AI',
        {},
        {
          mock: true,
        },
      );

      expect(http.get).not.toHaveBeenCalled();
      expect(result.results).toBeDefined();
    });

    it('calls csat endpoint with type and merged params', async () => {
      http.get.mockResolvedValue({ results: [] });

      await WidgetConversationalService.getCsatData('HUMAN', {
        widget_uuid: 'csat-1',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/csat/',
        expect.objectContaining({
          params: expect.objectContaining({
            type: 'HUMAN',
            project_uuid: mockProjectUuid,
            widget_uuid: 'csat-1',
          }),
        }),
      );
    });
  });

  describe('getNpsData', () => {
    it('returns mock data when options.mock is true', async () => {
      const result = await WidgetConversationalService.getNpsData(
        'AI',
        {},
        {
          mock: true,
        },
      );

      expect(http2.get).not.toHaveBeenCalled();
      expect(result.score).toBeDefined();
    });

    it('calls nps endpoint via http2', async () => {
      http2.get.mockResolvedValue({
        score: 40,
        total_responses: 10,
        promoters: { value: 5, full_value: 5 },
        passives: { value: 3, full_value: 3 },
        detractors: { value: 2, full_value: 2 },
      });

      await WidgetConversationalService.getNpsData('AI');

      expect(http2.get).toHaveBeenCalledWith(
        '/metrics/conversations/nps/',
        expect.objectContaining({
          params: expect.objectContaining({
            type: 'AI',
            project_uuid: mockProjectUuid,
          }),
        }),
      );
    });
  });

  describe('getCustomWidgetData', () => {
    it('calls custom endpoint with project and filters', async () => {
      http.get.mockResolvedValue({ results: [] });

      await WidgetConversationalService.getCustomWidgetData({
        widget_uuid: 'custom-1',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/custom/',
        expect.objectContaining({
          params: expect.objectContaining({
            project_uuid: mockProjectUuid,
            widget_uuid: 'custom-1',
          }),
        }),
      );
    });
  });

  describe('getCrosstabWidgetData', () => {
    it('sorts results by total descending', async () => {
      http.get.mockResolvedValue({
        total_rows: 2,
        results: [
          { title: 'B', total: 1, events: {} },
          { title: 'A', total: 10, events: {} },
        ],
      });

      const result = await WidgetConversationalService.getCrosstabWidgetData({
        widget_uuid: 'cx-1',
      });

      expect(result.results.map((item) => item.title)).toEqual(['A', 'B']);
    });

    it('returns empty results when response.results is missing', async () => {
      http.get.mockResolvedValue({ total_rows: 0 });

      const result = await WidgetConversationalService.getCrosstabWidgetData({
        widget_uuid: 'cx-1',
      });

      expect(result.results).toEqual([]);
    });
  });

  describe('getSalesFunnelData', () => {
    it('returns mock data when options.mock is true', async () => {
      const result = await WidgetConversationalService.getSalesFunnelData(
        {},
        { mock: true },
      );

      expect(http.get).not.toHaveBeenCalled();
      expect(result.captured_leads).toBeDefined();
    });

    it('calls sales funnel endpoint', async () => {
      http.get.mockResolvedValue({
        captured_leads: { value: 1, full_value: 1 },
        purchases_made: { value: 1, full_value: 1 },
        total_orders: 1,
        total_value: 10,
        average_ticket: 10,
        currency: 'BRL',
      });

      await WidgetConversationalService.getSalesFunnelData();

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/sales_funnel/',
        expect.objectContaining({
          params: expect.objectContaining({
            project_uuid: mockProjectUuid,
          }),
        }),
      );
    });
  });

  describe('getAvailableWidgets', () => {
    it('calls available widgets endpoint with optional type', async () => {
      http.get.mockResolvedValue({ available_widgets: ['SALES_FUNNEL'] });

      await WidgetConversationalService.getAvailableWidgets({ type: 'NATIVE' });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/available-widgets/',
        {
          params: {
            project_uuid: mockProjectUuid,
            type: 'NATIVE',
          },
        },
      );
    });

    it('omits type when not provided', async () => {
      http.get.mockResolvedValue({ available_widgets: [] });

      await WidgetConversationalService.getAvailableWidgets({});

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/available-widgets/',
        {
          params: {
            project_uuid: mockProjectUuid,
          },
        },
      );
    });
  });

  describe('getAbsoluteNumbersChildren', () => {
    it('calls children endpoint for widget uuid', async () => {
      http.get.mockResolvedValue({ next: null, previous: null, results: [] });

      await WidgetConversationalService.getAbsoluteNumbersChildren('abs-1');

      expect(http.get).toHaveBeenCalledWith('/widgets/abs-1/children/');
    });
  });

  describe('getAbsoluteNumbersChildrenValue', () => {
    it('calls absolute numbers metrics endpoint', async () => {
      http.get.mockResolvedValue({ value: 42 });

      const result =
        await WidgetConversationalService.getAbsoluteNumbersChildrenValue(
          'abs-1',
        );

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/absolute-numbers/',
        expect.objectContaining({
          params: expect.objectContaining({
            widget_uuid: 'abs-1',
            ...mockAppliedFilters,
          }),
        }),
      );
      expect(result).toEqual({ value: 42 });
    });
  });

  describe('getAgentInvocationData and getToolResultData', () => {
    it('calls agent-invocation endpoint', async () => {
      http.get.mockResolvedValue({ total: 0, results: [] });

      await WidgetConversationalService.getAgentInvocationData();

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/agent-invocation/',
        expect.objectContaining({
          params: expect.objectContaining({
            project_uuid: mockProjectUuid,
          }),
        }),
      );
    });

    it('calls tool-result endpoint', async () => {
      http.get.mockResolvedValue({ total: 0, results: [] });

      await WidgetConversationalService.getToolResultData();

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/tool-result/',
        expect.objectContaining({
          params: expect.objectContaining({
            project_uuid: mockProjectUuid,
          }),
        }),
      );
    });
  });

  describe('getAbandonedCartRecoveryData', () => {
    it('calls skills endpoint with abandoned_cart skill', async () => {
      http.get.mockResolvedValue([]);

      await WidgetConversationalService.getAbandonedCartRecoveryData();

      expect(http.get).toHaveBeenCalledWith('/metrics/skills/', {
        params: {
          skill: 'abandoned_cart',
          project_uuid: mockProjectUuid,
        },
      });
    });
  });
});
