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

      <div class="feedback-modal__body">
        <p class="feedback-modal__description">
          {{ t('data_feedback.description') }}
        </p>

        <UnnnicRadioGroup
          v-model="trustData"
          :label="t('data_feedback.q1')"
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
        />
      </div>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            :text="t('data_feedback.postpone')"
            type="tertiary"
          />
        </UnnnicDialogClose>

        <UnnnicButton
          :text="t('data_feedback.submit')"
          type="primary"
          :disabled="!isFormValid"
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

const { t } = useI18n();

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
}>();

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

const isFormValid = computed(
  () => !!trustData.value && !!helpDecisions.value && !!understandImpact.value,
);

function handleSubmit() {
  const feedbackData = {
    trustData: trustData.value,
    helpDecisions: helpDecisions.value,
    understandImpact: understandImpact.value,
    suggestions: suggestions.value,
  };

  console.log('Feedback submitted:', feedbackData);

  emit('update:modelValue', false);
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
