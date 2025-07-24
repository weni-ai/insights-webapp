import { defineStore } from 'pinia';
import type { topicDistributionMetric } from '@/services/api/resources/conversational/topics';
import topicsService from '@/services/api/resources/conversational/topics';

export interface Topic {
  uuid?: string;
  name: string;
  context: string;
  isNew?: boolean;
  subTopics?: Topic[];
}

export interface ConversationalTopicsState {
  topics: Topic[];
  topicsDistribution: topicDistributionMetric[];
  topicType: 'HUMAN' | 'AI';
  isAddTopicsDrawerOpen: boolean;
  isLoadingTopics: boolean;
  isLoadingTopicsDistribution: boolean;
  isOpenModal: boolean;
  modalType: string;
  selectedTopicForDeletion: Topic | null;
}

export const useConversationalTopics = defineStore('conversationalTopics', {
  state: (): ConversationalTopicsState => ({
    topics: [],
    topicsDistribution: [],
    topicType: 'AI',
    isLoadingTopicsDistribution: false,
    isAddTopicsDrawerOpen: false,
    isLoadingTopics: false,
    isOpenModal: false,
    modalType: '',
    selectedTopicForDeletion: null,
  }),

  getters: {
    topicsCount: (state) => state.topics.length,

    topicsDistributionCount: (state) => state.topicsDistribution.length,

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

    getTopicById: (state) => (uuid: string) =>
      state.topics.find((topic) => topic.uuid === uuid),

    getSubTopicsCount: (state) => (topicIndex: number) =>
      state.topics[topicIndex]?.subTopics?.length || 0,
  },

  actions: {
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

    setTopicType(type: 'HUMAN' | 'AI') {
      this.topicType = type;
    },

    async loadFormTopics() {
      this.isLoadingTopics = true;
      try {
        const response = await topicsService.getConversationalFormTopics();
        this.topics = response.map((topic) => ({
          uuid: topic.uuid,
          name: topic.name,
          context: topic.description || '',
          isNew: false,
          subTopics: topic.subtopic.map((subtopic) => ({
            uuid: subtopic.uuid,
            name: subtopic.name,
            context: subtopic.description || '',
            isNew: false,
          })),
        }));
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        this.isLoadingTopics = false;
      }
    },

    async loadTopicsDistribution() {
      this.isLoadingTopicsDistribution = true;
      try {
        const response =
          await topicsService.getConversationalTopicsDistribution(
            this.topicType,
          );

        this.topicsDistribution = response.topics;
      } catch (error) {
        console.error('Error loading topics distribution:', error);
      } finally {
        this.isLoadingTopicsDistribution = false;
      }
    },

    async saveTopic(topic: Topic) {
      if (!topic.isNew) return;

      try {
        await topicsService.createTopic({
          name: topic.name,
          description: topic.context,
        });

        const topicToUpdate = this.topics.find((t) => t.uuid === topic.uuid);

        if (topicToUpdate) {
          topicToUpdate.isNew = false;
        }

        return true;
      } catch (error) {
        console.error('Error saving topic:', error);
        return false;
      }
    },

    async saveSubTopic(topicUuid: string, subTopic: Topic) {
      if (!subTopic.isNew) return;

      try {
        await topicsService.createSubTopic(topicUuid, {
          name: subTopic.name,
          description: subTopic.context,
        });

        const subTopicToUpdate = this.topics.find(
          (t) => t.uuid === subTopic.uuid,
        );

        if (subTopicToUpdate) {
          subTopicToUpdate.isNew = false;
        }

        return true;
      } catch (error) {
        console.error('Error saving sub topic:', error);
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
