<template>
  <section class="crosstab-widget">
    <section
      class="crosstab-widget__table"
      :style="{ alignItems: isLoading ? 'unset' : 'center' }"
    >
      <UnnnicDisclaimer
        v-if="isEmptyData && !isLoading"
        class="crosstab-widget__empty-data-disclaimer"
        iconColor="feedback-yellow"
        :text="$t('conversations_dashboard.no_data_available')"
      />
      <ProgressTable
        :progressItems="formattedData.slice(0, 5)"
        :isLoading="isLoading"
      />
      <section
        v-if="!isLoading"
        class="crosstab-widget__table-legend"
      >
        <div
          v-for="item in legendItems"
          :key="item.title"
          class="crosstab-widget__table-legend__item"
        >
          <div
            class="crosstab-widget__table-legend__item__color"
            :style="{ backgroundColor: item.color }"
          />
          <p class="crosstab-widget__table-legend__item__label">
            {{ item.title }}
          </p>
        </div>
      </section>
    </section>
    <section
      v-if="!isLoading"
      class="crosstab-widget__footer"
    >
      <p class="crosstab-widget__footer__count">
        {{ $t('lines_count', { count: widgetData.total_rows }) }}
      </p>
      <UnnnicButton
        :text="$t('see_all')"
        type="tertiary"
        @click="() => (isSeeAllDrawerOpen = true)"
      />
    </section>
  </section>
  <SeeAllDrawer
    v-model="isSeeAllDrawerOpen"
    :data="widgetData.results"
    :title="widget?.name"
    isCrosstab
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { CrosstabWidgetResponse } from '@/services/api/resources/conversational/widgets';

import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';

import ProgressTable from '@/components/ProgressTable.vue';
import SeeAllDrawer from '../conversations/CustomizableWidget/SeeAllDrawer.vue';

import { formatPercentage } from '@/utils/numbers';

import i18n from '@/utils/plugins/i18n';
import { UnnnicDisclaimer } from '@weni/unnnic-system';

const customWidgetsStore = useCustomWidgets();

const { getCustomWidgetByUuid, getIsLoadingByUuid } = customWidgetsStore;

interface CrosstabWidgetProps {
  widgetUuid: string;
}

const props = defineProps<CrosstabWidgetProps>();

const isLoading = computed(() => {
  return getIsLoadingByUuid(props.widgetUuid);
});

const tableAlignItems = computed(() => {
  return isLoading.value ? 'unset' : 'center';
});

const isSeeAllDrawerOpen = ref(false);

const isEmptyData = computed(() => {
  return widgetData.value.results.every((item) => item.total === 0);
});

const widget = computed(() => {
  return getCustomWidgetByUuid(props.widgetUuid);
});

const widgetData = computed(() => {
  return (
    (widget.value?.data as CrosstabWidgetResponse) || {
      total_rows: 0,
      results: [],
    }
  );
});

const getTooltip = (events: Record<string, { value: number }>) => {
  return Object.keys(events)
    .map(
      (key) =>
        `${key.charAt(0).toUpperCase() + key.slice(1)}: ${formatPercentage(events[key].value, i18n.global.locale)}`,
    )
    .join('<br>');
};

const legendItems = computed(() => {
  if (!widgetData.value.results.length) return [];
  const eventsKeys = Object.keys(widgetData.value.results[0].events);
  return eventsKeys.map((key, index) => {
    return {
      title: `${key.charAt(0).toUpperCase() + key.slice(1)}`,
      color: index === 0 ? '#3182CE' : '#E5812A',
    };
  });
});

const formattedData = computed(() => {
  return widgetData.value.results.map((item) => {
    const eventsKeys = Object.keys(item.events);
    return {
      label: item.title,
      color: '#3182CE',
      backgroundColor: '#E5812A',
      description: `${item.total}`,
      value: item.events[eventsKeys[0]].value,
      tooltip: getTooltip(item.events),
    };
  });
});
</script>

<style scoped lang="scss">
.crosstab-widget {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1 0 0;
  gap: $unnnic-space-3;

  &__empty-data-disclaimer {
    width: 100%;
  }

  &__table {
    display: flex;
    flex-direction: column;
    align-items: v-bind(tableAlignItems);
    gap: $unnnic-space-4;

    &-legend {
      display: flex;
      gap: $unnnic-space-6;
      &__item {
        display: flex;
        align-items: center;
        gap: $unnnic-space-2;
        &__color {
          width: $unnnic-space-6;
          height: $unnnic-space-2;
          border-radius: $unnnic-border-radius-pill;
        }
        &__label {
          color: $unnnic-color-fg-emphasized;
          font: $unnnic-font-caption-2;
        }
      }
    }
  }
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__count {
      font: $unnnic-font-body;
      color: $unnnic-color-neutral-clean;
    }
    &__see-more {
      font: $unnnic-font-display-4;
      color: $unnnic-color-fg-base;
      cursor: pointer;
    }
  }
}
</style>
