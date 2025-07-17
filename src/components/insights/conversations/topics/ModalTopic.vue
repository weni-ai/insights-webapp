<template>
  <UnnnicModalDialog
    data-testid="modal-topic"
    :modelValue="props.isOpen"
    :title="title"
    :type="modalType"
    :icon="icon"
    :primaryButtonProps="primaryButtonProps"
    :secondaryButtonProps="secondaryButtonProps"
    showCloseIcon
    size="sm"
    @secondary-button-click="secondaryButtonClick"
    @primary-button-click="primaryButtonClick"
  >
    {{ description }}
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  type: 'remove-topic' | 'remove-sub-topic' | 'cancel-topic';
  text?: string;
  isOpen: boolean;
}

const emit = defineEmits<{
  (e: 'primary-button-click'): void;
  (e: 'secondary-button-click'): void;
}>();

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  type: 'remove-topic',
  isOpen: false,
  text: '',
});

const modalType = computed(() => {
  const remove = ['remove-topic', 'remove-sub-topic'];

  return remove.includes(props.type) ? 'warning' : 'attention';
});

const icon = computed(() => {
  const remove = ['remove-topic', 'remove-sub-topic'];

  return remove.includes(props.type) ? 'warning' : 'error';
});

const primaryButtonProps = computed(() => {
  const remove = ['remove-topic', 'remove-sub-topic'];

  return {
    text: remove.includes(props.type)
      ? t('conversations_dashboard.form_topic.remove_modal.remove')
      : t('conversations_dashboard.form_topic.cancel_modal.cancel'),
  };
});

const secondaryButtonProps = computed(() => {
  const remove = ['remove-topic', 'remove-sub-topic'];

  return {
    text: remove.includes(props.type)
      ? t('conversations_dashboard.form_topic.remove_modal.cancel')
      : t('conversations_dashboard.form_topic.cancel_modal.continue'),
  };
});

const title = computed(() => {
  const title = {
    'remove-topic': t(
      'conversations_dashboard.form_topic.remove_modal.title_remove_topic',
    ),
    'remove-sub-topic': t(
      'conversations_dashboard.form_topic.remove_modal.title_remove_sub_topic',
    ),
    'cancel-topic': t('conversations_dashboard.form_topic.cancel_modal.title'),
  };

  return title[props.type];
});

const description = computed(() => {
  const desc = {
    'remove-topic': t(
      'conversations_dashboard.form_topic.remove_modal.description_remove_topic',
      { topic: props.text },
    ),
    'remove-sub-topic': t(
      'conversations_dashboard.form_topic.remove_modal.description_remove_sub_topic',
      { sub_topic: props.text },
    ),
    'cancel-topic': t(
      'conversations_dashboard.form_topic.cancel_modal.description_cancel',
    ),
  };

  return desc[props.type];
});

const secondaryButtonClick = () => {
  emit('secondary-button-click');
};

const primaryButtonClick = () => {
  emit('primary-button-click');
};
</script>

<style lang="scss" scoped>
.modal-topic {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
