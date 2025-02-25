<!-- eslint-disable vue/no-v-html -->
<template>
  <section class="meta-template-message">
    <header class="meta-template-message__header">
      <section class="meta-template-message__container-title">
        <h2 class="meta-template-message__preview-label">
          {{ $t('template_messages_dashboard.template.preview') }}
        </h2>

        <p
          class="meta-template-message__container-title__name"
          data-testid="template-name"
        >
          {{ props.template.name }}
        </p>
        <UnnnicToolTip
          enabled
          :text="$t('template_messages_dashboard.add_to_favorites')"
          class="meta-template-message__favorite-tooltip"
          side="bottom"
        >
          <UnnnicIcon
            data-testid="template-favorite"
            class="meta-template-message__favorite-icon"
            icon="star_rate"
            scheme="aux-yellow-500"
            clickable
          />
        </UnnnicToolTip>
      </section>
      <QualityTemplateMessageFlag
        data-testid="template-quality"
        showDot
        showInfo
        :quality="props.template.quality"
      />
    </header>
    <main class="meta-template-message__container-content">
      <section class="meta-template-message__preview">
        <img
          v-if="props.template.image"
          class="meta-template-message__preview-image"
          :src="props.template.image"
          data-testid="template-image"
        />

        <h2
          class="meta-template-message__preview-title"
          data-testid="template-title"
        >
          {{ props.template.title }}
        </h2>

        <article
          class="meta-template-message__preview-text"
          data-testid="template-text"
        >
          {{ props.template.text }}
        </article>

        <p
          class="meta-template-message__preview-hint"
          data-testid="template-hint"
        >
          {{ props.template.hint }}
        </p>

        <section
          v-for="(button, index) in props.template.buttons"
          :key="index"
          class="meta-template-message__preview-link"
          data-testid="template-button"
        >
          <UnnnicIcon
            :icon="button.icon"
            scheme="aux-blue-500"
          />
          <p>{{ button.label }}</p>
        </section>
      </section>
    </main>
    <footer class="meta-template-message__edit">
      <UnnnicButton
        class="meta-template-message__edit-button"
        type="secondary"
        data-testid="template-edit-button"
        :disabled="!template.link"
        @click.stop="redirectToIntegrations()"
      >
        {{ $t('template_messages_dashboard.template.edit_template') }}
      </UnnnicButton>
    </footer>
  </section>
</template>

<script>
export default {
  name: 'MetaTemplateMessage',
};
</script>

<script setup>
import QualityTemplateMessageFlag from '../templateMessages/QualityTemplateMessageFlag.vue';

const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
});

const redirectToIntegrations = () => {
  const path = props.template.link;
  window.parent.postMessage(
    {
      event: 'redirect',
      path,
    },
    '*',
  );
};
</script>

<style lang="scss" scoped>
.meta-template-message {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;

  &__header {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
    padding: $unnnic-spacing-sm;
  }

  :deep(.unnnic-tooltip-label) {
    isolation: isolate;
  }

  &__container {
    &-title {
      display: flex;
      justify-content: space-between;
      gap: $unnnic-spacing-nano;
      align-items: end;
      color: $unnnic-color-neutral-dark;

      font-family: $unnnic-font-family-secondary;
      font-size: 14px;
      font-style: normal;
      line-height: 22px;

      &__name {
        margin-right: auto;
      }
    }
    &-content {
      background-color: $unnnic-color-background-grass;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: $unnnic-spacing-sm;
    }
  }

  &__preview {
    display: flex;
    flex-direction: column;
    padding: $unnnic-spacing-xs;
    gap: 5.35px;
    background-color: $unnnic-color-neutral-white;
    border-radius: $unnnic-border-radius-sm;

    &-image {
      object-fit: cover;
      width: 100%;
    }

    &-title {
      color: $unnnic-color-neutral-black;
      font-family: $unnnic-font-family-secondary;
      font-size: 10.692px;
      font-weight: $unnnic-font-weight-bold;
      line-height: 16.037px;
    }

    &-text {
      color: $unnnic-color-neutral-black;
      font-family: $unnnic-font-family-secondary;
      font-size: 10.692px;
      line-height: 16.037px;
      word-break: break-word;
    }

    &-hint {
      color: $unnnic-color-neutral-clean;
      text-align: right;
      font-family: $unnnic-font-family-secondary;
      font-size: 9.355px;
      line-height: 14.701px;
    }

    &-link {
      display: flex;
      gap: $unnnic-spacing-nano;
      color: $unnnic-color-aux-blue-500;
      align-items: center;
      justify-content: center;
      border-top: 1px solid $unnnic-color-neutral-soft;
      padding: 5.35px 0;
    }
  }

  &__edit {
    display: flex;
    width: 100%;
    padding: $unnnic-spacing-sm;
    background-color: $unnnic-color-background-grass;
    &-button {
      width: 100%;
    }
  }

  &__preview-label {
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-font-size-body-sm;
  }
}
</style>
