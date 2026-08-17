<template>
  <section class="header-ctwa">
    <UnnnicInputDatePicker
      v-model="appliedDateRange"
      class="header-ctwa__date"
      data-testid="ctwa-date-filter"
      :disableClear="true"
      position="right"
      :maxDate="maxDate"
      fillW
    />
    <CampaignFilter v-model="selectedCampaign" />
    <UnnnicButton
      data-testid="ctwa-refresh-button"
      class="header-ctwa__refresh"
      type="secondary"
      iconLeft="refresh"
      :text="$t('insights_header.refresh')"
      @click="handleRefresh"
    />
  </section>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import CampaignFilter from '@/components/insights/ctwa/CampaignFilter.vue';
import { useCTWA } from '@/store/modules/ctwa';
import { getTodayDate } from '@/utils/time';

defineOptions({
  name: 'HeaderCTWA',
});

const router = useRouter();
const ctwaStore = useCTWA();
const { appliedDateRange, selectedCampaign } = storeToRefs(ctwaStore);

const maxDate = getTodayDate().start;

const handleRefresh = () => {
  console.log('TODO: implement CTWA dashboard refresh');
};

watch(
  [appliedDateRange, selectedCampaign],
  ([dateRange, campaign]) => {
    const query = { ...router.currentRoute.value.query };

    if (dateRange.start && dateRange.end) {
      query.start_date = dateRange.start;
      query.end_date = dateRange.end;
    }

    if (campaign) {
      query.campaign = campaign;
    } else {
      delete query.campaign;
    }

    router.replace({ query });
  },
  { deep: true, immediate: true },
);
</script>

<style lang="scss" scoped>
.header-ctwa {
  display: flex;
  align-items: center;
  gap: $unnnic-space-4;

  :deep(.header-ctwa__date) {
    width: 304px;
    .unnnic-popover-trigger {
      width: 100%;
    }
  }

  &__refresh {
    height: 100%;
  }
}
</style>
