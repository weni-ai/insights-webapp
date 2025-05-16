import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collection, addDoc } from 'firebase/firestore';

import AIService from '../GPT';
import http from '@/services/api/http';

vi.mock('@/services/api/http', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: () => ({ project: { uuid: 'mock-project-uuid' } }),
}));

vi.mock('@/utils/plugins/Firebase.js', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  addDoc: vi.fn(),
}));

describe('GPT Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInsights', () => {
    it('should call http.post with the correct URL and payload', async () => {
      const mockResponse = { data: 'mock-data' };

      http.post.mockResolvedValueOnce(mockResponse);

      const prompt = 'Test prompt';
      const response = await AIService.getInsights(prompt);

      expect(http.post).toHaveBeenCalledWith(
        '/projects/mock-project-uuid/sources/chat_completion/search/',
        { prompt },
      );

      expect(response).toEqual(mockResponse);
    });

    it('should propagate errors from the API', async () => {
      const mockError = new Error('API Error');
      http.post.mockRejectedValueOnce(mockError);

      await expect(AIService.getInsights('Test prompt')).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('createReview', () => {
    it('should call addDoc with the correct data', async () => {
      const mockDocRef = { id: 'mock-doc-id' };
      addDoc.mockResolvedValueOnce(mockDocRef);

      const review = {
        user: 'test-user',
        helpful: true,
        comment: 'This is a test comment',
      };

      const response = await AIService.createReview(review);

      expect(collection).toHaveBeenCalledWith({}, 'AI Reviews');

      expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
        ...review,
        timestamp: expect.any(Date),
      });

      expect(response).toEqual(mockDocRef);
    });

    it('should log an error if addDoc fails', async () => {
      const mockError = new Error('Firestore Error');
      addDoc.mockRejectedValueOnce(mockError);

      console.error = vi.fn();

      const review = {
        user: 'test-user',
        helpful: false,
        comment: 'This is a test comment',
      };

      await AIService.createReview(review);

      expect(console.error).toHaveBeenCalledWith(
        'Error writing AI Reviews document: ',
        mockError,
      );
    });
  });
});
