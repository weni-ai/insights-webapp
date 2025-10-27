<template>
  <section
    :class="['form-topic-item', { 'form-topic-item-gap': topic.isNew }]"
    data-testid="form-topic-item"
  >
    <FormTopicCard
      :topic="topic"
      :isNew="topic.isNew"
      :isSubTopic="isSubTopic"
      :showSubTopics="showSubTopics"
      data-testid="form-topic-card"
      @delete-topic="handleDeleteTopic"
      @update-topic-name="updateTopicName"
      @update-topic-context="updateTopicContext"
      @toggle-topics="toggleTopics"
    />
    <section
      v-if="!isSubTopic"
      :class="[
        'form-topic-item__footer',
        {
          'form-topic-item-gap': topic.isNew,
        },
      ]"
      data-testid="form-topic-item-footer"
    >
      <section
        v-if="!topic.isNew && showSubTopics"
        class="form-topic-item__footer__divider"
        data-testid="form-topic-item-divider"
      />
      <section
        :class="[
          'form-topic-item__footer__sub_topics',
          {
            'form-topic-item__footer__sub_topics-gap': topic.isNew,
          },
        ]"
        data-testid="form-topic-item-sub-topics-toggle"
        @click="toggleSubTopics"
      >
        <UnnnicIcon
          v-if="topic.isNew"
          :icon="showSubTopics ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
          size="md"
          class="form-topic-item__footer__sub_topics__icon"
          scheme="neutral-cloudy"
          data-testid="form-topic-item-toggle-icon"
        />
        <p
          v-if="topic.isNew || showSubTopics"
          :class="[
            'form-topic-item__footer__sub_topics__title',
            {
              'form-topic-item__footer__sub_topics-padding-bottom':
                !topic.isNew,
            },
          ]"
          data-testid="form-topic-item-sub-topics-title"
        >
          {{ subTopicsTitle }}
        </p>
      </section>

      <section
        v-if="showSubTopics"
        :class="[
          'form-topic-item__sub-topics',
          {
            'form-topic-item-gap': topic.isNew,
            'form-topic-item-xs-gap': !topic.isNew,
          },
        ]"
        data-testid="form-topic-item-sub-topics-list"
      >
        <FormTopicItem
          v-for="(subTopic, subIndex) in topic.subTopics"
          :key="`sub-topic-${topicIndex}-${subIndex}`"
          :topic="subTopic"
          :topicIndex="subIndex"
          :parentIndex="topicIndex"
          :isSubTopic="true"
          data-testid="form-topic-item-sub-topic"
          @delete-topic="(index) => $emit('delete-topic', index, topicIndex)"
          @update-topic="
            (index, field, value) =>
              $emit('update-topic', index, field, value, topicIndex)
          "
        />

        <AddTopicButton
          :text="$t('conversations_dashboard.form_topic.add_sub_topic')"
          data-testid="form-topic-item-add-sub-topic-button"
          :disabled="isLimitSubTopicsReached"
          @add-topic="$emit('add-sub-topic', topicIndex)"
        />
      </section>
    </section>
  </section>
  <section
    v-if="topic.createdAt"
    class="form-topic-item-footer"
  >
    <p class="form-topic-item-footer__title">
      {{ handleFormatDate(topic.createdAt) }}
    </p>
  </section>
  <ModalTopic
    :isOpen="isOpenModal"
    :type="modalType"
    :text="topicOrSubTopicName"
    data-testid="form-topic-item-modal"
    @primary-button-click="primaryButtonClick"
    @secondary-button-click="secondaryButtonClick"
    @close="secondaryButtonClick"
  />
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';
import { type Topic } from '@/store/modules/conversational/topics';

import { useI18n } from 'vue-i18n';

import AddTopicButton from '../AddTopicButton.vue';
import ModalTopic from '../ModalTopic.vue';
import FormTopicCard from './FormTopicCard.vue';
import { useDateTime } from '@/composables/useDateTime';

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
  'toggle-topics': [index: number];
}>();

const { t } = useI18n();
const { formatDateAndTimeWithLocale } = useDateTime();

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

const toggleTopics = () => {
  showSubTopics.value = !showSubTopics.value;
  emit('toggle-topics', props.topicIndex);
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

const subTopicsTitle = computed(() => {
  if (!props.topic.isNew) {
    return t('conversations_dashboard.form_topic.sub_topics_added', {
      sub_topics: props.topic.subTopics.filter((v) => !v.isNew).length || 0,
    });
  } else {
    return t('conversations_dashboard.form_topic.sub_topics');
  }
});

const isLimitSubTopicsReached = computed(() => {
  return props.topic?.subTopics?.length >= 5;
});

const handleFormatDate = (date: string) => {
  const { time, date: dateFormat } = formatDateAndTimeWithLocale(
    new Date(date),
  );

  return t('conversations_dashboard.form_topic.added_topic', {
    time,
    date: dateFormat,
  });
};
</script>

<style lang="scss" scoped>
.form-topic-item {
  display: flex;
  padding: $unnnic-spacing-sm;
  flex-direction: column;
  align-items: flex-start;

  &-gap {
    gap: $unnnic-spacing-sm;
  }

  &-xs-gap {
    gap: $unnnic-spacing-xs;
  }

  align-self: stretch;
  border-radius: $unnnic-spacing-xs;
  border: 1px solid $unnnic-color-neutral-soft;

  &__footer {
    display: flex;
    flex-direction: column;
    width: 100%;

    &__divider {
      width: 100%;
      height: 1px;
      margin-top: $unnnic-spacing-sm;
      margin-bottom: $unnnic-spacing-sm;
      background-color: $unnnic-color-neutral-soft;
    }

    &__sub_topics {
      display: flex;
      align-items: center;
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

      &-padding-bottom {
        padding-bottom: $unnnic-spacing-xs;
      }
    }
  }

  &__sub-topics {
    display: flex;
    flex-direction: column;
  }

  &-footer {
    display: flex;
    flex-direction: column;
    align-items: end;
    justify-content: end;
    width: 100%;
    padding-bottom: $unnnic-spacing-sm;

    &__title {
      overflow: hidden;
      color: $unnnic-color-neutral-cloudy;
      text-align: right;
      text-overflow: ellipsis;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-md;
      font-weight: $unnnic-font-weight-regular;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      font-style: italic;
      padding-right: $unnnic-spacing-nano;
    }
  }
}
</style>
