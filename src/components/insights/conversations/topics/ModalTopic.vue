<template>
  <UnnnicDialog
    data-testid="modal-topic"
    :open="props.isOpen"
    @update:open="handleUpdateOpen"
  >
    <UnnnicDialogContent
      size="small"
      class="modal-topic"
    >
      <UnnnicDialogHeader :type="modalType">
        <UnnnicDialogTitle>{{ title }}</UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="modal-topic__content">
        {{ description }}
      </section>

      <UnnnicDialogFooter>
        <UnnnicButton
          type="tertiary"
          :text="secondaryButtonText"
          @click="secondaryButtonClick"
        />
        <UnnnicButton
          :type="primaryButtonVariant"
          :text="primaryButtonText"
          @click="primaryButtonClick"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
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
  (_e: 'primary-button-click'): void;
  (_e: 'secondary-button-click'): void;
  (_e: 'close'): void;
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

const primaryButtonText = computed(() => {
  const remove = ['remove-topic', 'remove-sub-topic'];

  return remove.includes(props.type)
    ? t('conversations_dashboard.form_topic.remove_modal.remove')
    : t('conversations_dashboard.form_topic.cancel_modal.cancel');
});

const secondaryButtonText = computed(() => {
  const remove = ['remove-topic', 'remove-sub-topic'];

  return remove.includes(props.type)
    ? t('conversations_dashboard.form_topic.remove_modal.cancel')
    : t('conversations_dashboard.form_topic.cancel_modal.continue');
});

const primaryButtonVariant = computed(() => {
  const remove = ['remove-topic', 'remove-sub-topic'];
  return remove.includes(props.type) ? 'warning' : 'attention';
});

const title = computed(() => {
  const titleMap = {
    'remove-topic': t(
      'conversations_dashboard.form_topic.remove_modal.title_remove_topic',
    ),
    'remove-sub-topic': t(
      'conversations_dashboard.form_topic.remove_modal.title_remove_sub_topic',
    ),
    'cancel-topic': t('conversations_dashboard.form_topic.cancel_modal.title'),
  };

  return titleMap[props.type];
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

const handleUpdateOpen = (open: boolean) => {
  if (!open) {
    emit('close');
  }
};

const secondaryButtonClick = () => {
  emit('secondary-button-click');
};

const primaryButtonClick = () => {
  emit('primary-button-click');
};
</script>

<style lang="scss" scoped>
.modal-topic {
  &__content {
    padding: $unnnic-space-6;
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
