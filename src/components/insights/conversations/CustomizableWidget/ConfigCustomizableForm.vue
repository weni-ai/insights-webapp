<template>
  <section class="config-customizable-form">
    <h2
      class="config-customizable-form__title"
      data-testid="config-customizable-form-title"
    >
      {{ $t(`conversations_dashboard.${type}`) }}
    </h2>
    <SentimentAnalysisForm
      v-if="type === 'csat' || type === 'nps'"
      :type="type"
      :isNew="isNew"
    />
    <CustomizedForm v-if="type === 'custom'" />
    <CrosstabForm v-if="type === 'crosstab'" />
    <AbsoluteNumbersForm v-if="type === 'absolute_numbers'" />
  </section>
</template>

<script setup lang="ts">
import SentimentAnalysisForm from './Forms/SentimentAnalysisForm.vue';
import CustomizedForm from './Forms/CustomizedForm.vue';
import CrosstabForm from './Forms/CrosstabForm.vue';
import AbsoluteNumbersForm from './Forms/AbsoluteNumbersForm.vue';
import { DrawerWidgetType } from '@/store/modules/conversational/conversational';

defineProps<{
  type: DrawerWidgetType;
  isNew: boolean;
}>();
</script>

<style lang="scss" scoped>
.config-customizable-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-5;

  &__title {
    color: $unnnic-color-gray-13;
    font: $unnnic-font-display-3;
  }
}
</style>
