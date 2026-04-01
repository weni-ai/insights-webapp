<template>
  <ModalRemoveWidget
    v-if="showModal"
    v-model="showModal"
    data-testid="absolute-numbers-metric-remove-modal"
    class="modal-remove-metric"
    type="absolute_numbers_child"
    size="md"
    :name="metric.name"
    :uuid="metric.uuid"
    :title="
      $t(
        'conversations_dashboard.customize_your_dashboard.absolute_numbers.remove_child_modal.title',
      )
    "
    @success="emit('success')"
  >
    <template #description>
      <section class="modal-remove-metric__description">
        <p class="modal-remove-metric__description__title">
          {{
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.remove_child_modal.description',
              { metric_name: metric.name },
            )
          }}
        </p>
        <p class="modal-remove-metric__description__info">
          {{
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.remove_child_modal.info',
              { widget_name: parentName, metric_name: metric.name },
            )
          }}
        </p>
      </section>
    </template>
  </ModalRemoveWidget>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ModalRemoveWidget from '@/components/insights/conversations/CustomizableWidget/ModalRemoveWidget.vue';

import type { AbsoluteNumbersChildrenItem } from '@/services/api/resources/conversational/widgets';
import type { absoluteNumbersFormChildren } from '@/store/modules/conversational/customWidgets';

interface Props {
  modelValue: boolean;
  metric: AbsoluteNumbersChildrenItem | absoluteNumbersFormChildren;
  parentName: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [void];
}>();

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
