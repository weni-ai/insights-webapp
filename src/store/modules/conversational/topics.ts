import { defineStore } from 'pinia';
import unnnic from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';
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
  isSavingTopics: boolean;
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
    isSavingTopics: false,
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
    defaultAlert(type: 'success' | 'error', text: string, seconds: number = 5) {
      (unnnic.unnnicCallAlert as any)({
        props: {
          text,
          type,
        },
        seconds,
      });
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

    async saveAllNewTopics() {
      this.isSavingTopics = true;
      try {
        const newTopicsAndSubtopics = this.topics.filter(
          (topic) =>
            topic.isNew || topic.subTopics?.some((subTopic) => subTopic.isNew),
        );

        if (newTopicsAndSubtopics.length === 0) {
          return true;
        }

        const topicPromises = newTopicsAndSubtopics.map((topic) =>
          this.saveTopicAndSubTopics(topic),
        );

        const results = await Promise.all(topicPromises);
        const allSucceeded = results.every((result) => result);

        if (allSucceeded) {
          this.defaultAlert(
            'success',
            i18n.global.t(
              'conversations_dashboard.form_topic.success_save_topics_or_subtopics',
            ),
          );
          await this.loadFormTopics();
          return true;
        } else {
          throw new Error('Some topics failed to save');
        }
      } catch (error) {
        this.defaultAlert(
          'error',
          i18n.global.t(
            'conversations_dashboard.form_topic.error_save_topics_or_subtopics',
          ),
        );
        console.error('Error saving new topics:', error);
        return false;
      } finally {
        this.isSavingTopics = false;
        this.loadTopicsDistribution();
      }
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

    async saveTopicAndSubTopics(topic: Topic): Promise<boolean> {
      let topicUUID = topic.uuid;
      let topicSavedSuccessfully = true;

      if (topic.isNew) {
        if (!topic.name.trim() || !topic.context.trim()) {
          return false;
        }
        try {
          const createdTopic = await topicsService.createTopic({
            name: topic.name,
            description: topic.context,
          });

          topic.uuid = createdTopic.uuid;
          topic.isNew = false;
          topicUUID = topic.uuid;
        } catch (error) {
          console.error('Error saving topic:', error);
          topicSavedSuccessfully = false;
        }
      }

      if (!topicUUID || !topic.subTopics) {
        return topicSavedSuccessfully;
      }

      const subTopicsToSave = topic.subTopics.filter((st) => st.isNew);

      const subTopicPromises = subTopicsToSave
        .filter((st) => st.name.trim() && st.context.trim())
        .map(async (subTopic) => {
          try {
            const parentWithSubtopics = await topicsService.createSubTopic(
              topicUUID!,
              {
                name: subTopic.name,
                description: subTopic.context,
              },
            );

            return { success: true, parentWithSubtopics };
          } catch (error) {
            console.error('Error saving sub topic:', error);
            return { success: false, parentWithSubtopics: null };
          }
        });

      if (subTopicPromises.length === 0) {
        return topicSavedSuccessfully;
      }

      const results = await Promise.all(subTopicPromises);

      const successfulSaves = results.filter((r) => r.success);
      if (successfulSaves.length > 0) {
        const lastResponse =
          successfulSaves[successfulSaves.length - 1].parentWithSubtopics;
        if (lastResponse) {
          topic.subTopics =
            lastResponse.subtopic?.map((st) => ({
              uuid: st.uuid,
              name: st.name,
              context: st.description || '',
              isNew: false,
              subTopics: [],
            })) || [];
        }
      }

      const allSubtopicsSaved = results.every((r) => r.success);
      return topicSavedSuccessfully && allSubtopicsSaved;
    },

    async _removeTopic(index: number) {
      const topic = this.topics[index];
      if (!topic) return;

      const removeInternalTopic = () => {
        this.topics.splice(index, 1);
      };

      if (topic.isNew || !topic.uuid) {
        removeInternalTopic();
        return;
      }

      try {
        await topicsService.deleteTopic(topic.uuid);
        removeInternalTopic();
        this.defaultAlert(
          'success',
          i18n.global.t(
            'conversations_dashboard.form_topic.success_remove_topic',
          ),
        );
      } catch (error) {
        this.defaultAlert(
          'error',
          i18n.global.t(
            'conversations_dashboard.form_topic.error_remove_topic',
          ),
        );
        console.error('Error deleting topic:', error);
      }
    },

    async _removeSubTopic(index: number, parentIndex: number) {
      const parentTopic = this.topics[parentIndex];
      const subtopic = parentTopic?.subTopics?.[index];
      if (!subtopic) return;

      const removeInternalSubtopic = () => {
        parentTopic.subTopics?.splice(index, 1);
      };

      if (subtopic.isNew || !parentTopic.uuid || !subtopic.uuid) {
        removeInternalSubtopic();
        return;
      }

      try {
        await topicsService.deleteSubTopic(parentTopic.uuid, subtopic.uuid);
        removeInternalSubtopic();
        this.defaultAlert(
          'success',
          i18n.global.t(
            'conversations_dashboard.form_topic.success_remove_subtopic',
          ),
        );
      } catch (error) {
        this.defaultAlert(
          'error',
          i18n.global.t(
            'conversations_dashboard.form_topic.error_remove_subtopic',
          ),
        );
        console.error('Error deleting sub topic:', error);
      }
    },

    async removeTopicOrSubtopic(index: number, parentIndex?: number) {
      if (parentIndex !== undefined) {
        await this._removeSubTopic(index, parentIndex);
      } else {
        await this._removeTopic(index);
      }
    },
  },
});
