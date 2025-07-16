<template>
  <section class="form-topic">
    <section class="form-topic__header">
      <AddTopicButton
        :text="$t('conversations_dashboard.form_topic.add_topic')"
        @add-topic="handleDrawerAddTopic"
      />
    </section>
    <section class="form-topic__divider" />
    <section class="form-topic__body">
      <section class="form-topic__body__item">
        <section class="form-topic__body__item__header">
          <p class="form-topic__body__item__header__title">
            {{ $t('conversations_dashboard.form_topic.new_topic') }}
          </p>
          <UnnnicButton
            size="small"
            type="tertiary"
            iconCenter="delete"
            class="form-topic__body__item__header__delete-button"
            @click="handleRemoveTopic"
          />
        </section>
        <form class="form-topic__body__item__form">
          <UnnnicInput
            v-model="newTopic"
            :label="$t('conversations_dashboard.form_topic.topic_name')"
            class="form-topic__body__item__input"
          />
          <section class="form-topic__body__item__context">
            <UnnnicInput
              v-model="newContext"
              :label="$t('conversations_dashboard.form_topic.context')"
              class="form-topic__body__item__input"
            />
            <section class="form-topic__body__item__context__description">
              <p class="form-topic__body__item__context__description__text">
                {{
                  $t('conversations_dashboard.form_topic.context_description')
                }}
              </p>
              <p class="form-topic__body__item__context__description__text">
                {{ newContext.length }}/100
              </p>
            </section>
          </section>
        </form>
        <AddTopicButton
          :text="$t('conversations_dashboard.form_topic.add_sub_topic')"
          @add-topic="handleDrawerAddSubTopic"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AddTopicButton from './AddTopicButton.vue';

const isAddTopicDrawerOpen = ref(true);

const newTopic = ref('');
const newContext = ref('');

const handleDrawerAddTopic = () => {
  isAddTopicDrawerOpen.value = true;
};

const handleDrawerAddSubTopic = () => {
  isAddTopicDrawerOpen.value = true;
};

const handleRemoveTopic = () => {
  isAddTopicDrawerOpen.value = false;
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

    &__item {
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
    }
  }
}
</style>
