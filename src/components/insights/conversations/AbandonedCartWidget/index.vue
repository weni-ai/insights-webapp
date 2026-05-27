<template>
  <section
    v-if="isLoadingData"
    class="abandoned-cart-widget__loading"
  >
    <UnnnicSkeletonLoading
      class="abandoned-cart-widget__loading__skeleton"
      width="100%"
      height="100%"
    />
  </section>
  <section
    v-else
    class="abandoned-cart-widget"
  >
    <section class="abandoned-cart-widget__header">
      <h2 class="abandoned-cart-widget__title">
        {{ $t('conversations_dashboard.abandoned_cart_recovery_widget.title') }}
      </h2>
      <UnnnicPopover
        :open="openPopover"
        @update:open="openPopover = $event"
      >
        <UnnnicPopoverTrigger>
          <UnnnicButton
            type="tertiary"
            iconCenter="more_vert"
          />
        </UnnnicPopoverTrigger>
        <UnnnicPopoverContent
          side="bottom"
          align="end"
          size="small"
        >
          <UnnnicPopoverOption
            :label="
              $t(
                'conversations_dashboard.customize_your_dashboard.remove_widget',
              )
            "
            icon="delete"
            scheme="fg-critical"
            @click="handleRemoveWidget"
          />
        </UnnnicPopoverContent>
      </UnnnicPopover>
    </section>
    <section
      v-if="showDisclaimer"
      class="abandoned-cart-widget__no-data"
    >
      <UnnnicDisclaimer
        :type="disclaimerType"
        :description="disclaimerDescription"
      />
    </section>
    <section
      v-else
      class="abandoned-cart-widget__content"
    >
      <Chart
        class="abandoned-cart-widget__content__chart"
        :data="chartData"
      />
      <InfoCard
        class="abandoned-cart-widget__content__info-card"
        :data="infoCardData"
      />
    </section>
    <ModalRemoveWidget
      v-if="openModalRemoveWidget"
      v-model="openModalRemoveWidget"
      size="md"
      type="abandoned_cart_recovery"
      :name="$t('conversations_dashboard.abandoned_cart_recovery_widget.title')"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { isBefore, parseISO, startOfDay, subDays } from 'date-fns';
import { useI18n } from 'vue-i18n';

import Chart from './Chart.vue';
import InfoCard from './InfoCard.vue';
import ModalRemoveWidget from '../CustomizableWidget/ModalRemoveWidget.vue';

import { useConversational } from '@/store/modules/conversational/conversational';

import WidgetConversationalService from '@/services/api/resources/conversational/widgets';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'AbandonedCartWidget',
});

const DATA_AVAILABILITY_DAYS = 89;

const { t } = useI18n();
const conversationalStore = useConversational();
const { appliedFilters, refreshDataConversational } =
  storeToRefs(conversationalStore);

const openPopover = ref(false);
const openModalRemoveWidget = ref(false);

const isLoadingData = ref(false);
const hasError = ref(false);
const widgetData = ref({
  sent: 0,
  delivered: 0,
  read: 0,
  clicks: 0,
  utmRevenue: { value: 0, percentage: 0, prefix: '' } as Record<string, any>,
  ordersPlaced: { value: 0, percentage: 0 } as Record<string, any>,
});

const hasEmptyData = computed(() => {
  return (
    widgetData.value.sent === 0 &&
    widgetData.value.delivered === 0 &&
    widgetData.value.read === 0 &&
    widgetData.value.clicks === 0 &&
    widgetData.value.utmRevenue.value === 0 &&
    widgetData.value.ordersPlaced.value === 0 &&
    widgetData.value.ordersPlaced.percentage === 0 &&
    hasError.value === false
  );
});

const minAvailableDate = computed(() =>
  startOfDay(subDays(new Date(), DATA_AVAILABILITY_DAYS)),
);

const isFilterDateOutOfRange = computed(() => {
  const { start_date: filterDateStart, end_date: filterDateEnd } =
    appliedFilters.value;

  const isDateBeforeMinAvailable = (date?: string) => {
    if (!date) return false;

    return isBefore(parseISO(date), minAvailableDate.value);
  };

  return (
    isDateBeforeMinAvailable(filterDateStart) ||
    isDateBeforeMinAvailable(filterDateEnd)
  );
});

const showDisclaimer = computed(
  () => isFilterDateOutOfRange.value || hasEmptyData.value || hasError.value,
);

const disclaimerType = computed(() => (hasError.value ? 'error' : 'neutral'));

const disclaimerDescription = computed(() => {
  if (hasError.value) {
    return t('conversations_dashboard.abandoned_cart_recovery_widget.error');
  }

  if (isFilterDateOutOfRange.value) {
    return t(
      'conversations_dashboard.abandoned_cart_recovery_widget.unavailable_period',
    );
  }

  return t('conversations_dashboard.abandoned_cart_recovery_widget.no_data');
});

const chartData = computed(() => {
  return {
    sent: widgetData.value.sent,
    delivered: widgetData.value.delivered,
    read: widgetData.value.read,
    clicks: widgetData.value.clicks,
  };
});

const infoCardData = computed(() => {
  return {
    currency: widgetData.value.utmRevenue.prefix,
    recoveryRevenue: widgetData.value.utmRevenue.value,
    totalSends: widgetData.value.sent,
    convertedSales: widgetData.value.ordersPlaced.value,
  };
});

const handleRemoveWidget = () => {
  openPopover.value = false;
  openModalRemoveWidget.value = true;
};

const fetchData = async () => {
  if (isFilterDateOutOfRange.value) {
    hasError.value = false;
    isLoadingData.value = false;
    return;
  }

  try {
    hasError.value = false;
    isLoadingData.value = true;
    const response =
      await WidgetConversationalService.getAbandonedCartRecoveryData(
        appliedFilters.value,
      );

    widgetData.value = {
      sent: response.find((item) => item.id === 'sent-messages')?.value || 0,
      delivered:
        response.find((item) => item.id === 'delivered-messages')?.value || 0,
      read: response.find((item) => item.id === 'read-messages')?.value || 0,
      clicks: response.find((item) => item.id === 'interactions')?.value || 0,
      utmRevenue: response.find((item) => item.id === 'utm-revenue') || {
        value: 0,
        percentage: 0,
        prefix: '',
      },
      ordersPlaced: response.find((item) => item.id === 'orders-placed') || {
        value: 0,
        percentage: 0,
      },
    };
  } catch (error) {
    console.error('Error fetching abandoned cart recovery data', error);
    hasError.value = true;
  } finally {
    isLoadingData.value = false;
  }
};

onMounted(() => {
  fetchData();
});

watch(
  () => appliedFilters.value,
  () => {
    fetchData();
  },
  { deep: true },
);

watch(
  () => refreshDataConversational.value,
  (val) => {
    if (val) {
      fetchData();
    }
  },
);
</script>

<style scoped lang="scss">
.abandoned-cart-widget {
  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-border-base;
  background-color: $unnnic-color-bg-base;

  display: flex;
  flex-direction: column;
  padding: $unnnic-space-6;
  gap: $unnnic-space-4;

  &__loading,
  &__no-data {
    height: 370px;
    width: 100%;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__title {
    font: $unnnic-font-display-2;
    color: $unnnic-color-fg-emphasized;
  }
  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $unnnic-space-4;
  }
}
</style>
