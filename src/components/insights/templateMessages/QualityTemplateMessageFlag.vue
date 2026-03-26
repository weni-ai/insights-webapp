<template>
  <section
    :class="[
      'quality-template-message-flag',
      `quality-template-message-flag--${props.status.toLowerCase()}`,
    ]"
  >
    <p class="quality-template-message-flag__text">
      {{ getStatusLabel(props.status) }}
    </p>
  </section>
</template>

<script setup>
import i18n from '@/utils/plugins/i18n';
const props = defineProps({
  status: {
    type: String,
    default: '',
  },
});

const getStatusLabel = () => {
  const statusMapper = {
    APPROVED: i18n.global.t('active'),
    PENDING: i18n.global.t('pending'),
    REJECTED: i18n.global.t('rejected'),
    DISABLED: i18n.global.t('disabled'),
  };

  return statusMapper[props.status] || '';
};
</script>

<style lang="scss" scoped>
.quality-template-message-flag {
  display: flex;
  &__text {
    font: $unnnic-font-action;
  }
  .info {
    margin-top: $unnnic-space-1;
    margin-left: $unnnic-space-1;
  }
  &--approved {
    color: $unnnic-color-green-7;
  }
  &--pending {
    color: $unnnic-color-orange-7;
  }
  &--rejected {
    color: $unnnic-color-red-7;
  }
  &--disabled {
    color: $unnnic-color-red-7;
  }
}
</style>
