<template>
  <UnnnicDropdownItem
    data-testid="option-select-dashboard"
    class="option-select-dashboard"
    :class="{
      'option-select-dashboard--active':
        currentDashboard.uuid === dashboard.uuid,
    }"
    @click="handleSetCurrentDashboard(dashboard)"
  >
    <section class="option-select-dashboard__content">
      {{ $t(dashboard.name) }}
      <BetaText v-if="isRenderBetaText" />
    </section>

    <UnnnicIcon
      data-testid="star-icon"
      class="option-select-dashboard__star-icon"
      :class="{
        'option-select-dashboard__star-icon--selected': isDefaultDashboard,
      }"
      icon="star_rate"
      scheme="neutral-clean"
      clickable
      :filled="isDefaultDashboard || starHovered"
      @mouseenter="setStarHovered(true)"
      @mouseleave="setStarHovered(false)"
      @click.stop="handleSetDefaultDashboard"
    />
  </UnnnicDropdownItem>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import Unnnic from '@weni/unnnic-system';
import BetaText from './BetaText.vue';

defineOptions({ name: 'OptionSelectDashboard' });

const props = withDefaults(
  defineProps<{
    dashboard?: Record<string, any>;
  }>(),
  {
    dashboard: () => ({}),
  },
);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const dashboardsStore = useDashboards();
const { currentDashboard, dashboardDefault } = storeToRefs(dashboardsStore);

const starHovered = ref(false);

const isDefaultDashboard = computed(
  () => dashboardDefault.value?.uuid === props.dashboard.uuid,
);

const isRenderBetaText = computed(
  () => props.dashboard.config?.type === 'ctwa',
);

const handleSetCurrentDashboard = (dashboard: Record<string, any>) => {
  if (route?.name === 'report') {
    router.push({
      name: 'dashboard',
      params: {
        dashboardUuid: dashboard.uuid,
      },
    });
    return;
  }

  dashboardsStore.setCurrentDashboard(dashboard);
};

const setStarHovered = (boolean: boolean) => {
  starHovered.value = boolean;
};

const callSetDashboardAlert = (type: string) => {
  if (!['success', 'error'].includes(type)) {
    throw new Error(
      'Error calling the alert when setting the default dashboard. This type does not exist.',
    );
  }

  Unnnic.unnnicCallAlert({
    props: {
      text: t(`insights_header.set_default_dashboard_${type}`, {
        dashboard: props.dashboard.name,
      }),
      type,
    },
    seconds: 5,
  });
};

const handleSetDefaultDashboard = async () => {
  const { dashboard } = props;
  if (dashboard.uuid === dashboardDefault.value?.uuid) return;

  try {
    await dashboardsStore.setDefaultDashboard(dashboard.uuid);
    callSetDashboardAlert('success');
  } catch (error) {
    console.error(error);
    callSetDashboardAlert('error');
  }
};

defineExpose({
  starHovered,
  isDefaultDashboard,
  isRenderBetaText,
  handleSetCurrentDashboard,
  setStarHovered,
  handleSetDefaultDashboard,
  callSetDashboardAlert,
  setCurrentDashboard: (...args: any[]) =>
    dashboardsStore.setCurrentDashboard(...args),
  setDefaultDashboard: (...args: any[]) =>
    dashboardsStore.setDefaultDashboard(...args),
});
</script>

<style lang="scss" scoped>
.option-select-dashboard {
  &.unnnic-dropdown-item::before {
    content: none;
  }

  border-radius: $unnnic-radius-1;

  padding: $unnnic-space-2;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $unnnic-space-1;

  color: $unnnic-color-gray-12;
  font: $unnnic-font-body;

  &__content {
    display: flex;
    align-items: center;
    gap: $unnnic-space-1;
  }

  &--active {
    background-color: $unnnic-color-gray-1;
    font-weight: $unnnic-font-weight-bold;
  }

  .option-select-dashboard__star-icon:not(
      .option-select-dashboard__star-icon--selected
    ):hover {
    color: $unnnic-color-teal-7;
  }

  .option-select-dashboard__star-icon--selected {
    color: $unnnic-color-teal-8;
  }
}
</style>
