<template>
  <section class="form-topic-item">
    <section class="form-topic-item__header">
      <p class="form-topic-item__header__title">
        {{
          isSubTopic
            ? $t('conversations_dashboard.form_topic.new_sub_topic')
            : $t('conversations_dashboard.form_topic.new_topic')
        }}
      </p>
      <UnnnicButton
        size="small"
        type="tertiary"
        iconCenter="delete"
        class="form-topic-item__header__delete-button"
        @click="handleDeleteTopic"
      />
    </section>

    <form class="form-topic-item__form">
      <UnnnicInput
        :modelValue="topic.name"
        :label="$t('conversations_dashboard.form_topic.topic_name')"
        class="form-topic-item__input"
        @update:model-value="updateTopicName"
      />

      <section class="form-topic-item__context">
        <UnnnicInput
          :modelValue="topic.context"
          :label="$t('conversations_dashboard.form_topic.context')"
          class="form-topic-item__input"
          @update:model-value="updateTopicContext"
        />

        <section class="form-topic-item__context__description">
          <p class="form-topic-item__context__description__text">
            {{ $t('conversations_dashboard.form_topic.context_description') }}
          </p>
          <p class="form-topic-item__context__description__text">
            {{ topic.context.length }}/100
          </p>
        </section>
      </section>
    </form>

    <section
      v-if="!isSubTopic"
      class="form-topic-item__footer"
    >
      <section
        class="form-topic-item__footer__sub_topics"
        @click="toggleSubTopics"
      >
        <UnnnicIcon
          :icon="showSubTopics ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
          size="md"
          class="form-topic-item__footer__sub_topics__icon"
          scheme="neutral-cloudy"
        />
        <p class="form-topic-item__footer__sub_topics__title">
          {{ $t('conversations_dashboard.form_topic.sub_topics') }}
        </p>
      </section>

      <section
        v-if="showSubTopics"
        class="form-topic-item__sub-topics"
      >
        <FormTopicItem
          v-for="(subTopic, subIndex) in topic.subTopics"
          :key="`sub-topic-${topicIndex}-${subIndex}`"
          :topic="subTopic"
          :topicIndex="subIndex"
          :parentIndex="topicIndex"
          :isSubTopic="true"
          @delete-topic="(index) => $emit('delete-topic', index, topicIndex)"
          @update-topic="
            (index, field, value) =>
              $emit('update-topic', index, field, value, topicIndex)
          "
        />

        <AddTopicButton
          :text="$t('conversations_dashboard.form_topic.add_sub_topic')"
          @add-topic="$emit('add-sub-topic', topicIndex)"
        />
      </section>
    </section>
  </section>
  <ModalTopic
    :isOpen="isOpenModal"
    :type="modalType"
    :text="topicOrSubTopicName"
    @primary-button-click="primaryButtonClick"
    @secondary-button-click="secondaryButtonClick"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';
import { type Topic } from '@/store/modules/conversational/topics';

import AddTopicButton from '../AddTopicButton.vue';
import ModalTopic from '../ModalTopic.vue';

interface Props {
  topic: Topic;
  topicIndex: number;
  parentIndex?: number;
  isSubTopic?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSubTopic: false,
  parentIndex: undefined,
});

const emit = defineEmits<{
  'delete-topic': [index: number, parentIndex?: number];
  'update-topic': [
    index: number,
    field: string,
    value: string,
    parentIndex?: number,
  ];
  'add-sub-topic': [index: number];
  'toggle-sub-topics': [index: number];
}>();

const showSubTopics = ref(false);
const isOpenModal = ref(false);

const updateTopicName = (value: string) => {
  emit('update-topic', props.topicIndex, 'name', value, props.parentIndex);
};

const updateTopicContext = (value: string) => {
  emit('update-topic', props.topicIndex, 'context', value, props.parentIndex);
};

const toggleSubTopics = () => {
  showSubTopics.value = !showSubTopics.value;
  emit('toggle-sub-topics', props.topicIndex);
};

const handleDeleteTopic = () => {
  if (props.topic.isNew) {
    emit('delete-topic', props.topicIndex, props.parentIndex);
  } else {
    isOpenModal.value = true;
  }
};

const modalType = computed(() => {
  return props.isSubTopic ? 'remove-sub-topic' : 'remove-topic';
});

const topicOrSubTopicName = computed(() => {
  if (props.isSubTopic) {
    return props.topic.name || `Unnamed Sub-topic ${props.topicIndex + 1}`;
  } else {
    return props.topic.name || `Unnamed Topic ${props.topicIndex + 1}`;
  }
});

const primaryButtonClick = () => {
  emit('delete-topic', props.topicIndex, props.parentIndex);
  isOpenModal.value = false;
};

const secondaryButtonClick = () => {
  isOpenModal.value = false;
};
</script>

<style lang="scss" scoped>
.form-topic-item {
  display: flex;
  padding: $unnnic-spacing-sm;
  flex-direction: column;
  align-items: flex-start;
  gap: $unnnic-spacing-sm;
  align-self: stretch;
  border-radius: $unnnic-spacing-xs;
  border: 1px solid $unnnic-color-neutral-soft;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    :deep(.unnnic-button--icon-on-center.unnnic-button--size-small) {
      padding: 0;
      width: $unnnic-icon-size-ant;
      height: $unnnic-icon-size-ant;
    }

    &__title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-lg;
      font-style: normal;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }

    &__delete-button {
      :deep(.unnnic-icon__size--md) {
        width: $unnnic-icon-size-ant;
        height: $unnnic-icon-size-ant;
        min-width: $unnnic-icon-size-ant;
        min-height: $unnnic-icon-size-ant;
      }
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
    width: 100%;
  }

  &__input {
    width: 100%;
    :deep(.unnnic-form__label) {
      margin: 0 0 $unnnic-spacing-nano 0;
    }
  }

  &__context {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;

    &__description {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &__text {
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        font-style: normal;
        font-weight: $unnnic-font-weight-regular;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    width: 100%;

    &__sub_topics {
      display: flex;
      align-items: center;
      gap: $unnnic-spacing-xs;
      align-self: stretch;
      cursor: pointer;

      &__title {
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
        font-style: normal;
        font-weight: $unnnic-font-weight-regular;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      }
    }
  }

  &__sub-topics {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }
}
</style>
