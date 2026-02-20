<template>
  <UnnnicDialog
    :open="modelValue"
    @update:open="emit('update:modelValue', $event)"
  >
    <UnnnicDialogContent size="large">
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ t('data_feedback.title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <div
        class="feedback-modal__body"
        data-testid="feedback-modal-body"
      >
        <p
          class="feedback-modal__description"
          data-testid="feedback-modal-description"
        >
          {{ t('data_feedback.description') }}
        </p>

        <UnnnicRadioGroup
          v-model="trustData"
          :label="t('data_feedback.q1')"
          data-testid="feedback-radio-trust"
        >
          <UnnnicRadio
            v-for="option in likertOptions"
            :key="option.value"
            :value="option.value"
            :label="t(option.labelKey)"
          />
        </UnnnicRadioGroup>

        <UnnnicRadioGroup
          v-model="helpDecisions"
          :label="t('data_feedback.q2')"
          data-testid="feedback-radio-decisions"
        >
          <UnnnicRadio
            v-for="option in likertOptions"
            :key="option.value"
            :value="option.value"
            :label="t(option.labelKey)"
          />
        </UnnnicRadioGroup>

        <UnnnicRadioGroup
          v-model="understandImpact"
          :label="t('data_feedback.q3')"
          data-testid="feedback-radio-impact"
        >
          <UnnnicRadio
            v-for="option in likertOptions"
            :key="option.value"
            :value="option.value"
            :label="t(option.labelKey)"
          />
        </UnnnicRadioGroup>

        <UnnnicTextArea
          v-model="suggestions"
          :label="t('data_feedback.textarea_label')"
          :placeholder="t('data_feedback.textarea_placeholder')"
          :maxLength="1000"
          data-testid="feedback-textarea"
        />
      </div>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            :text="t('data_feedback.postpone')"
            type="tertiary"
            data-testid="feedback-postpone-button"
            @click="handlePostpone"
          />
        </UnnnicDialogClose>

        <UnnnicButton
          :text="t('data_feedback.submit')"
          type="primary"
          :disabled="!isFormValid || isSubmitting"
          data-testid="feedback-submit-button"
          @click="handleSubmit"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  UnnnicDialog,
  UnnnicDialogContent,
  UnnnicDialogHeader,
  UnnnicDialogTitle,
  UnnnicDialogFooter,
  UnnnicDialogClose,
  UnnnicButton,
  UnnnicRadioGroup,
  UnnnicRadio,
  UnnnicTextArea,
} from '@weni/unnnic-system';
import { useDashboards } from '@/store/modules/dashboards';
import feedbackApi, {
  DashboardType,
  FormType,
  Reference,
} from '@/services/api/resources/conversational/feedback';

const { t } = useI18n();

interface Props {
  modelValue: boolean;
  surveyUuid: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'postpone'): void;
  (_e: 'submitted'): void;
}>();

const scoreMap: Record<string, string> = {
  strongly_agree: '5',
  partially_agree: '4',
  neutral: '3',
  partially_disagree: '2',
  strongly_disagree: '1',
};

const likertOptions = [
  { value: 'strongly_agree', labelKey: 'data_feedback.strongly_agree' },
  { value: 'partially_agree', labelKey: 'data_feedback.partially_agree' },
  { value: 'neutral', labelKey: 'data_feedback.neutral' },
  {
    value: 'partially_disagree',
    labelKey: 'data_feedback.partially_disagree',
  },
  {
    value: 'strongly_disagree',
    labelKey: 'data_feedback.strongly_disagree',
  },
];

const trustData = ref<string>('');
const helpDecisions = ref<string>('');
const understandImpact = ref<string>('');
const suggestions = ref<string>('');
const isSubmitting = ref(false);

const isFormValid = computed(
  () => !!trustData.value && !!helpDecisions.value && !!understandImpact.value,
);

function handlePostpone() {
  emit('postpone');
}

async function handleSubmit() {
  if (isSubmitting.value) return;

  const { currentDashboard } = useDashboards();

  isSubmitting.value = true;

  try {
    await feedbackApi.submitFeedback({
      type: DashboardType.CONVERSATIONAL,
      dashboard: currentDashboard.uuid,
      survey: props.surveyUuid,
      answers: [
        {
          reference: Reference.TRUST,
          answer: scoreMap[trustData.value],
          type: FormType.SCORE_1_5,
        },
        {
          reference: Reference.MAKE_DECISION,
          answer: scoreMap[helpDecisions.value],
          type: FormType.SCORE_1_5,
        },
        {
          reference: Reference.ROI,
          answer: scoreMap[understandImpact.value],
          type: FormType.SCORE_1_5,
        },
        {
          reference: Reference.COMMENT,
          answer: suggestions.value,
          type: FormType.TEXT,
        },
      ],
    });

    emit('submitted');
    emit('update:modelValue', false);
  } catch (error) {
    console.error('Failed to submit feedback:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.feedback-modal {
  &__body {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-6;
    padding: $unnnic-space-6;
  }

  &__description {
    margin: 0;
    font: $unnnic-font-emphasis;
    color: $unnnic-color-fg-base;
  }
}
</style>
