<template>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    :width="`100%`"
    height="100%"
  />
  <CardWidgetContainer
    v-else
    :actions="actions"
    class="absolute-numbers-metric"
  >
    <template #header-title>
      <p class="absolute-numbers-metric__title">
        {{ title }}
      </p>
    </template>
    <section class="absolute-numbers-metric__content">
      <p class="absolute-numbers-metric__value">
        {{ formattedValue }}
      </p>
    </section>
  </CardWidgetContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardWidgetContainer from '../../layout/CardWidgetContainer.vue';
import WidgetService from '@/services/api/resources/conversational/widgets';

import { useConversational } from '@/store/modules/conversational/conversational';

import { formatCurrency, formatNumber } from '@/utils/numbers';
import { currencySymbols } from '@/utils/currency';

import i18n from '@/utils/plugins/i18n';

interface Props {
  uuid: string;
  title: string;
  currency: string;
}

const props = defineProps<Props>();
const route = useRoute();
const { t } = i18n.global;

const conversationalStore = useConversational();

const metricValue = ref<number>(0);
const isLoading = ref<boolean>(false);
const formattedValue = computed(() => {
  if (props.currency) {
    return formatCurrency(metricValue.value, currencySymbols[props.currency]);
  }
  return formatNumber(metricValue.value);
});

const getChildrenValue = async () => {
  try {
    isLoading.value = true;
    const response = await WidgetService.getAbsoluteNumbersChildrenValue(
      props.uuid,
    );
    metricValue.value = response.value;
  } catch (error) {
    console.error('Error getting children value', error);
  } finally {
    isLoading.value = false;
  }
};

const actions = computed(() => {
  const editOption = {
    icon: 'edit_square',
    text: t(
      'conversations_dashboard.customize_your_dashboard.edit_csat_or_nps',
      { type: '' },
    ),
    onClick: () => {}, // TODO: Implement edit action
  };

  const deleteOption = {
    icon: 'delete',
    text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
    onClick: () => {}, // TODO: Implement delete action
    scheme: 'aux-red-500',
  };

  return [editOption, deleteOption];
});

onMounted(async () => {
  await getChildrenValue();
});

watch(
  () => route.query,
  () => {
    getChildrenValue();
  },
  { deep: true },
);

watch(
  () => conversationalStore.refreshDataConversational,
  (newValue) => {
    if (newValue) {
      getChildrenValue();
    }
  },
);
</script>

<style lang="scss" scoped>
.absolute-numbers-metric {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;
  padding: $unnnic-space-5;

  &__title {
    font: $unnnic-font-display-4;
    color: $unnnic-color-fg-emphasized;
  }

  &__content {
    display: flex;
    flex: 1;
  }

  &__value {
    font: $unnnic-font-display-1;
    color: $unnnic-color-fg-emphasized;
  }
}
</style>
