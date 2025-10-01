<template>
  <section
    v-if="isConversationalDashboard || isHumanSupportDashboard"
    class="beta_text_container"
    data-testid="beta-container"
  >
    <p
      class="beta_text"
      data-testid="beta-text"
    >
      BETA
    </p>
  </section>
</template>

<script setup lang="ts">
import { useDashboards } from '@/store/modules/dashboards';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const { currentDashboard } = storeToRefs(useDashboards());

const isConversationalDashboard = computed(() => {
  return currentDashboard.value.name === 'conversations_dashboard.title';
});

const isHumanSupportDashboard = computed(() => {
  return currentDashboard.value.name === 'human_support_dashboard.title';
});
</script>

<style lang="scss" scoped>
.beta_text_container {
  display: flex;
  padding: 0 $unnnic-spacing-nano;
  justify-content: center;
  align-items: center;
  gap: 10px;

  border-radius: $unnnic-border-radius-sm;
  background: $unnnic-color-weni-50;
}
.beta_text {
  color: $unnnic-color-weni-600;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-md;
  font-weight: $unnnic-font-weight-bold;
  line-height: $unnnic-line-height-md + $unnnic-font-size-body-md;
}
</style>
