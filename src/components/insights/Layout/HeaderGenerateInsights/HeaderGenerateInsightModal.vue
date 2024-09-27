<template>
  <Transition>
    <section
      v-if="show"
      class="header-generate-insight-modal"
      @click.stop
    >
      <header class="header-generate-insight-modal__header">
        <section class="header__title">
          <img src="@/assets/images/shine.svg" />
          Insight
        </section>
        <button
          class="header__close-button"
          @click="$emit('close')"
        >
          <UnnnicIcon
            icon="close"
            scheme="neutral-clean"
            size="avatar-nano"
          />
        </button>
      </header>

      <section
        ref="content"
        class="header-generate-insight-modal__content"
        @scroll="handleScroll"
      >
        <HeaderGenerateInsightText :text="generatedInsight" />

        <div
          v-if="showGradient"
          class="gradient-overlay"
        ></div>

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
            v-else
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
                @click.stop="handleNegativeFeedback"
              />
            </section>
            <section
              v-if="isBtnNoActive || isBtnYesActive"
              class="footer__feedback__container__area"
            >
              <textarea
                rows="7"
                class="footer__feedback__textarea"
                :placeholder="handlePlaceholderTextArea()"
              />
              <UnnnicButton
                type="tertiary"
                :text="$t('insights_header.generate_insight.button.send')"
                class="footer__feedback__btn_send"
                disabled
              />
            </section>
          </section>
        </footer>
      </section>
    </section>
  </Transition>
</template>

<script>
import HeaderGenerateInsightText from './HeaderGenerateInsightText.vue';
import mitt from 'mitt';

const emitter = mitt();

export default {
  name: 'HeaderGenerateInsightModal',

  components: {
    HeaderGenerateInsightText,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close'],

  data() {
    return {
      generatedInsight: '',
      showGradient: false,
      isBtnYesActive: false,
      isBtnNoActive: false,
      isFeedbackSent: false,
    };
  },

  watch: {
    show(newShow) {
      if (newShow && !this.generatedInsight) {
        this.generateInsight();
      }

      if (newShow) {
        this.$nextTick(() => {
          this.checkScroll();
        });
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.checkScroll();
    });
    window.addEventListener('resize', this.checkScroll);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScroll);
    this.cleanupObserver();
  },

  methods: {
    handlePlaceholderTextArea() {
      if (this.isBtnYesActive)
        return this.$t(
          'insights_header.generate_insight.input.placeholder_positive',
        );

      return this.$t(
        'insights_header.generate_insight.input.placeholder_negative',
      );
    },
    handlePositiveFeedback() {
      if (this.isBtnNoActive) this.isBtnNoActive = false;
      this.isBtnYesActive = !this.isBtnYesActive;
    },
    handleNegativeFeedback() {
      if (this.isBtnYesActive) this.isBtnYesActive = false;
      this.isBtnNoActive = !this.isBtnNoActive;
    },
    generateInsight() {
      // TODO: Remove this mock when text generation by AI is implemented
      setTimeout(() => {
        this.generatedInsight =
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dictum mauris volutpat, ornare quam vel, scelerisque est. Nulla nulla neque, scelerisque ac velit tincidunt, dapibus accumsan quam. Quisque aliquam nulla interdum arcu aliquet molestie. Curabitur lobortis maximus fringilla. Phasellus nec dolor efficitur, mattis ipsum eu, volutpat urna. In cursus, lacus nec semper sagittis, felis ante viverra ante, sit amet lacinia metus purus non diam. Vivamus quis fringilla leo. Proin mattis aliquet risus. <br/><br/> Vestibulum tincidunt, ipsum ut tempor luctus, sapien elit laoreet mi, quis ornare lacus urna quis erat. Duis et imperdiet massa. Nunc fringilla efficitur tellus, a cursus odio suscipit vel. Ut tempus metus elit, non lobortis nisi ultrices nec. Proin sem arcu, ultrices in rutrum ac, pulvinar sit amet magna. Pellentesque non lacus in lacus sollicitudin ultrices. Morbi commodo et lectus in scelerisque. Aliquam scelerisque nisi arcu, ut scelerisque tortor pulvinar vitae. Suspendisse tempor tincidunt turpis. Vestibulum vehicula ante at odio facilisis lacinia. <br/><br/> Integer ut diam feugiat, faucibus neque sit amet, pretium lectus. Quisque vel libero consequat est interdum lacinia. Proin volutpat, elit et lacinia tincidunt, est est ullamcorper neque, quis pharetra nisi lectus eu nisi. Donec diam urna, aliquam et pellentesque sed, congue sit amet ligula. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras dictum mauris volutpat, ornare quam vel, scelerisque est. Nulla nulla neque, scelerisque ac velit tincidunt, dapibus accumsan quam. Quisque aliquam nulla interdum arcu aliquet molestie.';
        this.checkScroll();
      }, 3000);
    },
    checkScroll() {
      this.$nextTick(() => {
        const content = this.$refs.content;
        if (!content) return;

        const secondSection = content.querySelectorAll('section')[0];
        if (!secondSection) return;

        const updateScrollStatus = () => {
          const scrollHeight = secondSection.scrollHeight;
          const clientHeight = content.clientHeight;

          this.showGradient = scrollHeight > clientHeight;
        };

        this.observer = new MutationObserver(() => {
          updateScrollStatus();
        });

        this.observer.observe(secondSection, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        updateScrollStatus();

        emitter.on('cleanup', () => {
          this.cleanupObserver();
        });
      });
    },
    cleanupObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }
    },
    handleScroll() {
      const content = this.$refs.content;
      const scrollTop = content.scrollTop;
      const scrollHeight = content.scrollHeight;
      const clientHeight = content.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 1) {
        this.showGradient = false;
      } else {
        this.showGradient = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.header-generate-insight-modal {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 999;

  box-shadow: $unnnic-shadow-level-far;
  border-radius: $unnnic-border-radius-sm;
  padding: $unnnic-spacing-md;

  width: 35vw;
  height: 55vh;

  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: $unnnic-spacing-sm;

  background: $unnnic-color-neutral-darkest;

  cursor: default;

  &__header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: $unnnic-spacing-sm;

    .header__title {
      display: flex;
      align-items: center;
      gap: $unnnic-spacing-xs;

      color: $unnnic-color-weni-300;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
    }

    .header__close-button {
      border: none;
      background-color: transparent;

      width: 38px;
      height: 38px;

      padding: $unnnic-spacing-nano;
      display: flex;
      align-items: center;
      justify-content: center;

      cursor: pointer;
    }
  }

  &__content {
    overflow-y: overlay;
    padding-right: $unnnic-spacing-ant;
    margin-right: -$unnnic-spacing-ant;

    &::-webkit-scrollbar {
      width: 0;
    }

    .content__footer {
      display: flex;
      flex-direction: column;
      justify-content: end;

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
        margin-top: $unnnic-spacing-sm;
        gap: $unnnic-spacing-sm;

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

        &__btn {
          border-radius: $unnnic-border-radius-sm;
          border: 1px solid $unnnic-color-neutral-dark;
          background: $unnnic-color-neutral-darkest;

          &:hover {
            border: 1px solid $unnnic-color-neutral-cloudy;
            background-color: inherit;
          }

          &-active {
            color: $unnnic-color-neutral-cleanest;
            :deep(.material-symbols-rounded.unnnic-icon-scheme--neutral-dark) {
              color: $unnnic-color-neutral-cleanest;
              font-family: Material Symbols Rounded Filled;
            }
          }
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
            background: $unnnic-color-neutral-cloudy;
          }

          &:disabled {
            color: $unnnic-color-neutral-cloudy;
            border: 1px solid $unnnic-color-neutral-dark;
            background: $unnnic-color-neutral-darkest;
          }
        }
      }
    }
  }

  .gradient-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 7rem;
    background: linear-gradient(
      359deg,
      #3b414d 0.54%,
      rgba(59, 65, 77, 0.8) 62.61%,
      rgba(59, 65, 77, 0) 91.82%
    );
    pointer-events: none;
  }
}
</style>
