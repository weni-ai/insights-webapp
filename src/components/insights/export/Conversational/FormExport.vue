<template>
  <section class="conversational-export-form">
    <header>
      <p class="conversational-export-form__description">
        {{ $t('export_data.description') }}
      </p>
    </header>
    <section class="conversational-export-form__content">
      <ExportFilterDate
        v-model="date_range"
        :label="$t('export_data.select_data.label')"
        :placeholder="$t('export_data.select_period.placeholder')"
        :options="shortCutOptions"
        :minDate="getMinDate()"
        :maxDate="getMaxDate()"
        @update:model-value="updateDateRange"
      />

      <FormCheckbox />

      <ExportFooter
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getLastNDays, getTodayDate } from '@/utils/time';

const conversationalExport = useConversationalExport();
const { setDateRange, setType, setAcceptTerms } = conversationalExport;
const { date_range, type, accept_terms } = storeToRefs(conversationalExport);

const { t } = useI18n();

const selectedFormat = computed(() => {
  return type.value === 'CSV' ? '.csv' : '.xlsx';
});

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
  const minDate = getLastNDays(90).start;
  return minDate;
};

const getMaxDate = (): string => {
  const maxDate = getTodayDate().start;
  return maxDate;
};

const updateDateRange = (value: { start: string; end: string }) => {
  setDateRange(value.start, value.end);
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
