<template>
  <section class="setup-widget">
    <h1 class="setup-widget__title">
      {{ props.title }}
    </h1>
    <p
      v-if="props.description"
      class="setup-widget__description"
    >
      {{ props.description }}
    </p>
    <UnnnicButton
      type="primary"
      size="small"
      v-bind="actionButtonProps"
      @click="emit('click:action')"
    />
  </section>
</template>
<script setup lang="ts">
import i18n from '@/utils/plugins/i18n';
interface SetupWidgetProps {
  title: string;
  description?: string;
  actionButtonProps?: Record<string, any>;
}

const props = withDefaults(defineProps<SetupWidgetProps>(), {
  description: '',
  actionButtonProps: () => ({
    text: i18n.global.t('enable'),
    type: 'primary',
    size: 'small',
  }),
});

const emit = defineEmits<{
  'click:action': [];
}>();
</script>

<style scoped lang="scss">
.setup-widget {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  gap: $unnnic-space-3;
  z-index: 1;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: 1px dashed $unnnic-color-border-base;
  border-radius: $unnnic-radius-2;

  &__title {
    color: $unnnic-color-neutral-darkest;
    font: $unnnic-font-display-2;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;
    font: $unnnic-font-display-4;
  }
}
</style>
