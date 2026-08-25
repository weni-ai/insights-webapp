<template>
  <FormAccordion
    v-for="(metric, index) of metrics"
    :key="metric.title"
    :active="activeMetric === index"
    :title="metric.title"
    :validConfig="!!metric.flow && !!metric.name.trim()"
    @update:active="updateActiveMetric(index, $event)"
  >
    <template #content>
      <section class="metric-form">
        <section>
          <UnnnicLabel :label="$t('metric_accordion.name_metric.label')" />
          <UnnnicInput
            v-model="metric.name"
            :placeholder="$t('metric_accordion.name_metric.placeholder')"
          />
        </section>
        <SelectFlow v-model="metric.flow" />
        <UnnnicButton
          class="clear-button"
          :text="$t('clear_fields')"
          type="tertiary"
          :disabled="!metric.flow && !metric.name"
          @click="clearFields(index)"
        />
      </section>
    </template>
  </FormAccordion>
  <UnnnicButton
    :text="$t('drawers.config_funnel.add_metric')"
    iconLeft="add"
    type="secondary"
    :disabled="metrics.length >= 5"
    @click="addMetric"
  />
  <UnnnicButton
    class="clear-fields-btn"
    :text="$t('drawers.clear_all_fields')"
    type="secondary"
    :disabled="isDisableClearFields"
    @click="clearAllFields"
  />
  <UnnnicButton
    class="clear-widget-btn"
    :text="$t('drawers.reset_widget')"
    type="tertiary"
    @click="resetWidget"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useProject } from '@/store/modules/project';
import FormAccordion from '@/components/FormAccordion.vue';
import SelectFlow from '@/components/SelectFlow.vue';

defineOptions({ name: 'DrawerConfigContentFunnel' });

interface DrawerConfigContentFunnelProps {
  modelValue?: Record<string, any>;
}

const props = withDefaults(defineProps<DrawerConfigContentFunnelProps>(), {
  modelValue: () => ({}),
});

const emit = defineEmits<{
  'update:model-value': [value: unknown];
  'update-disable-primary-button': [value: boolean];
  'reset-widget': [];
}>();

const { t } = useI18n();
const projectStore = useProject();
const { flows: projectFlows } = storeToRefs(projectStore);

const initialMetricsStringfy = ref('');
const metrics = ref([
  {
    title: t('drawers.config_funnel.first_metric'),
    name: '',
    flow: '',
    active: true,
  },
  {
    title: t('drawers.config_funnel.second_metric'),
    name: '',
    flow: '',
    active: false,
  },
  {
    title: t('drawers.config_funnel.third_metric'),
    name: '',
    flow: '',
    active: false,
  },
]);
const activeMetric = ref<number | null>(null);

const validMetricsLength = computed(
  () => metrics.value.filter((metric) => metric.name && metric.flow).length,
);

const isValidMetrics = computed(() => {
  if (validMetricsLength.value < 3) {
    return false;
  }
  const metricsToCompare = metrics.value.map((metric) => {
    delete (metric as { active?: boolean }).active;
    return metric;
  });

  if (metricsToCompare.some((metric) => !metric.flow)) {
    return false;
  }

  if (initialMetricsStringfy.value === JSON.stringify(metricsToCompare)) {
    return false;
  }
  return true;
});

const isDisableClearFields = computed(() =>
  metrics.value.some((metric) => metric.name === '' || metric.flow === ''),
);

watch(
  metrics,
  (newMetrics) => {
    emit('update:model-value', newMetrics);
  },
  { deep: true },
);

watch(
  isValidMetrics,
  () => {
    emit('update-disable-primary-button', !isValidMetrics.value);
  },
  { immediate: true },
);

const addMetric = () => {
  const newMetric = {
    title:
      metrics.value.length === 3
        ? t('drawers.config_funnel.fourth_metric')
        : t('drawers.config_funnel.fifth_metric'),
    name: '',
    flow: '',
    active: false,
  };

  if (metrics.value.length < 5) {
    metrics.value.push(newMetric);
  }
};

const clearFields = (index: number) => {
  const isCreatedMetric = [3, 4].includes(index);
  if (isCreatedMetric) {
    return metrics.value.splice(index, 1);
  }

  metrics.value[index].name = '';
  metrics.value[index].flow = '';
};

const clearAllFields = () => {
  const isCreatedMetric = metrics.value.length > 3;

  if (isCreatedMetric) {
    metrics.value.splice(3, metrics.value.length - 3);
  }

  metrics.value.forEach((metric) => {
    metric.name = '';
    metric.flow = '';
  });
};

const handleWidgetFields = () => {
  Object.values(props.modelValue.config || {}).forEach(
    (metric: any, index: number) => {
      const selectedFlow =
        projectFlows.value.find(
          (flow: any) => flow.value === metric.filter?.flow,
        ) || {};

      if (!metrics.value[index]) {
        addMetric();
      }

      metrics.value[index] = {
        ...metrics.value[index],
        name: metric.name,
        flow: selectedFlow?.value,
      };
    },
  );
  initialMetricsStringfy.value = JSON.stringify(
    metrics.value.map((metric) => {
      delete (metric as { active?: boolean }).active;
      return metric;
    }),
  );
};

const updateActiveMetric = (index: number, isActive: boolean) => {
  metrics.value[index].active = isActive;
  if (isActive) {
    activeMetric.value = index;
  }
  if (activeMetric.value === index && !isActive) {
    activeMetric.value = null;
  }
};

const resetWidget = () => {
  emit('reset-widget');
};

handleWidgetFields();

nextTick().then(() => {
  activeMetric.value = 0;
});
</script>

<style lang="scss" scoped>
.metric-form {
  display: grid;
  gap: $unnnic-space-1;

  .clear-button {
    margin-top: $unnnic-space-1;
  }
}
</style>
