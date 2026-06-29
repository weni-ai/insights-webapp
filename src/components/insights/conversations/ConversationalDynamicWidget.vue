<template>
  <LazyWidget>
    <section
      class="conversational-dynamic-widget"
      :class="{ 'conversational-dynamic-widget--mock-hover': showMockOverlay }"
    >
      <component
        :is="currentComponent"
        :uuid="uuid"
      />

      <AddWidget
        v-if="showMockOverlay"
        class="conversational-dynamic-widget__mock-overlay"
        :title="$t('conversations_dashboard.customize_your_dashboard.title')"
        :description="
          $t('conversations_dashboard.customize_your_dashboard.description')
        "
        :actionText="
          $t(
            'conversations_dashboard.customize_your_dashboard.add_first_widget',
          )
        "
        data-testid="mock-widget-overlay"
        @action="handleOpenDrawer"
      />
    </section>
  </LazyWidget>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { storeToRefs } from 'pinia';

import ConversationalCsat from '@/components/insights/widgets/conversational/ConversationalCsat.vue';
import ConversationalNps from '@/components/insights/widgets/conversational/ConversationalNps.vue';
import ConversationalCustom from '@/components/insights/widgets/conversational/ConversationalCustom.vue';
import ConversationalCrosstab from '@/components/insights/widgets/conversational/ConversationalCrosstab.vue';
import ConversationalSalesFunnel from '@/components/insights/widgets/conversational/ConversationalSalesFunnel.vue';
import ConversationalAbsoluteNumbers from '@/components/insights/widgets/conversational/ConversacionalAbsoluteNumbers/index.vue';
import ConversationalAgentInvocation from '@/components/insights/widgets/conversational/ConversationalAgentInvocation.vue';
import ConversationalToolResult from '@/components/insights/widgets/conversational/ConversationalToolResult.vue';
import ConversationalSearchTerm from '@/components/insights/widgets/conversational/ConversationalSearchTerm.vue';
import ConversationalAddedToCart from '@/components/insights/widgets/conversational/ConversationalAddedToCart.vue';
import ConversationalAdd from '@/components/insights/widgets/conversational/ConversationalAdd.vue';
import AddWidget from '@/components/insights/conversations/AddWidget.vue';
import LazyWidget from '@/components/insights/Layout/LazyWidget.vue';
import { useConversational } from '@/store/modules/conversational/conversational';

type ConversationalWidgetType =
  | 'csat'
  | 'nps'
  | 'add'
  | 'sales_funnel'
  | 'custom'
  | 'crosstab'
  | 'absolute_numbers'
  | 'agent_invocation'
  | 'tool_result'
  | 'search_term'
  | 'added_to_cart';

interface Props {
  type: ConversationalWidgetType;
  uuid?: string;
}

const props = defineProps<Props>();

const conversational = useConversational();
const { shouldUseMock } = storeToRefs(conversational);
const { setIsDrawerCustomizableOpen } = conversational;

const componentMap: Record<ConversationalWidgetType, Component> = {
  csat: ConversationalCsat,
  nps: ConversationalNps,
  custom: ConversationalCustom,
  crosstab: ConversationalCrosstab,
  sales_funnel: ConversationalSalesFunnel,
  absolute_numbers: ConversationalAbsoluteNumbers,
  agent_invocation: ConversationalAgentInvocation,
  tool_result: ConversationalToolResult,
  search_term: ConversationalSearchTerm,
  added_to_cart: ConversationalAddedToCart,
  add: ConversationalAdd,
};

const currentComponent = computed<Component>(() => {
  return componentMap[props.type] || ConversationalAdd;
});

const showMockOverlay = computed(
  () => shouldUseMock.value && props.type !== 'add',
);

const handleOpenDrawer = () => {
  setIsDrawerCustomizableOpen(true, 'add', true);
};
</script>

<style lang="scss" scoped>
.conversational-dynamic-widget {
  position: relative;
  min-height: 490px;

  &__mock-overlay {
    transition: opacity 0.2s ease;
  }

  &--mock-hover {
    .conversational-dynamic-widget__mock-overlay {
      opacity: 0;
    }

    &:hover .conversational-dynamic-widget__mock-overlay {
      opacity: 1;
    }
  }
}
</style>
