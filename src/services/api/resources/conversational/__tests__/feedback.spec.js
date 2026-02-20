import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import feedbackService from '../feedback';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: vi.fn(),
}));

const PROJECT_UUID = 'project-uuid-123';
const DASHBOARD_UUID = 'dashboard-uuid-456';

describe('feedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    useConfig.mockReturnValue({ project: { uuid: PROJECT_UUID } });
    useDashboards.mockReturnValue({
      currentDashboard: { uuid: DASHBOARD_UUID },
    });
  });

  describe('checkSurvey', () => {
    it('should call GET with correct params and return response', async () => {
      const mockResponse = {
        uuid: 'survey-1',
        is_active: true,
        user_answered: false,
      };
      http.get.mockResolvedValue(mockResponse);

      const result = await feedbackService.checkSurvey();

      expect(http.get).toHaveBeenCalledWith('/feedback/check-survey/', {
        params: {
          project_uuid: PROJECT_UUID,
          dashboard: DASHBOARD_UUID,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should reject when API fails', async () => {
      http.get.mockRejectedValue(new Error('Network Error'));

      await expect(feedbackService.checkSurvey()).rejects.toThrow(
        'Network Error',
      );
    });
  });

  describe('submitFeedback', () => {
    const payload = {
      type: 'CONVERSATIONAL',
      dashboard: DASHBOARD_UUID,
      survey: 'survey-1',
      answers: [
        { reference: 'TRUST', answer: '5', type: 'SCORE_1_5' },
        { reference: 'COMMENT', answer: 'Great', type: 'TEXT' },
      ],
    };

    it('should call POST with payload and return response', async () => {
      const mockResponse = { uuid: 'feedback-1', ...payload };
      http.post.mockResolvedValue(mockResponse);

      const result = await feedbackService.submitFeedback(payload);

      expect(http.post).toHaveBeenCalledWith('/feedback/', payload);
      expect(result).toEqual(mockResponse);
    });

    it('should reject when API fails', async () => {
      http.post.mockRejectedValue(new Error('Server Error'));

      await expect(feedbackService.submitFeedback(payload)).rejects.toThrow(
        'Server Error',
      );
    });
  });
});
