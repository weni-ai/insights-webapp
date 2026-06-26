import { beforeEach, describe, expect, it, vi } from 'vitest';

import humanSupportExport from '../export';
import chatsHttp from '@/services/api/chatsHttp';
import { useConfig } from '@/store/modules/config';

vi.mock('@/services/api/chatsHttp', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

describe('humanSupport export API', () => {
  const mockModelFields = {
    rooms: {
      contact_name: { type: 'string' },
      duration: { type: 'number' },
    },
    users: {
      email: { type: 'string' },
    },
  };

  const mockExportResponse = {
    status: 'processing',
    email: 'user@example.com',
    uuid_relatorio: 'report-uuid-456',
  };

  const mockExportPayload = {
    start_date: '2026-01-01',
    end_date: '2026-01-31',
    open_chats: true,
    closed_chats: true,
    type: '.csv',
    sectors: { uuids: ['sector-1'], fields: ['name'] },
    queues: { uuids: [], fields: [] },
    rooms: { uuids: [], fields: ['contact_name'] },
    users: { uuids: [], fields: [] },
    sector_tags: { uuids: [], fields: [] },
    contacts: { uuids: [], fields: [] },
    agent_status_logs: { uuids: [], fields: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useConfig.mockReturnValue({ project: { uuid: 'test-project-uuid' } });
    chatsHttp.get.mockResolvedValue(mockModelFields);
    chatsHttp.post.mockResolvedValue(mockExportResponse);
  });

  describe('getModelFields', () => {
    it('calls model fields endpoint with project uuid', async () => {
      const result = await humanSupportExport.getModelFields();

      expect(chatsHttp.get).toHaveBeenCalledWith('/model-fields/', {
        params: { project_uuid: 'test-project-uuid' },
      });
      expect(result).toEqual(mockModelFields);
    });

    it('propagates API errors', async () => {
      chatsHttp.get.mockRejectedValue(new Error('Request failed'));

      await expect(humanSupportExport.getModelFields()).rejects.toThrow(
        'Request failed',
      );
    });
  });

  describe('checkExportStatus', () => {
    beforeEach(() => {
      chatsHttp.get.mockResolvedValue(mockExportResponse);
    });

    it('calls chats report endpoint with project uuid', async () => {
      const result = await humanSupportExport.checkExportStatus();

      expect(chatsHttp.get).toHaveBeenCalledWith('/chats/report/', {
        params: { project_uuid: 'test-project-uuid' },
      });
      expect(result).toEqual(mockExportResponse);
    });

    it('propagates API errors', async () => {
      chatsHttp.get.mockRejectedValue(new Error('Request failed'));

      await expect(humanSupportExport.checkExportStatus()).rejects.toThrow(
        'Request failed',
      );
    });
  });

  describe('createExport', () => {
    it('posts export data with project uuid', async () => {
      const result = await humanSupportExport.createExport(mockExportPayload);

      expect(chatsHttp.post).toHaveBeenCalledWith('/chats/report/', {
        ...mockExportPayload,
        project_uuid: 'test-project-uuid',
      });
      expect(result).toEqual(mockExportResponse);
    });

    it('propagates API errors', async () => {
      chatsHttp.post.mockRejectedValue(new Error('Request failed'));

      await expect(
        humanSupportExport.createExport(mockExportPayload),
      ).rejects.toThrow('Request failed');
    });
  });
});
