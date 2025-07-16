<template>
  <section class="form-topic">
    <section class="form-topic__header">
      <AddTopicButton
        :text="$t('conversations_dashboard.form_topic.add_topic')"
        @add-topic="handleAddTopic"
      />
    </section>

    <section class="form-topic__divider" />

    <section class="form-topic__body">
      <FormTopicItem
        v-for="(topic, index) in topics"
        :key="`topic-${index}`"
        :topic="topic"
        :topicIndex="index"
        :isSubTopic="false"
        @delete-topic="handleDeleteTopic"
        @update-topic="handleUpdateTopic"
        @add-sub-topic="handleAddSubTopic"
        @toggle-sub-topics="handleToggleSubTopics"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AddTopicButton from '../AddTopicButton.vue';
import FormTopicItem from './FormTopicItem.vue';

interface Topic {
  name: string;
  context: string;
  subTopics: Topic[];
}

const topics = ref<Topic[]>([]);

const createNewTopic = (): Topic => ({
  name: '',
  context: '',
  subTopics: [],
});

const handleAddTopic = () => {
  topics.value.push(createNewTopic());
};

const handleDeleteTopic = (index: number, parentIndex?: number) => {
  if (parentIndex !== undefined) {
    topics.value[parentIndex].subTopics.splice(index, 1);
  } else {
    topics.value.splice(index, 1);
  }
};

const handleUpdateTopic = (
  index: number,
  field: string,
  value: string,
  parentIndex?: number,
) => {
  if (parentIndex !== undefined) {
    // Updating a sub-topic
    const subTopic = topics.value[parentIndex].subTopics[index];
    if (field === 'name') {
      subTopic.name = value;
    } else if (field === 'context') {
      subTopic.context = value;
    }
  } else {
    // Updating a main topic
    const topic = topics.value[index];
    if (field === 'name') {
      topic.name = value;
    } else if (field === 'context') {
      topic.context = value;
    }
  }
};

const handleAddSubTopic = (topicIndex: number) => {
  topics.value[topicIndex].subTopics.push(createNewTopic());
};

const handleToggleSubTopics = (topicIndex: number) => {
  console.log(`Toggled sub-topics for topic ${topicIndex}`);
};

// handleAddTopic();
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
}
</style>
