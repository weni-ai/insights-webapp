<template>
  <section class="export-footer">
    <section class="export-footer__format">
      <UnnnicLabel :label="formatLabel" />
      <UnnnicRadio
        :data-testid="'radio-format-xlsx'"
        :modelValue="selectedFormat"
        value=".xlsx"
        @update:model-value="handleFormatChange('.xlsx')"
      >
        {{ '.XLSX' }}
      </UnnnicRadio>
      <UnnnicRadio
        :data-testid="'radio-format-csv'"
        :modelValue="selectedFormat"
        value=".csv"
        @update:model-value="handleFormatChange('.csv')"
      >
        {{ '.CSV' }}
      </UnnnicRadio>
    </section>

    <section class="export-footer__terms">
      <p class="export-footer__terms-warning">
        <UnnnicIcon
          icon="alert-circle-1"
          filled
          next
          scheme="feedback-yellow"
          size="ant"
        />{{ warningTermsText }}
      </p>
      <UnnnicCheckbox
        :modelValue="acceptTerms"
        :textRight="acceptTermsText"
        @update:model-value="handleAcceptTermsChange"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import {
  UnnnicCheckbox,
  UnnnicIcon,
  UnnnicLabel,
  UnnnicRadio,
} from '@weni/unnnic-system';

type FormatType = '.csv' | '.xlsx';

interface Props {
  selectedFormat: FormatType;
  acceptTerms: boolean;
  formatLabel: string;
  warningTermsText: string;
  acceptTermsText: string;
}

withDefaults(defineProps<Props>(), {
  selectedFormat: '.xlsx',
  acceptTerms: false,
  formatLabel: '',
  warningTermsText: '',
  acceptTermsText: '',
});

const emit = defineEmits<{
  'format-change': [format: FormatType];
  'accept-terms-change': [value: boolean];
}>();

const handleFormatChange = (format: FormatType): void => {
  emit('format-change', format);
};

const handleAcceptTermsChange = (value: boolean): void => {
  emit('accept-terms-change', value);
};
</script>

<style scoped lang="scss">
.export-footer {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__format {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__terms {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__terms-warning {
    display: flex;
    gap: $unnnic-spacing-xs;

    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
