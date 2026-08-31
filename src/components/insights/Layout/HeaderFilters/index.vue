<template>
  <section class="insights-layout-header-filters">
    <FilterHumanSupport v-if="isHumanSupportDashboard" />

    <template v-if="hasManyFilters">
      <UnnnicButton
        data-testid="many-filters-button"
        type="secondary"
        iconLeft="filter_list"
        :text="titleButtonManyFilters"
        @click.stop="openFiltersModal"
      />
      <UnnnicButton
        v-if="appliedFiltersLength > 0"
        data-testid="clear-many-filters-button"
        type="tertiary"
        iconLeft="close"
        :text="$t('insights_header.clear_filters')"
        @click.stop="clearFilters"
      />
    </template>
    <section
      v-else-if="currentDashboardFilters[0] && isRenderDynamicFilter"
      class="insights-layout-header-filters_dynamic_container"
    >
      <DynamicFilter
        data-testid="dynamic-filter"
        :filter="filter"
        :modelValue="appliedFilters[currentDashboardFilters[0].name]"
        @update:model-value="updateFilter"
      />
    </section>
    <FilterFavoriteTemplateMessage
      v-if="isMetaTemplateDashboard && !emptyTemplates"
    />
    <ModalFilters
      data-testid="modal-filters"
      :showModal="filterModalOpened"
      @close="filterModalOpened = false"
    />
    <SearchTemplateMessagesModal
      v-if="showSearchTemplateMetaModal"
      :modelValue="showSearchTemplateMetaModal"
      @close="handlerShowSearchTemplateModal(false)"
    />
    <template v-if="isMetaTemplateDashboard">
      <UnnnicButton
        type="primary"
        :text="$t('template_messages_dashboard.templates_modal.title')"
        :disabled="emptyTemplates"
        @click.stop="handlerShowSearchTemplateModal(true)"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useMetaTemplateMessage } from '@/store/modules/templates/metaTemplateMessage';

import DynamicFilter from './DynamicFilter.vue';
import ModalFilters from './ModalFilters.vue';
import FilterHumanSupport from './FilterHumanSupport.vue';
import FilterFavoriteTemplateMessage from './FilterFavoriteTemplateMessage.vue';
import SearchTemplateMessagesModal from '../../templateMessages/SearchTemplateMessagesModal.vue';

import { getLastNDays, getYesterdayDate } from '@/utils/time';

defineOptions({ name: 'InsightsLayoutHeaderFilters' });

withDefaults(
  defineProps<{
    forceDisabled?: boolean;
  }>(),
  {
    forceDisabled: false,
  },
);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const dashboardsStore = useDashboards();
const metaTemplateStore = useMetaTemplateMessage();
const { currentDashboard, currentDashboardFilters, appliedFilters } =
  storeToRefs(dashboardsStore);
const { emptyTemplates, showSearchTemplateMetaModal } =
  storeToRefs(metaTemplateStore);

const handlerShowSearchTemplateModal = (show: boolean) =>
  metaTemplateStore.handlerShowSearchTemplateModal(show);

const filterModalOpened = ref(false);

const isHumanServiceDashboard = computed(
  () => currentDashboard.value?.name === 'human_service_dashboard.title',
);

const isHumanSupportDashboard = computed(
  () => currentDashboard.value?.name === 'human_support_dashboard.title',
);

const isConversationalDashboard = computed(
  () => currentDashboard.value?.name === 'conversations_dashboard.title',
);

const isMetaTemplateDashboard = computed(
  () => currentDashboard.value?.config?.is_whatsapp_integration,
);

const isRenderDynamicFilter = computed(
  () =>
    (!isMetaTemplateDashboard.value && !isHumanSupportDashboard.value) ||
    (!emptyTemplates.value && !isHumanSupportDashboard.value),
);

const yesterdayFormatted = computed(() => getYesterdayDate().dmFormat);

const hasManyFilters = computed(
  () =>
    currentDashboardFilters.value?.length > 1 && !isHumanSupportDashboard.value,
);

const appliedFiltersLength = computed(() => {
  return appliedFilters.value ? Object.keys(appliedFilters.value).length : 0;
});

const titleButtonManyFilters = computed(() => {
  return appliedFiltersLength.value
    ? `${t('insights_header.filters')} (${appliedFiltersLength.value})`
    : t('insights_header.filters');
});

const filter = computed(() => {
  if (!currentDashboardFilters.value.length) return null;

  const currentFilter = currentDashboardFilters.value[0];

  if (currentFilter.type === 'date_range') {
    const templateShortcuts = [
      { key: 'last_7_days', id: 'last-7-days' },
      { key: 'last_14_days', id: 'last-14-days' },
      { key: 'last_30_days', id: 'last-30-days' },
      { key: 'last_60_days', id: 'last-60-days' },
      { key: 'last_90_days', id: 'last-90-days' },
      { key: 'current_month', id: 'current-month' },
      { key: 'previous_month', id: 'previous-month' },
    ];

    const shortCutOptions = templateShortcuts.map(({ key, id }) => ({
      name: t(`template_messages_dashboard.filter.shortcut.${key}`),
      id,
    }));

    let customFilter: Record<string, any> = {
      ...currentFilter,
      next: true,
      shortCutOptions,
      disableClear: true,
    };

    if (isConversationalDashboard.value) {
      const dateParam = { date: yesterdayFormatted.value };
      const conversationalShortcuts = [
        { key: 'last_7_days_conversational', id: 'last-7-days' },
        { key: 'last_14_days_conversational', id: 'last-14-days' },
        { key: 'last_30_days_conversational', id: 'last-30-days' },
        { key: 'last_12_months_conversational', id: 'last-12-months' },
        { key: 'current_month_conversational', id: 'current-month' },
        { key: 'previous_month_conversational', id: 'previous-month' },
        { key: 'custom_conversational', id: 'custom' },
      ];

      customFilter.shortCutOptions = conversationalShortcuts.map(
        ({ key, id }) => ({
          name: t(`select_date.${key}`, dateParam),
          id,
        }),
      );
    }

    return customFilter;
  }

  return currentFilter;
});

const updateFilter = (value: any) => {
  const hasNonNullValues =
    typeof value === 'object' && value
      ? Object.values(value).some((val) => val)
      : value;
  dashboardsStore.setAppliedFilters({
    [currentDashboardFilters.value[0].name]: hasNonNullValues
      ? value
      : undefined,
  });
};

const clearFilters = () => {
  dashboardsStore.resetAppliedFilters();
};

const retainRouteQueries = (newRoute: any, oldRoute: any) => {
  const oldQueryKeys = Object.keys(oldRoute?.query || {});

  if (oldQueryKeys.length) {
    router.replace({
      name: newRoute.name,
      query: oldRoute.query,
    });
  }
};

const openFiltersModal = () => {
  filterModalOpened.value = true;
};

watch(
  () => ({
    path: route.path,
    name: route.name,
    query: { ...route.query },
  }),
  (newRoute, oldRoute) => {
    if (oldRoute && newRoute.path !== oldRoute.path) {
      retainRouteQueries(newRoute, oldRoute);
    }
  },
  { immediate: true },
);

watch(
  currentDashboardFilters,
  (filters) => {
    if (filters.length === 1) {
      const { date, ended_at } = route.query;

      const isHumanSupport =
        currentDashboard.value?.name === 'human_support_dashboard.title';

      if (isHumanSupport) return;

      const { start, end } = isConversationalDashboard.value
        ? getYesterdayDate()
        : getLastNDays(7);

      const defaultFilterValue = isMetaTemplateDashboard.value
        ? { _start: start, _end: end }
        : { __gte: start, __lte: end };

      const currentFilters: Record<string, any> = {};

      if (date) {
        currentFilters.date = route.query.date;
      }
      if (ended_at) {
        currentFilters.ended_at = route.query.ended_at;
      }

      const filterKey = isMetaTemplateDashboard.value ? 'date' : 'ended_at';

      dashboardsStore.setAppliedFilters({
        [filterKey]: currentFilters[filterKey] || defaultFilterValue,
      });
    } else {
      dashboardsStore.setAppliedFilters(route.query);
    }
  },
  { immediate: true },
);

defineExpose({
  filterModalOpened,
  isHumanServiceDashboard,
  isHumanSupportDashboard,
  isConversationalDashboard,
  isRenderDynamicFilter,
  isMetaTemplateDashboard,
  yesterdayFormatted,
  hasManyFilters,
  appliedFiltersLength,
  titleButtonManyFilters,
  filter,
  updateFilter,
  clearFilters,
  retainRouteQueries,
  openFiltersModal,
});
</script>

<style lang="scss" scoped>
.insights-layout-header-filters {
  display: flex;
  flex-direction: row;
  gap: $unnnic-space-2;

  &_dynamic_container {
    width: 19.75rem;
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }
}
</style>
