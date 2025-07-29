<template>
  <AddWidget
    data-testid="add-widget"
    :title="$t('conversations_dashboard.customize_your_dashboard.title')"
    :description="
      $t('conversations_dashboard.customize_your_dashboard.description')
    "
    :actionText="
      $t('conversations_dashboard.customize_your_dashboard.add_widget')
    "
    @action="emit('add')"
  />
</template>

<script setup lang="ts">
import AddWidget from '@/components/insights/conversations/AddWidget.vue';

const emit = defineEmits<{
  (_e: 'add'): void;
}>();
</script>
