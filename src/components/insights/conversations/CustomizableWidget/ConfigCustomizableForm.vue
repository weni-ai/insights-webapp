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
  </section>
</template>

<script setup lang="ts">
import SentimentAnalysisForm from './Forms/SentimentAnalysisForm.vue';
import CustomizedForm from './Forms/CustomizedForm.vue';
import CrosstabForm from './Forms/CrosstabForm.vue';

defineProps<{
  type: 'csat' | 'nps' | 'custom' | 'crosstab';
  isNew: boolean;
}>();
</script>

<style lang="scss" scoped>
.config-customizable-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-5;

  &__title {
    color: $unnnic-color-neutral-black;
    font-weight: $unnnic-font-weight-bold;
  }

  &__title {
    font-size: $unnnic-font-size-body-lg;
    font-family: $unnnic-font-family-secondary;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }
}
</style>
