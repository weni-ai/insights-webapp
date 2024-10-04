<template>
  <footer
    v-if="generatedInsight"
    class="content__footer"
  >
    <p class="footer__description">
      {{ $t('insights_header.generate_insight.by_ai') }}
    </p>

    <p
      v-if="isFeedbackSent"
      class="feedback_sent"
    >
      ✨{{ $t('insights_header.generate_insight.feedback.complete') }}
    </p>
    <section
      v-if="isFeedbackSent"
      ref="scrollTarget"
    ></section>
    <section
      v-else-if="isRenderFooterFeedback"
      class="footer__feedback"
    >
      <p class="footer__feedback__text">
        {{ $t('insights_header.generate_insight.feedback.question') }}
      </p>
      <section class="footer__feedback__container__btns">
        <UnnnicButton
          type="tertiary"
          iconLeft="thumb_up"
          :text="$t('insights_header.generate_insight.button.yes')"
          :class="[
            'footer__feedback__btn',
            { 'footer__feedback__btn-active': isBtnYesActive },
          ]"
          data-test="feedback-positive-btn"
          @click.stop="handlePositiveFeedback"
        />
        <UnnnicButton
          type="tertiary"
          iconLeft="thumb_down"
          :text="$t('insights_header.generate_insight.button.no')"
          :class="[
            'footer__feedback__btn',
            { 'footer__feedback__btn-active': isBtnNoActive },
          ]"
          data-test="feedback-negative-btn"
          @click.stop="handleNegativeFeedback"
        />
      </section>
      <section
        v-if="isBtnNoActive || isBtnYesActive"
        class="footer__feedback__container__area"
      >
        <textarea
          :value="feedbackText"
          rows="7"
          class="footer__feedback__textarea"
          :placeholder="handlePlaceholderTextArea()"
          :disabled="isSubmitFeedbackLoading"
        />
        <UnnnicButton
          type="tertiary"
          :text="$t('insights_header.generate_insight.button.send')"
          class="footer__feedback__btn_send"
          data-test="send-btn"
          :disabled="isSubmitFeedbackLoading"
          :loading="isSubmitFeedbackLoading"
          @click="submitReview"
        />
      </section>
    </section>
  </footer>
</template>

<script>
export default {
  name: 'InsightModalFooter',
  props: {
    generatedInsight: {
      type: String,
      required: true,
    },
    isFeedbackSent: {
      type: Boolean,
      required: true,
    },
    isRenderFooterFeedback: {
      type: Boolean,
      required: true,
    },
    isBtnYesActive: {
      type: Boolean,
      required: true,
    },
    isBtnNoActive: {
      type: Boolean,
      required: true,
    },
    feedbackText: {
      type: String,
      required: true,
    },
    isSubmitFeedbackLoading: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'handle-negative-feedback',
    'handle-positive-feedback',
    'submit-review',
  ],
  watch: {
    isFeedbackSent() {
      this.$nextTick(() => {
        this.scrollToEnd();
      });
    },
  },
  methods: {
    scrollToEnd() {
      if (this.$refs.scrollTarget) {
        this.$refs.scrollTarget.scrollIntoView({ behavior: 'smooth' });
      }
    },
    handlePositiveFeedback() {
      this.$emit('handle-positive-feedback');
    },
    handleNegativeFeedback() {
      this.$emit('handle-negative-feedback');
    },
    handlePlaceholderTextArea() {
      return this.isBtnYesActive
        ? this.$t('insights_header.generate_insight.input.placeholder_positive')
        : this.$t(
            'insights_header.generate_insight.input.placeholder_negative',
          );
    },
    submitReview() {
      this.$emit('submit-review');
    },
  },
};
</script>

<style scoped lang="scss">
.content__footer {
  display: flex;
  flex-direction: column;
  justify-content: end;
  max-height: 100%;

  .footer__description {
    color: $unnnic-color-neutral-clean;
    text-align: right;
    font-size: $unnnic-font-size-body-md;
  }

  .feedback_sent {
    text-align: start;
    color: $unnnic-color-neutral-white;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-style: normal;
    font-weight: $unnnic-font-weight-bold;
  }

  .footer__feedback {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: 100%;
    margin-top: $unnnic-spacing-sm;
    gap: $unnnic-spacing-sm;

    &::-webkit-scrollbar {
      width: 0;
    }

    &__text {
      display: flex;
      align-items: flex-start;
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-clean;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
    }

    &__container__btns {
      display: flex;
      align-items: flex-start;
      gap: $unnnic-spacing-ant;
    }

    &__container__area {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-sm;
    }

    &__textarea {
      border-radius: $unnnic-border-radius-sm;
      border: 1px solid $unnnic-color-neutral-dark;
      background: $unnnic-color-neutral-darkest;
      display: flex;
      padding: $unnnic-spacing-ant $unnnic-spacing-sm;
      align-items: flex-start;
      align-self: stretch;

      &::placeholder {
        color: $unnnic-color-neutral-cloudy;
      }

      color: $unnnic-color-neutral-clean;

      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      font-style: normal;
      font-weight: $unnnic-font-weight-regular;

      &:focus {
        border-radius: 0.25rem;
        border: 1px solid $unnnic-color-neutral-cloudy;
        background: $unnnic-color-neutral-darkest;
      }

      &:focus-visible {
        outline: none;
        outline-offset: 0;
      }
    }

    &__btn_send {
      display: flex;
      padding: $unnnic-spacing-ant $unnnic-spacing-sm;
      justify-content: center;
      align-items: center;
      gap: $unnnic-spacing-nano;

      border-radius: $unnnic-border-radius-sm;
      border: 1px solid $unnnic-color-neutral-cloudy;
      background: $unnnic-color-neutral-dark;
      color: $unnnic-color-neutral-cleanest;

      &:hover {
        border: 1px solid $unnnic-color-neutral-clean;
      }

      &:disabled {
        color: $unnnic-color-neutral-cloudy;
        border: 1px solid $unnnic-color-neutral-dark;
        background: $unnnic-color-neutral-darkest;
      }
    }
  }
}

.content__footer .footer__feedback .footer__feedback__btn {
  border-radius: $unnnic-border-radius-sm;
  border: 1px solid $unnnic-color-neutral-dark;
  background: $unnnic-color-neutral-darkest;
  color: $unnnic-color-neutral-clean;
  &:active,
  &:hover {
    background-color: inherit;
    border: 1px solid $unnnic-color-neutral-cloudy;
  }

  :deep(.material-symbols-rounded.unnnic-icon-scheme--neutral-dark) {
    color: $unnnic-color-neutral-clean;
  }

  &:deep(.unnnic-button__label) {
    color: $unnnic-color-neutral-clean;
  }

  &-active {
    border: 1px solid $unnnic-color-neutral-cloudy;
    &:deep(.unnnic-button__label) {
      color: $unnnic-color-neutral-cleanest;
    }

    &:deep(.material-symbols-rounded.unnnic-icon-scheme--neutral-dark) {
      color: $unnnic-color-neutral-cleanest;
      font-family: Material Symbols Rounded Filled;
    }
  }
}

.content__footer .footer__feedback .footer__feedback__btn_send {
  &:active,
  &:hover {
    background: $unnnic-color-neutral-cloudy;
  }
}
</style>
