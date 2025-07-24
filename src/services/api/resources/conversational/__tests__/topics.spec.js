import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import topicsService from '../topics';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useConversational } from '@/store/modules/conversational/conversational';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
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

describe('topicsService', () => {
  const mockProjectUuid = 'test-project-uuid';
  const mockAppliedFilters = { 'some-filter': 'some-value' };
  const mockApiError = new Error('Network Error');

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    useConfig.mockReturnValue({ project: { uuid: mockProjectUuid } });
    useConversational.mockReturnValue({ appliedFilters: mockAppliedFilters });
  });

  describe('getConversationalTopicsDistribution', () => {
    const mockApiResponse = {
      topics: [
        {
          uuid: '1',
          name: 'Topic 1',
          quantity: 100,
          percentage: 50,
          subtopics: [
            { uuid: '1-1', name: 'Subtopic 1', quantity: 50, percentage: 25 },
          ],
        },
      ],
    };

    it('should fetch and format topics distribution successfully', async () => {
      const queryParams = { start_date: '2023-01-01' };
      http.get.mockResolvedValue(mockApiResponse);

      const result = await topicsService.getConversationalTopicsDistribution(
        'AI',
        queryParams,
      );

      const expectedParams = {
        type: 'AI',
        project_uuid: mockProjectUuid,
        ...mockAppliedFilters,
        ...queryParams,
      };
      expect(http.get).toHaveBeenCalledWith(
        '/metrics/conversations/topics-distribution/',
        { params: expectedParams },
      );

      expect(result.topics).toHaveLength(1);
      expect(result.topics[0].label).toBe('Topic 1');
      expect(result.topics[0].subtopics).toHaveLength(1);
      expect(result.topics[0].subtopics[0].label).toBe('Subtopic 1');
    });

    it('should handle API errors', async () => {
      http.get.mockRejectedValue(mockApiError);
      await expect(
        topicsService.getConversationalTopicsDistribution('AI'),
      ).rejects.toThrow('Network Error');
    });
  });

  describe('getConversationalFormTopics', () => {
    const mockApiResponse = [{ uuid: '1', name: 'Topic 1' }];

    it('should fetch form topics successfully', async () => {
      http.get.mockResolvedValue(mockApiResponse);
      const result = await topicsService.getConversationalFormTopics();
      expect(http.get).toHaveBeenCalledWith('/metrics/conversations/topics/', {
        params: { project_uuid: mockProjectUuid },
      });
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle API errors', async () => {
      http.get.mockRejectedValue(mockApiError);
      await expect(topicsService.getConversationalFormTopics()).rejects.toThrow(
        'Network Error',
      );
    });
  });

  describe('createTopic', () => {
    const topicData = { name: 'New Topic', description: 'A description' };

    it('should create a topic successfully', async () => {
      const mockResponse = { ...topicData, uuid: 'new-uuid' };
      http.post.mockResolvedValue(mockResponse);
      const result = await topicsService.createTopic(topicData);
      expect(http.post).toHaveBeenCalledWith('/metrics/conversations/topics/', {
        ...topicData,
        project_uuid: mockProjectUuid,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      http.post.mockRejectedValue(mockApiError);
      await expect(topicsService.createTopic(topicData)).rejects.toThrow(
        'Network Error',
      );
    });
  });

  describe('createSubTopic', () => {
    const topicUuid = 'parent-uuid';
    const subtopicData = { name: 'New Subtopic', description: 'A sub-desc' };

    it('should create a subtopic successfully', async () => {
      const mockResponse = { ...subtopicData, uuid: 'new-sub-uuid' };
      http.post.mockResolvedValue(mockResponse);
      const result = await topicsService.createSubTopic(
        topicUuid,
        subtopicData,
      );
      expect(http.post).toHaveBeenCalledWith(
        `/metrics/conversations/topics/${topicUuid}/subtopics/`,
        { ...subtopicData, project_uuid: mockProjectUuid },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      http.post.mockRejectedValue(mockApiError);
      await expect(
        topicsService.createSubTopic(topicUuid, subtopicData),
      ).rejects.toThrow('Network Error');
    });
  });

  describe('deleteTopic', () => {
    const topicUuid = 'topic-to-delete';

    it('should delete a topic successfully', async () => {
      http.delete.mockResolvedValue(undefined);
      await topicsService.deleteTopic(topicUuid);
      expect(http.delete).toHaveBeenCalledWith(
        `/metrics/conversations/topics/${topicUuid}/`,
      );
    });

    it('should handle API errors', async () => {
      http.delete.mockRejectedValue(mockApiError);
      await expect(topicsService.deleteTopic(topicUuid)).rejects.toThrow(
        'Network Error',
      );
    });
  });

  describe('deleteSubTopic', () => {
    const topicUuid = 'parent-uuid';
    const subtopicUuid = 'subtopic-to-delete';

    it('should delete a subtopic successfully', async () => {
      http.delete.mockResolvedValue(undefined);
      await topicsService.deleteSubTopic(topicUuid, subtopicUuid);
      expect(http.delete).toHaveBeenCalledWith(
        `/metrics/conversations/topics/${topicUuid}/subtopics/${subtopicUuid}/`,
      );
    });

    it('should handle API errors', async () => {
      http.delete.mockRejectedValue(mockApiError);
      await expect(
        topicsService.deleteSubTopic(topicUuid, subtopicUuid),
      ).rejects.toThrow('Network Error');
    });
  });
});
