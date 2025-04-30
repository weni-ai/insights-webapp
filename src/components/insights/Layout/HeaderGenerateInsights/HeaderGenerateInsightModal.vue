<template>
  <Transition>
    <section
      v-if="show"
      ref="insightModal"
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
        data-testid="modal-content"
        @scroll="handleScroll"
      >
        <HeaderGenerateInsightText
          :text="generatedInsight"
          @typing-complete="handleTypingComplete"
        />

        <section
          v-if="showGradient"
          class="gradient-overlay"
        ></section>

        <InsightModalFooter
          :generatedInsight="generatedInsight"
          :isFeedbackSent="isFeedbackSent"
          :isRenderFooterFeedback="isRenderFooterFeedback"
          :isBtnYesActive="isBtnYesActive"
          :isBtnNoActive="isBtnNoActive"
          :isSubmitFeedbackLoading="isSubmitFeedbackLoading"
          data-testid="insight-modal-footer"
          @update-feedback-text="handleFeedbackText"
          @handle-positive-feedback="handlePositiveFeedback"
          @handle-negative-feedback="handleNegativeFeedback"
          @submit-review="submitReview"
        />
      </section>
    </section>
  </Transition>
</template>

<script>
import HeaderGenerateInsightText from './HeaderGenerateInsightText.vue';
import InsightModalFooter from './InsightModalFooter.vue';
import firebaseService from '@/services/api/resources/GPT';
import mitt from 'mitt';
import { formatSecondsToHumanString } from '@/utils/time';
import { onClickOutside } from '@vueuse/core';
import { ref } from 'vue';
import { mapActions } from 'pinia';
import { useGpt } from '@/store/modules/gpt';

const emitter = mitt();

export default {
  name: 'HeaderGenerateInsightModal',

  components: {
    HeaderGenerateInsightText,
    InsightModalFooter,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close'],

  setup(_, context) {
    const insightModal = ref(null);

    onClickOutside(insightModal, (event) => {
      if (event?.pointerType === 'mouse') context.emit('close');
    });

    return {
      insightModal,
    };
  },

  data() {
    return {
      generatedInsight: '',
      generateInsightError: false,
      showGradient: false,
      isBtnYesActive: false,
      isBtnNoActive: false,
      feedbackText: '',
      isFeedbackSent: false,
      scrollTarget: false,
      isSubmitFeedbackLoading: false,
      isRenderFeedback: false,
      emitter,
    };
  },

  computed: {
    isRenderFooterFeedback() {
      if (this.generateInsightError) return false;
      return this.isRenderFeedback;
    },
    currentDashboardWidgets() {
      return this.$store.state.widgets.currentDashboardWidgets;
    },
    insights() {
      return this.$store.state.gpt.insights;
    },
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
    ...mapActions(useGpt, ['getInsights']),
    handleTypingComplete() {
      this.isRenderFeedback = true;
    },
    async submitReview() {
      this.isSubmitFeedbackLoading = true;
      try {
        await firebaseService.createReview({
          helpful: this.isBtnYesActive ? true : false,
          comment: this.feedbackText || '',
          user: this.$store.state.user.email || '',
        });

        this.isFeedbackSent = true;
      } finally {
        this.isBtnNoActive = false;
        this.isBtnYesActive = false;
        this.isSubmitFeedbackLoading = false;
      }
    },
    handleFeedbackText(value) {
      this.feedbackText = value;
    },
    handlePositiveFeedback() {
      if (this.isBtnNoActive) this.isBtnNoActive = false;
      this.isBtnYesActive = !this.isBtnYesActive;
    },
    handleNegativeFeedback() {
      if (this.isBtnYesActive) this.isBtnYesActive = false;
      this.isBtnNoActive = !this.isBtnNoActive;
    },
    handleDynamicParam(widget) {
      const { config, data } = widget;

      if (isNaN(data?.value)) return '';

      if (config.data_type === 'sec') {
        return `${widget.name} ${formatSecondsToHumanString(Math.round(data?.value))}`;
      }

      return `${data?.value || 0} ${widget.name}`;
    },
    async generateInsight() {
      try {
        const cards = this.currentDashboardWidgets.filter(
          (e) => e.type === 'card',
        );

        const dynamicParams = cards
          .map((e) => this.handleDynamicParam(e))
          .join(', ');

        const prompt = `${this.$t('insights_header.generate_insight.prompt', {
          values: dynamicParams,
        })} ${this.$t('insights_header.generate_insight.prompt_language')}`;

        await this.getInsights({ prompt });

        const lastInsight = this.insights.slice(-1)[0];

        this.generatedInsight = lastInsight?.received.value || '';
        this.checkScroll();
        if (this.generateInsightError) this.generateInsightError = false;
      } catch (error) {
        this.generatedInsight = this.$t(
          'insights_header.generate_insight.error',
        );
        this.generateInsightError = true;
        console.error('Erro to generate insight:', error);
      }
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

  width: 32vw;
  height: 75vh;

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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: overlay;
    padding-right: $unnnic-spacing-ant;
    margin-right: -$unnnic-spacing-ant;

    &::-webkit-scrollbar {
      width: 0;
    }
  }

  .gradient-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 9rem;
    background: linear-gradient(
      359deg,
      #3b414d 0.54%,
      rgba(59, 65, 77, 0.8) 62.61%,
      rgba(59, 65, 77, 0) 91.82%
    );
    pointer-events: none;
    border-radius: $unnnic-border-radius-sm;
  }
}
</style>
