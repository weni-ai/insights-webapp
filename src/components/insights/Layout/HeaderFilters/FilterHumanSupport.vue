<template>
  <section class="filter-human-support">
    <UnnnicDropdown
      class="actions__dropdown"
      data-testid="actions-dropdown"
    >
      <template #trigger>
        <UnnnicButton
          data-testid="filter-human-support-button"
          type="secondary"
          iconLeft="filter_list"
          :text="titleButtonFilters"
          @click="openFiltersDropdown"
        />
      </template>

      <section class="filter-human-support__filters">
        <section class="filter-human-support__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.sector')" />
          <FilterMultiSelect
            v-model="sectors"
            :placeholder="$t('export_data.filters.select_sector')"
            source="sectors"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_sectors')"
            @update:model-value="updateSectors"
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
            @update:model-value="updateQueues"
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
            @update:model-value="updateTags"
          />
        </section>
      </section>
    </UnnnicDropdown>
  </section>
</template>

<script setup lang="ts">
import { UnnnicButton, UnnnicLabel } from '@weni/unnnic-system';
import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

const humanSupportMonitoring = useHumanSupportMonitoring();

const { appliedFiltersLength, sectors, queues, tags } = storeToRefs(
  humanSupportMonitoring,
);

const { t } = useI18n();

const openFiltersDropdown = () => {
  console.log('openFiltersDropdown');
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

const updateSectors = (value: any[]) => {
  sectors.value = value;
  queues.value = [];
  tags.value = [];
};

const updateQueues = (value: any[]) => {
  queues.value = value;
};

const updateTags = (value: any[]) => {
  tags.value = value;
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
}

.filter-human-support__filters {
  width: 400px;
  display: flex;
  flex-wrap: wrap;
  gap: $unnnic-spacing-md;
  padding: $unnnic-space-3 $unnnic-space-2;
}

.filter-human-support__filters-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
