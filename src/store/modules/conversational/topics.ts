import { defineStore } from 'pinia';

export interface Topic {
  id?: string;
  name: string;
  context: string;
  isNew?: boolean;
  subTopics?: Topic[];
}

export interface ConversationalTopicsState {
  topics: Topic[];
  isAddTopicsDrawerOpen: boolean;
  isLoadingTopics: boolean;
  isOpenModal: boolean;
  modalType: string;
  selectedTopicForDeletion: Topic | null;
}

export const useConversationalTopics = defineStore('conversationalTopics', {
  state: (): ConversationalTopicsState => ({
    topics: [],
    isAddTopicsDrawerOpen: false,
    isLoadingTopics: false,
    isOpenModal: false,
    modalType: '',
    selectedTopicForDeletion: null,
  }),

  getters: {
    topicsCount: (state) => state.topics.length,

    hasNewTopics: (state) =>
      state.topics.some(
        (topic) =>
          topic.isNew === true &&
          (topic.context.trim() !== '' || topic.name.trim() !== ''),
      ),

    hasNewSubTopics: (state) =>
      state.topics.some((topic) =>
        topic.subTopics?.some(
          (subTopic) =>
            subTopic.isNew === true &&
            (subTopic.context.trim() !== '' || subTopic.name.trim() !== ''),
        ),
      ),

    allNewTopicsComplete: (state) => {
      const newMainTopics = state.topics.filter(
        (topic) => topic.isNew === true,
      );
      const newSubTopics = state.topics.flatMap(
        (topic) =>
          topic.subTopics?.filter((subTopic) => subTopic.isNew === true) || [],
      );
      const allNewTopics = [...newMainTopics, ...newSubTopics];

      if (allNewTopics.length === 0) {
        return false;
      }

      return allNewTopics.every(
        (topic) => topic.context.trim() !== '' && topic.name.trim() !== '',
      );
    },

    hasExistingTopics: (state) =>
      state.topics.some((topic) => topic.isNew === false),

    getTopicById: (state) => (id: string) =>
      state.topics.find((topic) => topic.id === id),

    getSubTopicsCount: (state) => (topicIndex: number) =>
      state.topics[topicIndex]?.subTopics?.length || 0,
  },

  actions: {
    initializeMockData() {
      this.topics = this.getMockTopics();
    },

    getMockTopics(): Topic[] {
      return [
        {
          id: '1',
          name: 'Customer Support',
          context: 'Questions and issues related to customer service',
          subTopics: [
            {
              id: '1-1',
              name: 'Billing Issues',
              context: 'Problems with payments and billing',
              subTopics: [],
            },
            {
              id: '1-2',
              name: 'Technical Support',
              context: 'Technical problems and troubleshooting',
              subTopics: [],
            },
          ],
        },
        {
          id: '2',
          name: 'Product Information',
          context: 'Questions about product features and specifications',
          subTopics: [
            {
              id: '2-1',
              name: 'Feature Requests',
              context: 'Customer requests for new features',
              subTopics: [],
            },
          ],
        },
        {
          id: '3',
          name: 'Sales Inquiries',
          context: 'Questions about purchasing and pricing',
          subTopics: [],
        },
        {
          id: '4',
          name: 'Feedback and Reviews',
          context: 'Customer feedback about products and services',
          subTopics: [
            {
              id: '4-1',
              name: 'Product Reviews',
              context: 'Reviews and ratings for products',
              subTopics: [],
            },
            {
              id: '4-2',
              name: 'Service Feedback',
              context: 'Feedback about customer service experience',
              subTopics: [],
            },
          ],
        },
      ];
    },

    toggleAddTopicsDrawer() {
      this.isAddTopicsDrawerOpen = !this.isAddTopicsDrawerOpen;
    },

    openAddTopicsDrawer() {
      this.isAddTopicsDrawerOpen = true;
    },

    closeAddTopicsDrawer() {
      this.isAddTopicsDrawerOpen = false;
    },

    openModal(type: string) {
      this.isOpenModal = true;
      this.modalType = type;
    },

    closeModal() {
      this.isOpenModal = false;
      this.modalType = '';
      this.selectedTopicForDeletion = null;
    },

    addTopic(topic: Topic) {
      const newTopic: Topic = {
        ...topic,
        isNew: true,
        subTopics: topic.subTopics || [],
      };
      this.topics.push(newTopic);
    },

    deleteTopic(topicIndex: number, parentIndex?: number) {
      if (parentIndex !== undefined) {
        this.topics[parentIndex].subTopics?.splice(topicIndex, 1);
      } else {
        this.topics.splice(topicIndex, 1);
      }
    },

    updateTopic(
      topicIndex: number,
      field: string,
      value: string,
      parentIndex?: number,
    ) {
      if (parentIndex !== undefined) {
        const subTopic = this.topics[parentIndex].subTopics?.[topicIndex];
        if (subTopic) {
          (subTopic as any)[field] = value;
        }
      } else {
        const topic = this.topics[topicIndex];
        if (topic) {
          (topic as any)[field] = value;
        }
      }
    },

    addSubTopic(topicIndex: number, subTopic: Topic) {
      const newSubTopic: Topic = {
        ...subTopic,
        isNew: true,
        subTopics: [],
      };

      if (!this.topics[topicIndex].subTopics) {
        this.topics[topicIndex].subTopics = [];
      }
      this.topics[topicIndex].subTopics?.push(newSubTopic);
    },

    createNewTopic(): Topic {
      return {
        name: '',
        context: '',
        isNew: true,
        subTopics: [],
      };
    },

    setSelectedTopicForDeletion(topic: Topic | null) {
      this.selectedTopicForDeletion = topic;
    },

    async loadTopics() {
      this.isLoadingTopics = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.initializeMockData();
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        this.isLoadingTopics = false;
      }
    },

    async saveTopic(topic: Topic) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const topicToUpdate = this.topics.find((t) => t.id === topic.id);
        if (topicToUpdate) {
          topicToUpdate.isNew = false;
        }

        return true;
      } catch (error) {
        console.error('Error saving topic:', error);
        return false;
      }
    },

    async deleteTopicById(topicId: string) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
      } catch (error) {
        console.error('Error deleting topic:', error);
        return false;
      }
    },
  },
});
