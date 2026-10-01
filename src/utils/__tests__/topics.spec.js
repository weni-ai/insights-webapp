import { describe, it, expect, vi } from 'vitest';
import { checkIsEmptyValuesAndNewTopics, defaultAlert } from '../topics';
import { UnnnicCallAlert } from '@weni/unnnic-system';

vi.mock('@weni/unnnic-system', () => ({
  UnnnicCallAlert: vi.fn(),
}));

describe('topics utils', () => {
  describe('checkIsEmptyValuesAndNewTopics', () => {
    it('should return true for new topic with non-empty name', () => {
      const topic = {
        name: 'Test Topic',
        context: '',
        isNew: true,
      };

      expect(checkIsEmptyValuesAndNewTopics(topic)).toBe(true);
    });

    it('should return true for new topic with non-empty context', () => {
      const topic = {
        name: '',
        context: 'Test Context',
        isNew: true,
      };

      expect(checkIsEmptyValuesAndNewTopics(topic)).toBe(true);
    });

    it('should return true for new topic with both name and context', () => {
      const topic = {
        name: 'Test Topic',
        context: 'Test Context',
        isNew: true,
      };

      expect(checkIsEmptyValuesAndNewTopics(topic)).toBe(true);
    });

    it('should return false for new topic with empty name and context', () => {
      const topic = {
        name: '',
        context: '',
        isNew: true,
      };

      expect(checkIsEmptyValuesAndNewTopics(topic)).toBe(false);
    });

    it('should return false for new topic with whitespace-only name and context', () => {
      const topic = {
        name: '   ',
        context: '   ',
        isNew: true,
      };

      expect(checkIsEmptyValuesAndNewTopics(topic)).toBe(false);
    });

    it('should return false for existing topic regardless of content', () => {
      const topic = {
        name: 'Test Topic',
        context: 'Test Context',
        isNew: false,
      };

      expect(checkIsEmptyValuesAndNewTopics(topic)).toBe(false);
    });

    it('should return false for topic without isNew flag', () => {
      const topic = {
        name: 'Test Topic',
        context: 'Test Context',
      };

      expect(checkIsEmptyValuesAndNewTopics(topic)).toBe(false);
    });

    it('should handle mixed whitespace correctly', () => {
      const topic = {
        name: '  Test  ',
        context: '',
        isNew: true,
      };

      expect(checkIsEmptyValuesAndNewTopics(topic)).toBe(true);
    });
  });

  describe('defaultAlert', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call unnnic alert with correct parameters', () => {
      defaultAlert('success', 'Test message', 10);

      expect(UnnnicCallAlert).toHaveBeenCalledWith({
        props: {
          text: 'Test message',
          type: 'success',
        },
        seconds: 10,
      });
    });

    it('should use default seconds when not provided', () => {
      defaultAlert('error', 'Error message');

      expect(UnnnicCallAlert).toHaveBeenCalledWith({
        props: {
          text: 'Error message',
          type: 'error',
        },
        seconds: 5,
      });
    });

    it('should handle different alert types', () => {
      defaultAlert('error', 'Error message', 3);

      expect(UnnnicCallAlert).toHaveBeenCalledWith({
        props: {
          text: 'Error message',
          type: 'error',
        },
        seconds: 3,
      });
    });

    it('should handle empty text', () => {
      defaultAlert('success', '', 2);

      expect(UnnnicCallAlert).toHaveBeenCalledWith({
        props: {
          text: '',
          type: 'success',
        },
        seconds: 2,
      });
    });
  });
});
