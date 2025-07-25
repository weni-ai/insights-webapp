import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConversationalTopics } from '../topics';
import topicsService from '@/services/api/resources/conversational/topics';
import unnnic from '@weni/unnnic-system';

vi.mock('@/services/api/resources/conversational/topics');
vi.mock('@weni/unnnic-system');
vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => key),
    },
  },
}));

describe('useConversationalTopics store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversationalTopics();
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      expect(store.topics).toEqual([]);
      expect(store.topicsDistribution).toEqual([]);
      expect(store.topicType).toBe('AI');
      expect(store.isAddTopicsDrawerOpen).toBe(false);
      expect(store.isLoadingTopics).toBe(false);
      expect(store.isLoadingTopicsDistribution).toBe(false);
      expect(store.isSavingTopics).toBe(false);
      expect(store.isOpenModal).toBe(false);
      expect(store.modalType).toBe('');
      expect(store.selectedTopicForDeletion).toBeNull();
    });
  });

  describe('Getters', () => {
    const mockTopics = [
      {
        uuid: '1',
        name: 'Topic 1',
        context: 'Context 1',
        isNew: true,
        subTopics: [],
      },
      {
        uuid: '2',
        name: 'Topic 2',
        context: 'Context 2',
        isNew: false,
        subTopics: [
          {
            uuid: '2-1',
            name: 'Sub Topic',
            context: 'Sub Context',
            isNew: true,
            subTopics: [],
          },
        ],
      },
    ];

    const mockTopicsDistribution = [
      { topic: 'Support', count: 10 },
      { topic: 'Sales', count: 5 },
    ];

    beforeEach(() => {
      store.topics = mockTopics;
      store.topicsDistribution = mockTopicsDistribution;
    });

    it('should return correct topicsCount', () => {
      expect(store.topicsCount).toBe(2);
    });

    it('should return correct topicsDistributionCount', () => {
      expect(store.topicsDistributionCount).toBe(2);
    });

    it('should return correct hasNewTopics', () => {
      expect(store.hasNewTopics).toBe(true);
    });

    it('should return correct hasNewSubTopics', () => {
      expect(store.hasNewSubTopics).toBe(true);
    });

    it('should return correct hasExistingTopics', () => {
      expect(store.hasExistingTopics).toBe(true);
    });

    it('should return correct topic by uuid', () => {
      expect(store.getTopicById('1')).toEqual(mockTopics[0]);
      expect(store.getTopicById('nonexistent')).toBeUndefined();
    });

    it('should return correct sub-topics count', () => {
      expect(store.getSubTopicsCount(0)).toBe(0);
      expect(store.getSubTopicsCount(1)).toBe(1);
      expect(store.getSubTopicsCount(999)).toBe(0);
    });

    it('should handle empty topics for getters', () => {
      store.topics = [];
      store.topicsDistribution = [];

      expect(store.topicsCount).toBe(0);
      expect(store.topicsDistributionCount).toBe(0);
      expect(store.hasNewTopics).toBe(false);
      expect(store.hasNewSubTopics).toBe(false);
      expect(store.hasExistingTopics).toBe(false);
      expect(store.allNewTopicsComplete).toBe(false);
    });

    describe('allNewTopicsComplete getter', () => {
      it('should return false when there are no new topics', () => {
        store.topics = [
          {
            uuid: '1',
            name: 'Topic 1',
            context: 'Context 1',
            isNew: false,
            subTopics: [],
          },
        ];

        expect(store.allNewTopicsComplete).toBe(false);
      });

      it('should return false when new topics have empty name or context', () => {
        store.topics = [
          {
            uuid: '1',
            name: '',
            context: 'Context 1',
            isNew: true,
            subTopics: [],
          },
          {
            uuid: '2',
            name: 'Topic 2',
            context: '',
            isNew: true,
            subTopics: [],
          },
        ];

        expect(store.allNewTopicsComplete).toBe(false);
      });

      it('should return false when some new topics are incomplete', () => {
        store.topics = [
          {
            uuid: '1',
            name: 'Complete Topic',
            context: 'Complete Context',
            isNew: true,
            subTopics: [],
          },
          {
            uuid: '2',
            name: '',
            context: 'Incomplete Context',
            isNew: true,
            subTopics: [],
          },
        ];

        expect(store.allNewTopicsComplete).toBe(false);
      });

      it('should return true when all new topics have name and context', () => {
        store.topics = [
          {
            uuid: '1',
            name: 'Topic 1',
            context: 'Context 1',
            isNew: true,
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

        expect(store.allNewTopicsComplete).toBe(true);
      });

      it('should return false when new subtopics are incomplete', () => {
        store.topics = [
          {
            uuid: '1',
            name: 'Topic 1',
            context: 'Context 1',
            isNew: true,
            subTopics: [
              {
                uuid: '1-1',
                name: 'Complete SubTopic',
                context: 'Complete Sub Context',
                isNew: true,
                subTopics: [],
              },
              {
                uuid: '1-2',
                name: '',
                context: 'Incomplete Sub Context',
                isNew: true,
                subTopics: [],
              },
            ],
          },
        ];

        expect(store.allNewTopicsComplete).toBe(false);
      });

      it('should return true when all new topics and subtopics are complete', () => {
        store.topics = [
          {
            uuid: '1',
            name: 'Topic 1',
            context: 'Context 1',
            isNew: true,
            subTopics: [
              {
                uuid: '1-1',
                name: 'SubTopic 1',
                context: 'Sub Context 1',
                isNew: true,
                subTopics: [],
              },
            ],
          },
          {
            uuid: '2',
            name: 'Topic 2',
            context: 'Context 2',
            isNew: false,
            subTopics: [
              {
                uuid: '2-1',
                name: 'SubTopic 2',
                context: 'Sub Context 2',
                isNew: true,
                subTopics: [],
              },
            ],
          },
        ];

        expect(store.allNewTopicsComplete).toBe(true);
      });

      it('should handle topics with only whitespace in name or context', () => {
        store.topics = [
          {
            uuid: '1',
            name: '   ',
            context: 'Context 1',
            isNew: true,
            subTopics: [],
          },
        ];

        expect(store.allNewTopicsComplete).toBe(false);
      });
    });
  });

  describe('Default alert action', () => {
    it('should call unnnic alert with correct parameters', () => {
      const mockAlert = vi.fn();
      unnnic.unnnicCallAlert = mockAlert;

      store.defaultAlert('success', 'Test message', 10);

      expect(mockAlert).toHaveBeenCalledWith({
        props: {
          text: 'Test message',
          type: 'success',
        },
        seconds: 10,
      });
    });

    it('should use default seconds when not provided', () => {
      const mockAlert = vi.fn();
      unnnic.unnnicCallAlert = mockAlert;

      store.defaultAlert('error', 'Error message');

      expect(mockAlert).toHaveBeenCalledWith({
        props: {
          text: 'Error message',
          type: 'error',
        },
        seconds: 5,
      });
    });
  });

  describe('Drawer actions', () => {
    it('should open drawer', () => {
      store.openAddTopicsDrawer();
      expect(store.isAddTopicsDrawerOpen).toBe(true);
    });

    it('should close drawer', () => {
      store.isAddTopicsDrawerOpen = true;
      store.closeAddTopicsDrawer();
      expect(store.isAddTopicsDrawerOpen).toBe(false);
    });

    it('should toggle drawer state', () => {
      expect(store.isAddTopicsDrawerOpen).toBe(false);

      store.toggleAddTopicsDrawer();
      expect(store.isAddTopicsDrawerOpen).toBe(true);

      store.toggleAddTopicsDrawer();
      expect(store.isAddTopicsDrawerOpen).toBe(false);
    });
  });

  describe('Modal actions', () => {
    it('should open modal with correct type', () => {
      const modalType = 'delete-topic';

      store.openModal(modalType);

      expect(store.isOpenModal).toBe(true);
      expect(store.modalType).toBe(modalType);
    });

    it('should close modal and reset state', () => {
      store.isOpenModal = true;
      store.modalType = 'test-type';
      store.selectedTopicForDeletion = { name: 'test', context: 'test' };

      store.closeModal();

      expect(store.isOpenModal).toBe(false);
      expect(store.modalType).toBe('');
      expect(store.selectedTopicForDeletion).toBeNull();
    });

    it('should set selected topic for deletion', () => {
      const topic = { name: 'Test Topic', context: 'Test Context' };

      store.setSelectedTopicForDeletion(topic);
      expect(store.selectedTopicForDeletion).toEqual(topic);

      store.setSelectedTopicForDeletion(null);
      expect(store.selectedTopicForDeletion).toBeNull();
    });
  });

  describe('Topic type management', () => {
    it('should set topic type to HUMAN', () => {
      store.setTopicType('HUMAN');
      expect(store.topicType).toBe('HUMAN');
    });

    it('should set topic type to AI', () => {
      store.setTopicType('AI');
      expect(store.topicType).toBe('AI');
    });
  });

  describe('Topic management actions', () => {
    it('should add topic with correct properties', () => {
      const newTopic = { name: 'New Topic', context: 'New Context' };

      store.addTopic(newTopic);

      expect(store.topics).toHaveLength(1);
      expect(store.topics[0]).toEqual({
        ...newTopic,
        isNew: true,
        subTopics: [],
      });
    });

    it('should add topic with existing subTopics', () => {
      const newTopic = {
        name: 'Topic',
        context: 'Context',
        subTopics: [{ name: 'Sub', context: 'Sub Context' }],
      };

      store.addTopic(newTopic);

      expect(store.topics[0].subTopics).toEqual(newTopic.subTopics);
    });

    it('should update main topic field', () => {
      store.topics = [
        {
          name: 'Original',
          context: 'Original Context',
          subTopics: [],
        },
      ];

      store.updateTopic(0, 'name', 'Updated Name');

      expect(store.topics[0].name).toBe('Updated Name');
    });

    it('should update sub-topic field', () => {
      store.topics = [
        {
          name: 'Original',
          context: 'Original Context',
          subTopics: [{ name: 'Sub Original', context: 'Sub Context' }],
        },
      ];

      store.updateTopic(0, 'name', 'Updated Sub Name', 0);

      expect(store.topics[0].subTopics[0].name).toBe('Updated Sub Name');
    });

    it('should handle update for non-existent topic', () => {
      expect(() => {
        store.updateTopic(999, 'name', 'test');
      }).not.toThrow();
    });

    it('should add sub-topic correctly', () => {
      store.topics = [{ name: 'Main', context: 'Context', subTopics: [] }];
      const subTopic = { name: 'Sub Topic', context: 'Sub Context' };

      store.addSubTopic(0, subTopic);

      expect(store.topics[0].subTopics).toHaveLength(1);
      expect(store.topics[0].subTopics[0]).toEqual({
        ...subTopic,
        isNew: true,
        subTopics: [],
      });
    });

    it('should initialize subTopics array if not exists', () => {
      store.topics = [{ name: 'Main', context: 'Context' }];
      const subTopic = { name: 'Sub Topic', context: 'Sub Context' };

      store.addSubTopic(0, subTopic);

      expect(store.topics[0].subTopics).toBeDefined();
      expect(store.topics[0].subTopics).toHaveLength(1);
    });
  });

  describe('Utility actions', () => {
    it('should create new topic with correct structure', () => {
      const newTopic = store.createNewTopic();

      expect(newTopic).toEqual({
        name: '',
        context: '',
        isNew: true,
        subTopics: [],
      });
    });
  });

  describe('Async actions', () => {
    describe('loadFormTopics', () => {
      it('should load topics successfully', async () => {
        const mockResponse = [
          {
            uuid: '1',
            name: 'Topic 1',
            description: 'Description 1',
            subtopic: [
              {
                uuid: '1-1',
                name: 'Sub Topic 1',
                description: 'Sub Description 1',
              },
            ],
          },
        ];

        topicsService.getConversationalFormTopics.mockResolvedValue(
          mockResponse,
        );

        await store.loadFormTopics();

        expect(store.isLoadingTopics).toBe(false);
        expect(store.topics).toHaveLength(1);
        expect(store.topics[0]).toEqual({
          uuid: '1',
          name: 'Topic 1',
          context: 'Description 1',
          isNew: false,
          subTopics: [
            {
              uuid: '1-1',
              name: 'Sub Topic 1',
              context: 'Sub Description 1',
              isNew: false,
            },
          ],
        });
      });

      it('should handle loading state correctly', async () => {
        topicsService.getConversationalFormTopics.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve([]), 100)),
        );

        const loadPromise = store.loadFormTopics();
        expect(store.isLoadingTopics).toBe(true);

        await loadPromise;
        expect(store.isLoadingTopics).toBe(false);
      });

      it('should handle errors gracefully', async () => {
        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        topicsService.getConversationalFormTopics.mockRejectedValue(
          new Error('API Error'),
        );

        await store.loadFormTopics();

        expect(store.isLoadingTopics).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error loading topics:',
          expect.any(Error),
        );
        consoleSpy.mockRestore();
      });
    });

    describe('loadTopicsDistribution', () => {
      it('should load topics distribution successfully', async () => {
        const mockResponse = {
          topics: [
            { topic: 'Support', count: 10 },
            { topic: 'Sales', count: 5 },
          ],
        };

        topicsService.getConversationalTopicsDistribution.mockResolvedValue(
          mockResponse,
        );

        await store.loadTopicsDistribution();

        expect(store.isLoadingTopicsDistribution).toBe(false);
        expect(store.topicsDistribution).toEqual(mockResponse.topics);
        expect(
          topicsService.getConversationalTopicsDistribution,
        ).toHaveBeenCalledWith('AI');
      });

      it('should handle loading state correctly', async () => {
        topicsService.getConversationalTopicsDistribution.mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ topics: [] }), 100),
            ),
        );

        const loadPromise = store.loadTopicsDistribution();
        expect(store.isLoadingTopicsDistribution).toBe(true);

        await loadPromise;
        expect(store.isLoadingTopicsDistribution).toBe(false);
      });

      it('should use current topic type in request', async () => {
        store.topicType = 'HUMAN';
        topicsService.getConversationalTopicsDistribution.mockResolvedValue({
          topics: [],
        });

        await store.loadTopicsDistribution();

        expect(
          topicsService.getConversationalTopicsDistribution,
        ).toHaveBeenCalledWith('HUMAN');
      });
    });

    describe('saveAllNewTopics', () => {
      beforeEach(() => {
        const mockAlert = vi.fn();
        unnnic.unnnicCallAlert = mockAlert;
      });

      it('should save all new topics successfully', async () => {
        store.topics = [
          {
            name: 'New Topic',
            context: 'New Context',
            isNew: true,
            subTopics: [],
          },
        ];

        topicsService.createTopic.mockResolvedValue({ uuid: 'new-uuid' });
        topicsService.getConversationalFormTopics.mockResolvedValue([]);

        const result = await store.saveAllNewTopics();

        expect(result).toBe(true);
        expect(store.isSavingTopics).toBe(false);
        expect(topicsService.createTopic).toHaveBeenCalledWith({
          name: 'New Topic',
          description: 'New Context',
        });
      });

      it('should return true when no new topics to save', async () => {
        store.topics = [
          {
            name: 'Existing Topic',
            context: 'Existing Context',
            isNew: false,
            subTopics: [],
          },
        ];

        const result = await store.saveAllNewTopics();

        expect(result).toBe(true);
        expect(store.isSavingTopics).toBe(false);
      });

      it('should handle saving errors', async () => {
        store.topics = [
          {
            name: 'New Topic',
            context: 'New Context',
            isNew: true,
            subTopics: [],
          },
        ];

        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        topicsService.createTopic.mockRejectedValue(new Error('Save Error'));

        const result = await store.saveAllNewTopics();

        expect(result).toBe(false);
        expect(store.isSavingTopics).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('removeTopicOrSubtopic', () => {
      beforeEach(() => {
        const mockAlert = vi.fn();
        unnnic.unnnicCallAlert = mockAlert;
      });

      it('should remove new main topic without API call', async () => {
        store.topics = [
          { name: 'New Topic', context: 'Context', isNew: true },
          { name: 'Other Topic', context: 'Context', isNew: false },
        ];

        await store.removeTopicOrSubtopic(0);

        expect(store.topics).toHaveLength(1);
        expect(store.topics[0].name).toBe('Other Topic');
        expect(topicsService.deleteTopic).not.toHaveBeenCalled();
      });

      it('should remove existing main topic with API call', async () => {
        store.topics = [
          {
            uuid: 'topic-1',
            name: 'Existing Topic',
            context: 'Context',
            isNew: false,
          },
        ];

        topicsService.deleteTopic.mockResolvedValue();

        await store.removeTopicOrSubtopic(0);

        expect(store.topics).toHaveLength(0);
        expect(topicsService.deleteTopic).toHaveBeenCalledWith('topic-1');
      });

      it('should remove new subtopic without API call', async () => {
        store.topics = [
          {
            name: 'Main Topic',
            context: 'Context',
            subTopics: [
              { name: 'New Sub', context: 'Sub Context', isNew: true },
              { name: 'Other Sub', context: 'Sub Context', isNew: false },
            ],
          },
        ];

        await store.removeTopicOrSubtopic(0, 0);

        expect(store.topics[0].subTopics).toHaveLength(1);
        expect(store.topics[0].subTopics[0].name).toBe('Other Sub');
        expect(topicsService.deleteSubTopic).not.toHaveBeenCalled();
      });

      it('should remove existing subtopic with API call', async () => {
        store.topics = [
          {
            uuid: 'topic-1',
            name: 'Main Topic',
            context: 'Context',
            subTopics: [
              {
                uuid: 'sub-1',
                name: 'Existing Sub',
                context: 'Sub Context',
                isNew: false,
              },
            ],
          },
        ];

        topicsService.deleteSubTopic.mockResolvedValue();

        await store.removeTopicOrSubtopic(0, 0);

        expect(store.topics[0].subTopics).toHaveLength(0);
        expect(topicsService.deleteSubTopic).toHaveBeenCalledWith(
          'topic-1',
          'sub-1',
        );
      });

      it('should handle API errors for topic deletion', async () => {
        store.topics = [
          {
            uuid: 'topic-1',
            name: 'Existing Topic',
            context: 'Context',
            isNew: false,
          },
        ];

        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        topicsService.deleteTopic.mockRejectedValue(new Error('Delete Error'));

        await store.removeTopicOrSubtopic(0);

        expect(store.topics).toHaveLength(1);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should handle API errors for subtopic deletion', async () => {
        store.topics = [
          {
            uuid: 'topic-1',
            name: 'Main Topic',
            context: 'Context',
            subTopics: [
              {
                uuid: 'sub-1',
                name: 'Existing Sub',
                context: 'Sub Context',
                isNew: false,
              },
            ],
          },
        ];

        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        topicsService.deleteSubTopic.mockRejectedValue(
          new Error('Delete Error'),
        );

        await store.removeTopicOrSubtopic(0, 0);

        expect(store.topics[0].subTopics).toHaveLength(1);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should not throw when removing non-existent topic', async () => {
        store.topics = [];
        await expect(store.removeTopicOrSubtopic(0)).resolves.not.toThrow();
        expect(store.topics).toHaveLength(0);
      });

      it('should not throw when removing non-existent subtopic', async () => {
        store.topics = [
          {
            uuid: 'topic-1',
            name: 'Main Topic',
            context: 'Context',
            subTopics: [],
          },
        ];
        await expect(store.removeTopicOrSubtopic(0, 0)).resolves.not.toThrow();
        expect(store.topics[0].subTopics).toHaveLength(0);
      });
    });
  });
});
