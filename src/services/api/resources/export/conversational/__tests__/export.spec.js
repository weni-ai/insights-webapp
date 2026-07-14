import { beforeEach, describe, expect, it, vi } from 'vitest';

import conversationalExport from '../export';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

describe('conversational export API', () => {
  const mockExportResponse = {
    status: 'processing',
    email: 'user@example.com',
    report_uuid: 'report-uuid-123',
  };

  const mockAvailableWidgetsResponse = {
    sections: ['RESOLUTIONS', 'CONTACTS'],
    custom_widgets: ['widget-uuid-1'],
    crosstab_widgets: ['widget-uuid-2'],
  };

  const mockExportPayload = {
    start_date: '2026-01-01',
    end_date: '2026-01-31',
    type: 'CSV',
    sections: ['RESOLUTIONS', 'CONTACTS'],
    custom_widgets: ['widget-uuid-1'],
    crosstab_widgets: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useConfig.mockReturnValue({ project: { uuid: 'test-project-uuid' } });
    http.get.mockResolvedValue(mockExportResponse);
    http.post.mockResolvedValue(mockExportResponse);
  });

  describe('checkExportStatus', () => {
    it('calls report endpoint with project uuid', async () => {
      const result = await conversationalExport.checkExportStatus();

      expect(http.get).toHaveBeenCalledWith('/metrics/conversations/report/', {
        params: { project_uuid: 'test-project-uuid' },
      });
      expect(result).toEqual(mockExportResponse);
    });

    it('propagates API errors', async () => {
      http.get.mockRejectedValue(new Error('Request failed'));

      await expect(conversationalExport.checkExportStatus()).rejects.toThrow(
        'Request failed',
      );
    });
  });

  describe('createExport', () => {
    it('posts export data with project uuid', async () => {
      const result = await conversationalExport.createExport(mockExportPayload);

      expect(http.post).toHaveBeenCalledWith('/metrics/conversations/report/', {
        ...mockExportPayload,
        project_uuid: 'test-project-uuid',
      });
      expect(result).toEqual(mockExportResponse);
    });

    it('propagates API errors', async () => {
      http.post.mockRejectedValue(new Error('Request failed'));

      await expect(
        conversationalExport.createExport(mockExportPayload),
      ).rejects.toThrow('Request failed');
    });
  });

  describe('getAvailableWidgets', () => {
    beforeEach(() => {
      http.get.mockResolvedValue(mockAvailableWidgetsResponse);
    });

    it('calls available widgets endpoint with project uuid', async () => {
      const result = await conversationalExport.getAvailableWidgets();

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/report/available-widgets/',
        {
          params: { project_uuid: 'test-project-uuid' },
        },
      );
      expect(result).toEqual(mockAvailableWidgetsResponse);
    });

    it('propagates API errors', async () => {
      http.get.mockRejectedValue(new Error('Request failed'));

      await expect(conversationalExport.getAvailableWidgets()).rejects.toThrow(
        'Request failed',
      );
    });
  });
});
