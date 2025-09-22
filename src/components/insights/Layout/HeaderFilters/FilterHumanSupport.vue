<template>
  <section class="filter-human-support">
    <UnnnicDropdown
      class="actions__dropdown"
      data-testid="actions-dropdown"
      :useOpenProp="true"
      :open="isOpenDropdown"
      :forceOpen="isOptionsActive"
      @update:open="handleDropdownToggle"
    >
      <template #trigger>
        <UnnnicButton
          data-testid="filter-human-support-button"
          type="secondary"
          iconLeft="filter_list"
          :text="titleButtonFilters"
        />
      </template>

      <section
        class="filter-human-support__filters"
        @click.stop
      >
        <section class="filter-human-support__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.sector')" />
          <FilterMultiSelect
            v-model="sectors"
            :placeholder="$t('export_data.filters.select_sector')"
            source="sectors"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_sectors')"
            @update:model-value="updateSectors"
            @on-options-active-change="handleOptionsActiveChange"
          />
        </section>

        <section class="filter-human-support__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.queue')" />
          <FilterMultiSelect
            v-model="queues"
            :placeholder="$t('export_data.filters.select_queue')"
            source="queues"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_queues')"
            :disabled="!hasSectorsSelected || isManySectorsSelected"
            :dependsOnValue="dependsOnValueQueues"
            @on-options-active-change="handleOptionsActiveChange"
          />
        </section>

        <section class="filter-human-support__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.tag')" />
          <FilterMultiSelect
            v-model="tags"
            :placeholder="$t('export_data.filters.select_tag')"
            source="tags"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_tags')"
            :disabled="!hasSectorsSelected || isManySectorsSelected"
            :dependsOnValue="dependsOnValueTags"
            @on-options-active-change="handleOptionsActiveChange"
          />
        </section>

        <section class="filter-human-support__filters-footer">
          <UnnnicButton
            class="filter-human-support__filters-footer__button"
            text="Limpar"
            type="tertiary"
            @click="clearFiltersButton"
          />
          <UnnnicButton
            class="filter-human-support__filters-footer__button"
            text="Filtrar"
            type="primary"
            @click="applyFiltersButton"
          />
        </section>
      </section>
    </UnnnicDropdown>
  </section>
</template>

<script setup lang="ts">
import { UnnnicButton, UnnnicLabel, UnnnicDropdown } from '@weni/unnnic-system';
import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

const humanSupportMonitoring = useHumanSupportMonitoring();
const { clearFilters, saveAppliedFilters } = humanSupportMonitoring;
const { appliedFiltersLength, sectors, queues, tags } = storeToRefs(
  humanSupportMonitoring,
);

const { t } = useI18n();

const isOptionsActive = ref(false);
const isOpenDropdown = ref(false);

const handleDropdownToggle = (open: boolean) => {
  if (!open && isOptionsActive.value) {
    isOpenDropdown.value = true;
    return;
  }
  isOpenDropdown.value = open;
};

const hasSectorsSelected = computed(() => {
  return sectors.value && sectors.value.length > 0;
});

const sectorsForDependency = computed(() => {
  return sectors.value?.map((sector: any) => sector.value).join(',') || '';
});

const isManySectorsSelected = computed(() => {
  return sectors.value?.length > 1 && sectorsForDependency.value !== '__all__';
});

const dependsOnValueQueues = computed(() => {
  if (sectors.value?.length === 1 && sectorsForDependency.value !== '__all__') {
    return { sector_id: sectorsForDependency.value };
  }
  return { sectors: sectorsForDependency.value };
});

const dependsOnValueTags = computed(() => {
  if (sectors.value?.length === 1 && sectorsForDependency.value !== '__all__') {
    return { sector_id: sectorsForDependency.value };
  }
  return { sectors: sectorsForDependency.value };
});

const applyFiltersButton = () => {
  saveAppliedFilters();
  isOpenDropdown.value = false;
};

const clearFiltersButton = () => {
  clearFilters();
  isOpenDropdown.value = false;
};

const updateSectors = (value: any[]) => {
  sectors.value = value;
  queues.value = [];
  tags.value = [];
};

const handleOptionsActiveChange = (active) => {
  if (!active) {
    setTimeout(() => {
      isOptionsActive.value = active;
    }, 100);
  } else {
    isOptionsActive.value = active;
  }
};

const titleButtonFilters = computed(() => {
  if (appliedFiltersLength.value > 0) {
    return `${t('insights_header.filters')} (${appliedFiltersLength.value})`;
  }

  return t('insights_header.filters');
});
</script>

<style lang="scss" scoped>
.filter-human-support {
  display: flex;

  &__filters {
    width: 400px;
    display: flex;
    flex-wrap: wrap;
    gap: $unnnic-spacing-md;
    padding: $unnnic-space-3 $unnnic-space-2;

    &-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-nano;
    }

    &-footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      gap: $unnnic-spacing-sm;

      &__button {
        width: 100%;
      }
    }
  }
}
</style>
