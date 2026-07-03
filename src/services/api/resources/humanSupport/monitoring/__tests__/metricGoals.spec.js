import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import metricGoalsService from '../metricGoals';
import chatsHttp from '@/services/api/chatsHttp';
import { useConfig } from '@/store/modules/config';

vi.mock('@/services/api/chatsHttp', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

describe('metricGoalsService', () => {
  const mockProjectUuid = 'test-project-uuid';
  const mockApiError = new Error('Network Error');

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    useConfig.mockReturnValue({ project: { uuid: mockProjectUuid } });
  });

  describe('getMetricGoals', () => {
    it('should fetch and normalize goals from the API response', async () => {
      const apiGoals = [
        {
          metric: 'waiting_time',
          threshold_seconds: 600,
          threshold_value: 10,
          unit: 'm',
          is_active: true,
          email_enabled: true,
          recipients: [
            {
              uuid: 'user-1',
              first_name: 'Marcus',
              last_name: 'L S',
              email: 'marcus@example.com',
            },
          ],
          rooms_threshold_count: 5,
          rooms_threshold_percent: null,
        },
      ];
      chatsHttp.get.mockResolvedValue({ goals: apiGoals });

      const result = await metricGoalsService.getMetricGoals();

      expect(chatsHttp.get).toHaveBeenCalledWith(
        `project/${mockProjectUuid}/metric-goals/`,
      );
      expect(result).toEqual({
        goals: [
          {
            metric: 'waiting_time',
            thresholdSeconds: 600,
            thresholdValue: 10,
            unit: 'm',
            isActive: true,
            emailEnabled: true,
            recipients: ['user-1'],
            recipientDetails: [
              {
                uuid: 'user-1',
                firstName: 'Marcus',
                lastName: 'L S',
                email: 'marcus@example.com',
              },
            ],
            roomsThresholdCount: 5,
          },
        ],
      });
    });

    it('should normalize recipients from uuid_project_permission objects', async () => {
      chatsHttp.get.mockResolvedValue({
        goals: [
          {
            metric: 'waiting_time',
            threshold_seconds: 3600,
            threshold_value: 1,
            unit: 'h',
            is_active: true,
            email_enabled: true,
            recipients: [{ uuid_project_permission: 'perm-1' }],
            rooms_threshold_count: 2,
          },
        ],
      });

      const result = await metricGoalsService.getMetricGoals();

      expect(result.goals[0]).toEqual({
        metric: 'waiting_time',
        thresholdSeconds: 3600,
        thresholdValue: 1,
        unit: 'h',
        isActive: true,
        emailEnabled: true,
        recipients: ['perm-1'],
        recipientDetails: [{ uuid: 'perm-1' }],
        roomsThresholdCount: 2,
      });
    });

    it('should default goals to an empty array when missing', async () => {
      chatsHttp.get.mockResolvedValue({});
      const result = await metricGoalsService.getMetricGoals();
      expect(result).toEqual({ goals: [] });
    });

    it('should propagate API errors', async () => {
      chatsHttp.get.mockRejectedValue(mockApiError);
      await expect(metricGoalsService.getMetricGoals()).rejects.toThrow(
        'Network Error',
      );
    });
  });

  describe('saveMetricGoal', () => {
    it('should POST the payload to the metric endpoint', async () => {
      const params = {
        threshold: 10,
        unit: 'm',
        isActive: true,
        emailEnabled: true,
        recipients: ['perm-1'],
        roomsThresholdCount: 5,
      };
      const mockResponse = {
        metric: 'first_response_time',
        threshold_seconds: 600,
        threshold_value: 10,
        unit: 'm',
        is_active: true,
        email_enabled: true,
        recipients: [
          {
            uuid: 'perm-1',
            first_name: 'Alan',
            last_name: 'Vale',
            email: 'alan@example.com',
          },
        ],
        rooms_threshold_count: 5,
      };
      chatsHttp.post.mockResolvedValue(mockResponse);

      const result = await metricGoalsService.saveMetricGoal(
        'first_response_time',
        params,
      );

      expect(chatsHttp.post).toHaveBeenCalledWith(
        `project/${mockProjectUuid}/metric-goals/first_response_time/`,
        {
          threshold: 10,
          unit: 'm',
          is_active: true,
          email_enabled: true,
          recipients: [{ uuid_project_permission: 'perm-1' }],
          rooms_threshold_count: 5,
        },
      );
      expect(result).toEqual({
        metric: 'first_response_time',
        thresholdSeconds: 600,
        thresholdValue: 10,
        unit: 'm',
        isActive: true,
        emailEnabled: true,
        recipients: ['perm-1'],
        recipientDetails: [
          {
            uuid: 'perm-1',
            firstName: 'Alan',
            lastName: 'Vale',
            email: 'alan@example.com',
          },
        ],
        roomsThresholdCount: 5,
      });
    });

    it('should propagate API errors', async () => {
      chatsHttp.post.mockRejectedValue(mockApiError);
      await expect(
        metricGoalsService.saveMetricGoal('waiting_time', {
          threshold: 1,
          unit: 'm',
          isActive: true,
          emailEnabled: false,
          recipients: [],
          roomsThresholdCount: 0,
        }),
      ).rejects.toThrow('Network Error');
    });
  });

  describe('deleteMetricGoal', () => {
    it('should DELETE the metric endpoint', async () => {
      chatsHttp.delete.mockResolvedValue(undefined);

      await metricGoalsService.deleteMetricGoal('conversation_duration');

      expect(chatsHttp.delete).toHaveBeenCalledWith(
        `project/${mockProjectUuid}/metric-goals/conversation_duration/`,
      );
    });

    it('should propagate API errors', async () => {
      chatsHttp.delete.mockRejectedValue(mockApiError);
      await expect(
        metricGoalsService.deleteMetricGoal('waiting_time'),
      ).rejects.toThrow('Network Error');
    });
  });
});
