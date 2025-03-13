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
  };

  return statusMapper[props.status] || '';
};
</script>

<style lang="scss" scoped>
.quality-template-message-flag {
  display: flex;
  &__text {
    font-family: $unnnic-font-family-secondary;
    font-size: 14px;
    font-weight: $unnnic-font-weight-bold;
    line-height: 22px;
  }
  .info {
    margin-top: $unnnic-spacing-nano;
    margin-left: $unnnic-spacing-nano;
  }
  &--approved {
    color: $unnnic-color-aux-green-500;
  }
  &--pending {
    color: $unnnic-color-aux-orange-500;
  }
  &--rejected {
    color: $unnnic-color-aux-red-500;
  }
}
</style>
