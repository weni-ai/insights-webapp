<template>
  <section
    class="conversational-export-form"
    data-testid="conversational-export-form"
  >
    <header>
      <p
        class="conversational-export-form__description"
        data-testid="conversational-export-form-description"
      >
        {{ $t('export_data.description') }}
      </p>
    </header>
    <section
      class="conversational-export-form__content"
      data-testid="conversational-export-form-content"
    >
      <ExportFilterDate
        v-model="date_range"
        data-testid="conversational-export-filter-date"
        :label="$t('export_data.select_data.label')"
        :placeholder="$t('export_data.select_period.placeholder')"
        :options="shortCutOptions"
        :minDate="getMinDate()"
        :maxDate="getMaxDate()"
        @update:model-value="updateDateRange"
        @select-date="updateSelectDateRange"
      />

      <FormCheckbox data-testid="conversational-form-checkbox-component" />

      <ExportFooter
        data-testid="conversational-export-footer"
        :selectedFormat="selectedFormat"
        :acceptTerms="accept_terms"
        :formatLabel="$t('export_data.select_format')"
        :warningTermsText="$t('export_data.warning_terms')"
        :acceptTermsText="$t('export_data.accept_terms')"
        @format-change="updateFormat"
        @accept-terms-change="updateAcceptTerms"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import ExportFilterDate from '../ExportFilterDate.vue';
import ExportFooter from '../ExportFooter.vue';
import FormCheckbox from './FormCheckbox.vue';
import { useConversationalExport } from '@/store/modules/export/conversational/export';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, subDays, addDays, isValid, parseISO, isAfter } from 'date-fns';

const conversationalExport = useConversationalExport();
const { setDateRange, setType, setAcceptTerms } = conversationalExport;
const { date_range, type, accept_terms } = storeToRefs(conversationalExport);

const { t } = useI18n();

const selectedFormat = computed(() => {
  return type.value === 'CSV' ? '.csv' : '.xlsx';
});

const selectDateRange = ref({ start: '', end: '' });

const shortCutOptions = computed(() => [
  {
    name: t('export_data.select_data.shortcuts.last_7_days'),
    id: 'last-7-days',
  },
  {
    name: t('export_data.select_data.shortcuts.last_14_days'),
    id: 'last-14-days',
  },
  {
    name: t('export_data.select_data.shortcuts.last_30_days'),
    id: 'last-30-days',
  },
  {
    name: t('export_data.select_data.shortcuts.last_60_days'),
    id: 'last-60-days',
  },
  {
    name: t('export_data.select_data.shortcuts.last_90_days'),
    id: 'last-90-days',
  },
  {
    name: t('export_data.select_data.shortcuts.current_month'),
    id: 'current-month',
  },
  {
    name: t('export_data.select_data.shortcuts.previous_month'),
    id: 'previous-month',
  },
]);

const getMinDate = (): string => {
  const currentSelection = selectDateRange.value;

  const defaultMin = format(subDays(new Date(), 92), 'yyyy-MM-dd');

  if (currentSelection.start === '' && currentSelection.end === '') {
    return null;
  }

  if (!currentSelection || !currentSelection.start) {
    return defaultMin;
  }

  const startDate = parseISO(currentSelection.start);

  if (
    isValid(startDate) &&
    (!currentSelection.end || currentSelection.start === currentSelection.end)
  ) {
    const calculatedMin = format(subDays(startDate, 92), 'yyyy-MM-dd');
    const calculatedMinDate = parseISO(calculatedMin);
    return isValid(calculatedMinDate) ? calculatedMin : defaultMin;
  }

  if (!isValid(startDate)) {
    return null;
  }

  if (isValid(startDate) && defaultMin !== format(startDate, 'yyyy-MM-dd')) {
    return format(subDays(startDate, 92), 'yyyy-MM-dd');
  }

  return defaultMin;
};

const getMaxDate = (): string => {
  const today = new Date();
  const currentSelection = selectDateRange.value;
  const defaultMax = format(today, 'yyyy-MM-dd');

  if (!currentSelection || !currentSelection.start) {
    return defaultMax;
  }

  const startDate = parseISO(currentSelection.start);

  if (
    isValid(startDate) &&
    (!currentSelection.end || currentSelection.start === currentSelection.end)
  ) {
    const calculatedMax = addDays(startDate, 92);
    if (isAfter(calculatedMax, today)) {
      return defaultMax;
    }
    return format(calculatedMax, 'yyyy-MM-dd');
  }

  return defaultMax;
};

const updateDateRange = (value: { start: string; end: string }) => {
  setDateRange(value.start, value.end);
};

const updateSelectDateRange = (value: { start: string; end: string }) => {
  selectDateRange.value = value;
};

const updateFormat = (format: '.csv' | '.xlsx') => {
  setType(format === '.csv' ? 'CSV' : 'XLSX');
};

const updateAcceptTerms = (value: boolean) => {
  setAcceptTerms(value);
};
</script>

<style scoped lang="scss">
.conversational-export-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  background: $unnnic-color-neutral-white;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    :deep(.unnnic-label__label) {
      margin: 0;
    }
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
