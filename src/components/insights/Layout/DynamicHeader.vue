<template>
  <component
    :is="currentComponent"
    data-testid="dynamic-header"
  />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';

import HeaderHumanService from './Headers/HeaderHumanService.vue';
import HeaderHumanSupport from './Headers/HeaderHumanSupport.vue';
import HeaderConversational from './Headers/HeaderConversational.vue';
import HeaderDefault from './Headers/HeaderDefault.vue';
import HeaderCTWA from './Headers/HeaderCTWA.vue';

type DashboardHeaderType =
  | 'ctwa'
  | 'human_service'
  | 'human_support'
  | 'conversational'
  | 'metaTemplateMessage'
  | 'custom';

interface DynamicHeaderProps {
  dashboardType: DashboardHeaderType;
}

const props = defineProps<DynamicHeaderProps>();

const componentMap: Record<DashboardHeaderType, Component> = {
  ctwa: HeaderCTWA,
  human_service: HeaderHumanService,
  human_support: HeaderHumanSupport,
  conversational: HeaderConversational,
  metaTemplateMessage: HeaderDefault,
  custom: HeaderDefault,
};

const currentComponent = computed<Component>(() => {
  return componentMap[props.dashboardType] || HeaderDefault;
});
</script>
