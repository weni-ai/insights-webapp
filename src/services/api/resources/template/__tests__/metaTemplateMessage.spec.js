import { describe, it, expect, vi, beforeEach } from 'vitest';
import http from '@/services/api/http';
import metaTemplateMessage from '../metaTemplateMessage';
import { fullySanitize } from '@/utils/sanatize';
import { parseWhatsAppFormattingToHtml } from '@/utils/whatsapp';

vi.mock('@/services/api/http');
vi.mock('@/utils/sanatize');
vi.mock('@/utils/whatsapp');

describe('metaTemplateMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMetricsSource', () => {
    it('should return metrics source data', async () => {
      const mockResponse = { source: [{ id: 1, name: 'Test' }] };
      http.get.mockResolvedValueOnce(mockResponse);

      const result = await metaTemplateMessage.listMetricsSource('source');
      expect(http.get).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/source/',
      );
      expect(result).toEqual(mockResponse.source);
    });
  });

  describe('listWabasId', () => {
    it('should return wabas list', async () => {
      const mockResponse = { results: [{ id: 1, name: 'WABA' }] };
      http.get.mockResolvedValueOnce(mockResponse);

      const result = await metaTemplateMessage.listWabasId({
        project_uuid: '123',
      });
      expect(http.get).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/wabas/',
        {
          params: { project_uuid: '123' },
        },
      );
      expect(result).toEqual(mockResponse.results);
    });
  });

  describe('listTemplates', () => {
    it('should return templates list with pagination', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Template' }],
        paging: { cursors: { before: 'before', after: 'after' } },
      };
      http.get.mockResolvedValueOnce(mockResponse);

      const params = {
        limit: 10,
        after: 'after',
        before: 'before',
        search: 'test',
        category: 'category',
        language: 'en',
        project_uuid: '123',
        waba_id: '456',
        fields: ['name', 'id'],
      };

      const result = await metaTemplateMessage.listTemplates(params);
      expect(http.get).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/list-templates/',
        {
          params,
        },
      );
      expect(result).toEqual({
        previous: 'before',
        next: 'after',
        results: mockResponse.data,
      });
    });
  });

  describe('getTemplatePreview', () => {
    it('should return formatted template preview', async () => {
      const mockResponse = {
        components: [
          { type: 'HEADER', format: 'TEXT', text: 'Header Text' },
          {
            type: 'HEADER',
            format: 'IMAGE',
            example: { header_handle: ['image_url'] },
          },
          { type: 'BODY', text: 'Body Text' },
          { type: 'BUTTONS', buttons: [{ text: 'Button 1' }] },
        ],
        status: 'APPROVED',
        name: 'Template Name',
        is_favorite: true,
      };

      http.get.mockResolvedValueOnce(mockResponse);
      fullySanitize.mockImplementation((text) => text);
      parseWhatsAppFormattingToHtml.mockImplementation((text) => text);

      const result = await metaTemplateMessage.getTemplatePreview({
        waba_id: '123',
        project_uuid: '456',
        template_id: '789',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/preview/',
        {
          params: { waba_id: '123', project_uuid: '456', template_id: '789' },
        },
      );

      expect(result).toEqual({
        title: 'Header Text',
        image: 'image_url',
        text: 'Body Text',
        hint: '',
        status: 'APPROVED',
        name: 'Template Name',
        buttons: [{ text: 'Button 1' }],
        is_favorite: true,
      });
    });
  });

  describe('getTemplateMessagesAnalytics', () => {
    it('should return template messages analytics', async () => {
      const mockResponse = {
        data: {
          status_count: {
            sent: { value: 100 },
            delivered: { value: 90, percentage: 90 },
            read: { value: 80, percentage: 80 },
            clicked: { value: 70, percentage: 70 },
          },
          data_points: [{ date: '2024-01-01', count: 10 }],
        },
      };

      http.get.mockResolvedValueOnce(mockResponse);

      const result = await metaTemplateMessage.getTemplateMessagesAnalytics({
        waba_id: '123',
        project_uuid: '456',
        template_id: '789',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/messages-analytics/',
        {
          params: {
            waba_id: '123',
            project_uuid: '456',
            template_id: '789',
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
        },
      );

      expect(result).toEqual({
        status_count: {
          sent: { value: 100 },
          delivered: { value: 90, percentage: 90 },
          read: { value: 80, percentage: 80 },
          clicked: { value: 70, percentage: 70 },
        },
        data_points: [{ date: '2024-01-01', count: 10 }],
      });
    });
  });

  describe('getTemplateButtonsAnalytics', () => {
    it('should return template buttons analytics', async () => {
      const mockResponse = {
        data: [{ button_id: '1', clicks: 10 }],
      };

      http.get.mockResolvedValueOnce(mockResponse);

      const result = await metaTemplateMessage.getTemplateButtonsAnalytics({
        waba_id: '123',
        project_uuid: '456',
        template_id: '789',
        date_start: '2024-01-01',
        date_end: '2024-01-31',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/buttons-analytics/',
        {
          params: {
            waba_id: '123',
            project_uuid: '456',
            template_id: '789',
            date_start: '2024-01-01',
            date_end: '2024-01-31',
          },
        },
      );

      expect(result).toEqual([{ button_id: '1', clicks: 10 }]);
    });
  });

  describe('getFavoritesTemplates', () => {
    it('should return favorite templates', async () => {
      const mockResponse = {
        results: [
          { name: 'Template 1', template_id: '1' },
          { name: 'Template 2', template_id: '2' },
        ],
      };

      http.get.mockResolvedValueOnce(mockResponse);

      const result = await metaTemplateMessage.getFavoritesTemplates({
        dashboard: '123',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/favorites/',
        {
          params: {
            dashboard: '123',
            limit: 5,
            offset: 0,
          },
        },
      );

      expect(result).toEqual([
        { name: 'Template 1', id: '1' },
        { name: 'Template 2', id: '2' },
      ]);
    });
  });

  describe('favoriteTemplate', () => {
    it('should add template to favorites', async () => {
      const mockResponse = { success: true };
      http.post.mockResolvedValueOnce(mockResponse);

      const result = await metaTemplateMessage.favoriteTemplate({
        templateUuid: '123',
        dashboardUuid: '456',
      });

      expect(http.post).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/add-template-to-favorites/',
        { dashboard: '456', template_id: '123' },
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('unfavoriteTemplate', () => {
    it('should remove template from favorites', async () => {
      const mockResponse = { success: true };
      http.post.mockResolvedValueOnce(mockResponse);

      const result = await metaTemplateMessage.unfavoriteTemplate({
        templateUuid: '123',
        dashboardUuid: '456',
      });

      expect(http.post).toHaveBeenCalledWith(
        '/metrics/meta/whatsapp-message-templates/remove-template-from-favorites/',
        { dashboard: '456', template_id: '123' },
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
