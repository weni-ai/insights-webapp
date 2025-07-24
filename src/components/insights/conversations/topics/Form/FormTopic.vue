<template>
  <section
    class="form-topic"
    data-testid="form-topic"
  >
    <header
      class="form-topic__header"
      data-testid="form-topic-header"
    >
      <AddTopicButton
        :text="$t('conversations_dashboard.form_topic.add_topic')"
        data-testid="form-topic-add-button"
        @add-topic="handleAddTopic"
      />
    </header>

    <section
      v-if="topics.length > 0 && !isLoadingTopics"
      class="form-topic__divider"
      data-testid="form-topic-divider"
    />

    <section
      v-if="!isLoadingTopics"
      class="form-topic__body"
      data-testid="form-topic-body"
    >
      <FormTopicItem
        v-for="(topic, index) in topics"
        :key="`topic-${index}`"
        :topic="topic"
        :topicIndex="index"
        :isSubTopic="false"
        data-testid="form-topic-item"
        @delete-topic="handleDeleteTopic"
        @update-topic="handleUpdateTopic"
        @add-sub-topic="handleAddSubTopic"
        @toggle-sub-topics="handleToggleSubTopics"
      />
    </section>

    <section
      v-if="isLoadingTopics"
      class="form-topic__skeleton"
    >
      <UnnnicSkeletonLoading
        v-for="i in 4"
        :key="i"
        data-testid="form-topic-loading-skeleton"
        height="82px"
        width="100%"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { useConversationalTopics } from '@/store/modules/conversational/topics';
import AddTopicButton from '../AddTopicButton.vue';
import FormTopicItem from './FormTopicItem.vue';
import { storeToRefs } from 'pinia';

const topicsConversationalStore = useConversationalTopics();

const {
  addTopic,
  removeTopicOrSubtopic,
  updateTopic,
  addSubTopic,
  createNewTopic,
} = topicsConversationalStore;

const { isLoadingTopics, topics } = storeToRefs(topicsConversationalStore);

const handleAddTopic = () => {
  const newTopic = createNewTopic();
  addTopic(newTopic);
};

const handleDeleteTopic = (index: number, parentIndex?: number) => {
  removeTopicOrSubtopic(index, parentIndex);
};

const handleUpdateTopic = (
  index: number,
  field: string,
  value: string,
  parentIndex?: number,
) => {
  updateTopic(index, field, value, parentIndex);
};

const handleAddSubTopic = (topicIndex: number) => {
  addSubTopic(topicIndex, createNewTopic());
};

const handleToggleSubTopics = (topicIndex: number) => {
  console.log(`Toggled sub-topics for topic ${topicIndex}`);
};
</script>

<style lang="scss" scoped>
.form-topic {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    width: 100%;
  }

  &__divider {
    width: 100%;
    height: 1px;
    margin-top: $unnnic-spacing-md;
    margin-bottom: $unnnic-spacing-md;
    background-color: $unnnic-color-neutral-soft;
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-spacing-sm;
  }

  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    margin-top: $unnnic-spacing-md;
  }
}
</style>
