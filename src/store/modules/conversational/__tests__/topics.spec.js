import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useConversationalTopics } from '../topics';

describe('useConversationalTopics store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversationalTopics();
  });

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      expect(store.topics).toEqual([]);
      expect(store.isAddTopicsDrawerOpen).toBe(false);
      expect(store.isLoadingTopics).toBe(false);
      expect(store.isOpenModal).toBe(false);
      expect(store.modalType).toBe('');
      expect(store.selectedTopicForDeletion).toBeNull();
    });
  });

  describe('Getters', () => {
    const mockTopics = [
      {
        id: '1',
        name: 'Topic 1',
        context: 'Context 1',
        isNew: true,
        subTopics: [],
      },
      {
        id: '2',
        name: 'Topic 2',
        context: 'Context 2',
        isNew: false,
        subTopics: [
          {
            id: '2-1',
            name: 'Sub Topic',
            context: 'Sub Context',
            subTopics: [],
          },
        ],
      },
    ];

    beforeEach(() => {
      store.topics = mockTopics;
    });

    const getterTests = [
      { getter: 'topicsCount', expected: 2 },
      { getter: 'hasNewTopics', expected: true },
      { getter: 'hasExistingTopics', expected: true },
    ];

    getterTests.forEach(({ getter, expected }) => {
      it(`should return correct ${getter}`, () => {
        expect(store[getter]).toBe(expected);
      });
    });

    it('should return correct topic by id', () => {
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

      expect(store.topicsCount).toBe(0);
      expect(store.hasNewTopics).toBe(false);
      expect(store.hasExistingTopics).toBe(false);
      expect(store.allNewTopicsComplete).toBe(false);
    });

    describe('allNewTopicsComplete getter', () => {
      it('should return false when there are no new topics', () => {
        store.topics = [
          {
            id: '1',
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
            id: '1',
            name: '',
            context: 'Context 1',
            isNew: true,
            subTopics: [],
          },
          {
            id: '2',
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
            id: '1',
            name: 'Complete Topic',
            context: 'Complete Context',
            isNew: true,
            subTopics: [],
          },
          {
            id: '2',
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
            id: '1',
            name: 'Topic 1',
            context: 'Context 1',
            isNew: true,
            subTopics: [],
          },
          {
            id: '2',
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
            id: '1',
            name: 'Topic 1',
            context: 'Context 1',
            isNew: true,
            subTopics: [
              {
                id: '1-1',
                name: 'Complete SubTopic',
                context: 'Complete Sub Context',
                isNew: true,
                subTopics: [],
              },
              {
                id: '1-2',
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
            id: '1',
            name: 'Topic 1',
            context: 'Context 1',
            isNew: true,
            subTopics: [
              {
                id: '1-1',
                name: 'SubTopic 1',
                context: 'Sub Context 1',
                isNew: true,
                subTopics: [],
              },
            ],
          },
          {
            id: '2',
            name: 'Topic 2',
            context: 'Context 2',
            isNew: false,
            subTopics: [
              {
                id: '2-1',
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
            id: '1',
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

  describe('Drawer actions', () => {
    const drawerTests = [
      { action: 'openAddTopicsDrawer', expectedState: true },
      { action: 'closeAddTopicsDrawer', expectedState: false },
    ];

    drawerTests.forEach(({ action, expectedState }) => {
      it(`should ${action.includes('open') ? 'open' : 'close'} drawer`, () => {
        store[action]();
        expect(store.isAddTopicsDrawerOpen).toBe(expectedState);
      });
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

    it('should delete main topic', () => {
      store.topics = [
        { name: 'Topic 1', context: 'Context 1' },
        { name: 'Topic 2', context: 'Context 2' },
      ];

      store.deleteTopic(0);

      expect(store.topics).toHaveLength(1);
      expect(store.topics[0].name).toBe('Topic 2');
    });

    it('should delete sub-topic', () => {
      store.topics = [
        {
          name: 'Main Topic',
          context: 'Main Context',
          subTopics: [
            { name: 'Sub 1', context: 'Sub Context 1' },
            { name: 'Sub 2', context: 'Sub Context 2' },
          ],
        },
      ];

      store.deleteTopic(0, 0);

      expect(store.topics[0].subTopics).toHaveLength(1);
      expect(store.topics[0].subTopics[0].name).toBe('Sub 2');
    });

    const updateTests = [
      { field: 'name', value: 'Updated Name', parentIndex: undefined },
      { field: 'context', value: 'Updated Context', parentIndex: undefined },
      { field: 'name', value: 'Updated Sub Name', parentIndex: 0 },
    ];

    updateTests.forEach(({ field, value, parentIndex }) => {
      it(`should update ${field} for ${parentIndex !== undefined ? 'sub-topic' : 'main topic'}`, () => {
        store.topics = [
          {
            name: 'Original',
            context: 'Original Context',
            subTopics: [{ name: 'Sub Original', context: 'Sub Context' }],
          },
        ];

        store.updateTopic(0, field, value, parentIndex);

        const targetTopic =
          parentIndex !== undefined
            ? store.topics[parentIndex].subTopics[0]
            : store.topics[0];

        expect(targetTopic[field]).toBe(value);
      });
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

    it('should initialize mock data', () => {
      store.initializeMockData();

      expect(store.topics.length).toBeGreaterThan(0);
      expect(store.topics[0]).toHaveProperty('id');
      expect(store.topics[0]).toHaveProperty('name');
      expect(store.topics[0]).toHaveProperty('context');
    });

    it('should return correct mock topics structure', () => {
      const mockTopics = store.getMockTopics();

      expect(Array.isArray(mockTopics)).toBe(true);
      expect(mockTopics.length).toBe(4);
      expect(mockTopics[0].name).toBe('Customer Support');
      expect(mockTopics[0].subTopics.length).toBe(2);
    });
  });

  describe('Async actions', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should load topics with loading state', async () => {
      const loadPromise = store.loadTopics();

      expect(store.isLoadingTopics).toBe(true);

      vi.advanceTimersByTime(1000);
      await loadPromise;

      expect(store.isLoadingTopics).toBe(false);
      expect(store.topics.length).toBeGreaterThan(0);
    });

    it('should save topic successfully', async () => {
      store.topics = [
        { id: '1', name: 'Test', context: 'Context', isNew: true },
      ];

      const savePromise = store.saveTopic(store.topics[0]);
      vi.advanceTimersByTime(500);
      const result = await savePromise;

      expect(result).toBe(true);
      expect(store.topics[0].isNew).toBe(false);
    });

    it('should delete topic by id successfully', async () => {
      const deletePromise = store.deleteTopicById('1');
      vi.advanceTimersByTime(500);
      const result = await deletePromise;

      expect(result).toBe(true);
    });

    it('should handle async method timing correctly', async () => {
      const promises = [
        store.loadTopics(),
        store.saveTopic({ id: '1', name: 'Test' }),
        store.deleteTopicById('1'),
      ];

      expect(store.isLoadingTopics).toBe(true);

      vi.advanceTimersByTime(1000);
      await Promise.all(promises);

      expect(store.isLoadingTopics).toBe(false);
    });
  });
});
