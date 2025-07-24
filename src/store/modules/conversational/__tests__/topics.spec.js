import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConversationalTopics } from '../topics';
import topicsService from '@/services/api/resources/conversational/topics';

vi.mock('@/services/api/resources/conversational/topics', () => ({
  default: {
    getConversationalFormTopics: vi.fn(),
    createTopic: vi.fn(),
    createSubTopic: vi.fn(),
    deleteTopic: vi.fn(),
    deleteSubTopic: vi.fn(),
  },
}));

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

describe('useConversationalTopics store', () => {
  let store;

  const mockTopics = [
    {
      uuid: '1',
      name: 'Topic 1',
      context: 'Context 1',
      isNew: false,
      subTopics: [],
    },
    {
      uuid: '2',
      name: 'Topic 2',
      context: 'Context 2',
      isNew: true,
      subTopics: [],
    },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversationalTopics();
    store.topics = JSON.parse(JSON.stringify(mockTopics));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Getters', () => {
    it('should return correct topicsCount', () => {
      expect(store.topicsCount).toBe(2);
    });

    it('should return correct hasNewTopics', () => {
      expect(store.hasNewTopics).toBe(true);
      store.topics = mockTopics.filter((t) => !t.isNew);
      expect(store.hasNewTopics).toBe(false);
    });

    it('should return correct hasExistingTopics', () => {
      expect(store.hasExistingTopics).toBe(true);
      store.topics = mockTopics.filter((t) => t.isNew);
      expect(store.hasExistingTopics).toBe(false);
    });

    it('should return correct topic by id', () => {
      expect(store.getTopicById('1')).toEqual(store.topics[0]);
      expect(store.getTopicById('nonexistent')).toBeUndefined();
    });

    it('should return correct sub-topics count', () => {
      store.topics[0].subTopics = [{ name: 'Sub 1', context: 'sub context' }];
      expect(store.getSubTopicsCount(0)).toBe(1);
      expect(store.getSubTopicsCount(1)).toBe(0);
    });
  });

  describe('Topic management actions', () => {
    it('should remove main topic by index', async () => {
      await store.removeTopicOrSubtopic(0);
      expect(topicsService.deleteTopic).toHaveBeenCalledWith('1');
      expect(store.topics).toHaveLength(1);
    });

    it('should remove new main topic by index', async () => {
      await store.removeTopicOrSubtopic(1);
      expect(topicsService.deleteTopic).not.toHaveBeenCalled();
      expect(store.topics).toHaveLength(1);
    });

    it('should remove sub-topic by index', async () => {
      store.topics[0].subTopics = [
        {
          uuid: '1-1',
          name: 'Sub 1',
          context: 'sub context',
          isNew: false,
        },
      ];
      await store.removeTopicOrSubtopic(0, 0);
      expect(topicsService.deleteSubTopic).toHaveBeenCalledWith('1-1', '1-1');
      expect(store.topics[0].subTopics).toHaveLength(0);
    });

    it('should remove new sub-topic by index', async () => {
      store.topics[0].subTopics = [
        {
          uuid: '1-1',
          name: 'Sub 1',
          context: 'sub context',
          isNew: true,
        },
      ];
      await store.removeTopicOrSubtopic(0, 0);
      expect(topicsService.deleteSubTopic).not.toHaveBeenCalled();
      expect(store.topics[0].subTopics).toHaveLength(0);
    });
  });

  describe('Async actions', () => {
    it('should load topics and set loading state', async () => {
      topicsService.getConversationalFormTopics.mockResolvedValue([]);
      const promise = store.loadFormTopics();
      expect(store.isLoadingTopics).toBe(true);
      await promise;
      expect(store.isLoadingTopics).toBe(false);
      expect(topicsService.getConversationalFormTopics).toHaveBeenCalled();
    });

    it('should save all new topics and subtopics', async () => {
      topicsService.createTopic.mockResolvedValue({
        uuid: 'new-uuid',
        name: 'Topic 2',
        description: 'Context 2',
      });
      const promise = store.saveAllNewTopics();
      expect(store.isSavingTopics).toBe(true);
      const result = await promise;
      expect(store.isSavingTopics).toBe(false);
      expect(result).toBe(true);
      expect(topicsService.createTopic).toHaveBeenCalledWith({
        name: 'Topic 2',
        description: 'Context 2',
      });
    });
  });
});
