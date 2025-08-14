<template>
  <section class="config-customizable-form">
    <h2
      class="config-customizable-form__title"
      data-testid="config-customizable-form-title"
    >
      {{ $t(`conversations_dashboard.${type}`) }}
    </h2>

    <p
      class="config-customizable-form__description"
      data-testid="config-customizable-form-description"
    >
      {{ renderDescription }}
    </p>

    <SentimentAnalysisForm
      v-if="type === 'csat' || type === 'nps'"
      :type="type"
      :isNew="isNew"
    />
  </section>
</template>

<script setup lang="ts">
import SentimentAnalysisForm from './Forms/SentimentAnalysisForm.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  type: 'csat' | 'nps' | 'horizontal_bar_chart';
  isNew: boolean;
}>();

const renderDescription = computed(() => {
  console.log(props.type);
  if (props.type === 'horizontal_bar_chart') {
    return t('conversations_dashboard.customize_your_dashboard.select_data');
  }

  return t(
    'conversations_dashboard.customize_your_dashboard.config_csat_or_nps_description',
    { type: props.type.toUpperCase() },
  );
});
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

  &__description {
    color: $unnnic-color-neutral-cloudy;
  }

  &__title,
  &__description {
    font-size: $unnnic-font-size-body-lg;
    font-family: $unnnic-font-family-secondary;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }
}
</style>
