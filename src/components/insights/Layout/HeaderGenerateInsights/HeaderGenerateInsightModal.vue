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

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { onClickOutside } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import mitt from 'mitt';

import { useGpt } from '@/store/modules/gpt';
import { useWidgets } from '@/store/modules/widgets';
import { useUser } from '@/store/modules/user';

import HeaderGenerateInsightText from './HeaderGenerateInsightText.vue';
import InsightModalFooter from './InsightModalFooter.vue';

import firebaseService from '@/services/api/resources/GPT';
import { formatSecondsToHumanString } from '@/utils/time';

defineOptions({ name: 'HeaderGenerateInsightModal' });

interface InsightWidget {
  type?: string;
  name?: string;
  config?: { data_type?: string };
  data?: { value?: number | string | null };
}

interface HeaderGenerateInsightModalProps {
  show?: boolean;
}

const props = withDefaults(defineProps<HeaderGenerateInsightModalProps>(), {
  show: false,
});

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const widgetsStore = useWidgets();
const gptStore = useGpt();
const { currentDashboardWidgets } = storeToRefs(widgetsStore);
const { insights } = storeToRefs(gptStore);

const emitter = mitt();

const insightModal = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
let observer: MutationObserver | null = null;

onClickOutside(insightModal, (event) => {
  if ((event as PointerEvent)?.pointerType === 'mouse') emit('close');
});

const generatedInsight = ref('');
const generateInsightError = ref(false);
const showGradient = ref(false);
const isBtnYesActive = ref(false);
const isBtnNoActive = ref(false);
const feedbackText = ref('');
const isFeedbackSent = ref(false);
const isSubmitFeedbackLoading = ref(false);
const isRenderFeedback = ref(false);

const isRenderFooterFeedback = computed(() => {
  if (generateInsightError.value) return false;
  return isRenderFeedback.value;
});

const handleTypingComplete = () => {
  isRenderFeedback.value = true;
};

const submitReview = async () => {
  const userStore = useUser();
  isSubmitFeedbackLoading.value = true;
  try {
    await firebaseService.createReview({
      helpful: isBtnYesActive.value,
      comment: feedbackText.value || '',
      user: userStore.email || '',
    });

    isFeedbackSent.value = true;
  } finally {
    isBtnNoActive.value = false;
    isBtnYesActive.value = false;
    isSubmitFeedbackLoading.value = false;
  }
};

const handleFeedbackText = (value: string) => {
  feedbackText.value = value;
};

const handlePositiveFeedback = () => {
  if (isBtnNoActive.value) isBtnNoActive.value = false;
  isBtnYesActive.value = !isBtnYesActive.value;
};

const handleNegativeFeedback = () => {
  if (isBtnYesActive.value) isBtnYesActive.value = false;
  isBtnNoActive.value = !isBtnNoActive.value;
};

const handleDynamicParam = (widget: InsightWidget) => {
  const { config, data } = widget;

  if (Number.isNaN(Number(data?.value))) return '';

  if (config?.data_type === 'sec') {
    return `${widget.name} ${formatSecondsToHumanString(Math.round(Number(data?.value)))}`;
  }

  return `${data?.value || 0} ${widget.name}`;
};

const generateInsight = async () => {
  try {
    const cards = currentDashboardWidgets.value.filter(
      (e: InsightWidget) => e.type === 'card',
    );

    const dynamicParams = cards
      .map((e: InsightWidget) => handleDynamicParam(e))
      .join(', ');

    const prompt = `${t('insights_header.generate_insight.prompt', {
      values: dynamicParams,
    })} ${t('insights_header.generate_insight.prompt_language')}`;

    await gptStore.getInsights({ prompt });

    const lastInsight = insights.value.slice(-1)[0];

    generatedInsight.value = lastInsight?.received.value || '';
    checkScroll();
    if (generateInsightError.value) generateInsightError.value = false;
  } catch (error) {
    generatedInsight.value = t('insights_header.generate_insight.error');
    generateInsightError.value = true;
    console.error('Erro to generate insight:', error);
  }
};

const cleanupObserver = () => {
  if (observer) {
    observer.disconnect();
  }
};

const checkScroll = () => {
  nextTick(() => {
    const contentEl = content.value;
    if (!contentEl) return;

    const secondSection = contentEl.querySelectorAll('section')[0];
    if (!secondSection) return;

    const updateScrollStatus = () => {
      const scrollHeight = secondSection.scrollHeight;
      const clientHeight = contentEl.clientHeight;

      showGradient.value = scrollHeight > clientHeight;
    };

    observer = new MutationObserver(() => {
      updateScrollStatus();
    });

    observer.observe(secondSection, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    updateScrollStatus();

    emitter.on('cleanup', () => {
      cleanupObserver();
    });
  });
};

const handleScroll = () => {
  const contentEl = content.value;
  if (!contentEl) return;

  const scrollTop = contentEl.scrollTop;
  const scrollHeight = contentEl.scrollHeight;
  const clientHeight = contentEl.clientHeight;
  if (scrollTop + clientHeight >= scrollHeight - 1) {
    showGradient.value = false;
  } else {
    showGradient.value = true;
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow && !generatedInsight.value) {
      generateInsight();
    }

    if (newShow) {
      nextTick(() => {
        checkScroll();
      });
    }
  },
);

onMounted(() => {
  nextTick(() => {
    checkScroll();
  });
  window.addEventListener('resize', checkScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScroll);
  cleanupObserver();
});
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

  box-shadow: $unnnic-shadow-1;
  border-radius: $unnnic-radius-1;
  padding: $unnnic-space-6;

  width: 32vw;
  height: 75vh;

  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: $unnnic-space-4;

  background: $unnnic-color-gray-12;

  cursor: default;

  &__header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: $unnnic-space-4;

    .header__title {
      display: flex;
      align-items: center;
      gap: $unnnic-space-2;

      color: $unnnic-color-teal-5;
      font: $unnnic-font-display-2;
    }

    .header__close-button {
      border: none;
      background-color: transparent;

      width: 38px;
      height: 38px;

      padding: $unnnic-space-1;
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
    padding-right: $unnnic-space-3;
    margin-right: -$unnnic-space-3;

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
      $unnnic-color-gray-10 0.54%,
      rgba(59, 65, 77, 0.8) 62.61%,
      rgba(59, 65, 77, 0) 91.82%
    );
    pointer-events: none;
    border-radius: $unnnic-radius-1;
  }
}
</style>
