<template>
  <section
    class="form-topic-card"
    data-testid="form-topic-card"
  >
    <section
      v-if="isNew"
      class="form-topic-card__form"
      data-testid="form-topic-card-form"
    >
      <section class="form-topic-card__form__header">
        <p
          class="form-topic-card__form__header__title"
          data-testid="form-topic-card-title"
        >
          {{
            showSubTopics
              ? $t('conversations_dashboard.form_topic.new_sub_topic')
              : $t('conversations_dashboard.form_topic.new_topic')
          }}
        </p>
        <UnnnicButton
          size="small"
          type="tertiary"
          iconCenter="delete"
          class="form-topic-card__form__header__delete-button"
          data-testid="form-topic-card-delete-button"
          @click="handleDeleteTopic"
        />
      </section>

      <form class="form-topic-card__form__form">
        <UnnnicInput
          :modelValue="topic.name"
          :label="$t('conversations_dashboard.form_topic.topic_name')"
          class="form-topic-card__form__input"
          data-testid="form-topic-card-name-input"
          @update:model-value="updateTopicName"
        />

        <section class="form-topic-card__form__context">
          <UnnnicInput
            :modelValue="topic.context"
            :label="$t('conversations_dashboard.form_topic.context')"
            class="form-topic-card__form__input"
            data-testid="form-topic-card-context-input"
            @update:model-value="updateTopicContext"
          />

          <section class="form-topic-card__form__context__description">
            <p class="form-topic-card__form__context__description__text">
              {{ $t('conversations_dashboard.form_topic.context_description') }}
            </p>
            <p
              class="form-topic-card__form__context__description__text"
              data-testid="form-topic-card-character-count"
            >
              {{ topic.context.length }}/100
            </p>
          </section>
        </section>
      </form>
    </section>
    <section
      v-else
      class="form-topic-card__item"
      data-testid="form-topic-card-item"
    >
      <section class="form-topic-card__item__content">
        <section
          v-if="!isSubTopic"
          class="form-topic-card__item__toggle"
          data-testid="form-topic-card-toggle"
          @click="toggleSubTopics"
        >
          <UnnnicIcon
            :icon="
              showSubTopics ? 'keyboard_arrow_down' : 'keyboard_arrow_right'
            "
            size="md"
            class="form-topic-card__item__toggle__icon"
            scheme="neutral-cloudy"
          />
        </section>
        <section class="form-topic-card__item__content__container">
          <p
            class="form-topic-card__item__content__container__title"
            data-testid="form-topic-card-item-title"
          >
            {{ topic.name }}
          </p>
          <p
            class="form-topic-card__item__content__container__description"
            data-testid="form-topic-card-item-description"
          >
            {{ topic.context }}
          </p>
        </section>
      </section>
      <section class="form-topic-card__item__actions">
        <UnnnicButton
          size="large"
          type="tertiary"
          iconCenter="delete"
          class="form-topic-card__item__actions__delete-button"
          data-testid="form-topic-card-item-delete-button"
          @click="handleDeleteTopic"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { Topic } from '@/store/modules/conversational/topics';

defineProps<{
  showSubTopics: boolean;
  topic: Topic;
  isNew: boolean;
  isSubTopic: boolean;
}>();

const emit = defineEmits<{
  (e: 'delete-topic'): void;
  (e: 'update-topic-name', value: string): void;
  (e: 'update-topic-context', value: string): void;
  (e: 'toggle-sub-topics'): void;
}>();

const handleDeleteTopic = () => {
  emit('delete-topic');
};

const updateTopicName = (value: string) => {
  emit('update-topic-name', value);
};

const updateTopicContext = (value: string) => {
  emit('update-topic-context', value);
};

const toggleSubTopics = () => {
  emit('toggle-sub-topics');
};
</script>

<style lang="scss" scoped>
.form-topic-card {
  width: 100%;

  &__form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;

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
  }

  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__content {
      display: flex;
      align-items: center;
      gap: $unnnic-spacing-sm;

      &__container {
        display: flex;
        flex-direction: column;
        gap: $unnnic-spacing-nano;

        &__title {
          color: $unnnic-color-neutral-darkest;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-lg;
          font-style: normal;
          font-weight: $unnnic-font-weight-regular;
          line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        }

        &__description {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          text-align: center;
          text-overflow: ellipsis;
          overflow: hidden;
          color: $unnnic-color-neutral-cloudy;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-gt;
          font-style: normal;
          font-weight: $unnnic-font-weight-regular;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        }
      }
    }

    &__toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }
}
</style>
