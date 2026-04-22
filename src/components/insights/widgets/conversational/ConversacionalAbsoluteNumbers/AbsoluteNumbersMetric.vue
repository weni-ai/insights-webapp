<template>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    data-testid="absolute-numbers-metric-skeleton"
    :width="`100%`"
    height="100%"
  />
  <CardWidgetContainer
    v-else
    data-testid="absolute-numbers-metric-card"
    :actions="actions"
    class="absolute-numbers-metric"
  >
    <template #header-title>
      <p
        class="absolute-numbers-metric__title"
        data-testid="absolute-numbers-metric-title"
      >
        {{ metric.name }}
      </p>
    </template>
    <section class="absolute-numbers-metric__content">
      <p
        class="absolute-numbers-metric__value"
        data-testid="absolute-numbers-metric-value"
      >
        {{ formattedValue }}
      </p>
    </section>
    <RemoveMetricModal
      v-if="isRemoveWidgetModalOpen"
      v-model="isRemoveWidgetModalOpen"
      :metric="metric"
      :parentName="parentName"
    />
  </CardWidgetContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardWidgetContainer from '../../layout/CardWidgetContainer.vue';
import WidgetService, {
  AbsoluteNumbersChildrenItem,
} from '@/services/api/resources/conversational/widgets';
import RemoveMetricModal from './RemoveMetricModal.vue';

import { useConversational } from '@/store/modules/conversational/conversational';

import { formatCurrency, formatNumber } from '@/utils/numbers';

import i18n from '@/utils/plugins/i18n';

interface Props {
  metric: AbsoluteNumbersChildrenItem;
  parentName: string;
}

const props = defineProps<Props>();
const route = useRoute();
const { t } = i18n.global;
const emit = defineEmits<{
  edit: [uuid: string];
}>();

const conversationalStore = useConversational();

const isRemoveWidgetModalOpen = ref<boolean>(false);
const metricValue = ref<number>(0);
const isLoading = ref<boolean>(false);
let abortController: AbortController | null = null;
const formattedValue = computed(() => {
  if (props.metric.config.currency.code) {
    return formatCurrency(metricValue.value, props.metric.config.currency.code);
  }
  return formatNumber(metricValue.value);
});

const getChildrenValue = async () => {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  const { signal } = abortController;

  try {
    isLoading.value = true;
    const response = await WidgetService.getAbsoluteNumbersChildrenValue(
      props.metric.uuid,
      { signal },
    );
    metricValue.value = response.value;
  } catch (error) {
    if (signal.aborted) return;
    console.error('Error getting children value', error);
  } finally {
    if (!signal.aborted) {
      isLoading.value = false;
    }
  }
};

const actions = computed(() => {
  const editOption = {
    icon: 'edit_square',
    text: t('edit_metric', { type: '' }),
    onClick: () => emit('edit', props.metric.uuid),
  };

  const deleteOption = {
    icon: 'delete',
    text: t('remove_metric'),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  };

  return [editOption, deleteOption];
});

onMounted(() => {
  getChildrenValue();
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
.modal-remove-metric {
  &__description {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }
}
</style>
