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
  </section>
</template>

<script setup lang="ts">
import SentimentAnalysisForm from './Forms/SentimentAnalysisForm.vue';
import CustomizedForm from './Forms/CustomizedForm.vue';

defineProps<{
  type: 'csat' | 'nps' | 'custom';
  isNew: boolean;
}>();
</script>

<style lang="scss" scoped>
.config-customizable-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

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
