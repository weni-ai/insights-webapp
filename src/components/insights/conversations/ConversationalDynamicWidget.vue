<template>
  <section class="conversational-dynamic-widget">
    <component
      :is="currentComponent"
      :uuid="uuid"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';

import ConversationalCsat from '@/components/insights/widgets/conversational/ConversationalCsat.vue';
import ConversationalNps from '@/components/insights/widgets/conversational/ConversationalNps.vue';
import ConversationalCustom from '@/components/insights/widgets/conversational/ConversationalCustom.vue';
import ConversationalCrosstab from '@/components/insights/widgets/conversational/ConversationalCrosstab.vue';
import ConversationalSalesFunnel from '@/components/insights/widgets/conversational/ConversationalSalesFunnel.vue';
import ConversationalAdd from '@/components/insights/widgets/conversational/ConversationalAdd.vue';

type ConversationalWidgetType =
  | 'csat'
  | 'nps'
  | 'add'
  | 'sales_funnel'
  | 'custom'
  | 'crosstab';

interface Props {
  type: ConversationalWidgetType;
  uuid?: string;
}

const props = defineProps<Props>();

const componentMap: Record<ConversationalWidgetType, Component> = {
  csat: ConversationalCsat,
  nps: ConversationalNps,
  custom: ConversationalCustom,
  crosstab: ConversationalCrosstab,
  sales_funnel: ConversationalSalesFunnel,
  add: ConversationalAdd,
};

const currentComponent = computed<Component>(() => {
  return componentMap[props.type] || ConversationalAdd;
});
</script>

<style lang="scss" scoped>
.conversational-dynamic-widget {
  position: relative;
  min-height: 490px;
}
</style>
