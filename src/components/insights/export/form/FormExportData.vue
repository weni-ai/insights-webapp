<template>
  <section class="export-data-form">
    <header>
      <p class="export-data-form__description">
        {{ $t('export_data.description') }}
      </p>
    </header>
    <section class="export-data-form__content">
      <UnnnicLabel :label="$t('export_data.select_data.label')" />
      <FilterDate
        v-model="dateRange"
        :placeholder="$t('export_data.select_data.placeholder')"
        @update:model-value="updateDateRange"
      />

      <section class="export-data-form__chats-status">
        <UnnnicRadio
          :data-testid="'radio-chats-open'"
          :modelValue="selectedChatStatus"
          value="open"
          @update:model-value="updateChatStatus('open')"
        >
          {{ $t('export_data.chats_open') }}
        </UnnnicRadio>
        <UnnnicRadio
          :data-testid="'radio-chats-closed'"
          :modelValue="selectedChatStatus"
          value="closed"
          @update:model-value="updateChatStatus('closed')"
        >
          {{ $t('export_data.chats_closed') }}
        </UnnnicRadio>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import FilterDate from '@/components/insights/Layout/HeaderFilters/FilterDate.vue';
import { useExportData } from '@/store/modules/export/exportData';
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

const exportDataStore = useExportData();
const { setStatusChats, setDateRange } = exportDataStore;
const { open_chats } = storeToRefs(exportDataStore);

const dateRange = ref({
  start: '',
  end: '',
});

const selectedChatStatus = computed(() => {
  return open_chats.value ? 'open' : 'closed';
});

const updateDateRange = (value: { start: string; end: string }) => {
  dateRange.value = value;
  setDateRange(value.start, value.end);
  console.log('Date range updated:', value);
};

const updateChatStatus = (status: string) => {
  setStatusChats(status === 'open');
};
</script>

<style scoped lang="scss">
.export-data-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  background: $unnnic-color-neutral-white;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__chats-status {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }
}
</style>
