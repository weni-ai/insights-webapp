<template>
  <UnnnicDialog
    :open="modelValue"
    @update:open="updateModelValue"
  >
    <UnnnicDialogContent size="medium">
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ $t('widgets.reset') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="modal-reset-widget__content">
        <p>{{ $t('widgets.info_reset') }}</p>
      </section>
      <UnnnicDialogFooter>
        <UnnnicButton
          type="tertiary"
          :text="$t('cancel')"
          @click="updateModelValue(false)"
        />
        <UnnnicButton
          type="primary"
          :text="$t('reset')"
          :loading="isLoading"
          @click="resetWidget"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { UnnnicCallAlert } from '@weni/unnnic-system';

import { useWidgets } from '@/store/modules/widgets';
import { clearDeepValues } from '@/utils/object';

defineOptions({ name: 'ModalResetWidget' });

interface ModalResetWidgetProps {
  modelValue: boolean;
  widget?: Record<string, any>;
}

const props = withDefaults(defineProps<ModalResetWidgetProps>(), {
  widget: () => ({}),
});

const emit = defineEmits<{
  'update:model-value': [value: boolean];
  'finish-reset': [];
}>();

const { t } = useI18n();
const widgetsStore = useWidgets();
const { updateWidget } = widgetsStore;

const isLoading = ref(false);

const updateModelValue = (value: boolean) => {
  emit('update:model-value', value);
};

const callSuccessAlert = () => {
  UnnnicCallAlert({
    props: {
      text: t('widgets.success_reset'),
      type: 'success',
    },
    seconds: 5,
  });
};

const callErrorAlert = () => {
  UnnnicCallAlert({
    props: {
      text: t('widgets.error_reset'),
      type: 'error',
    },
    seconds: 5,
  });
};

const resetWidget = async () => {
  isLoading.value = true;

  try {
    if (
      ['vtex_order', 'graph_funnel', 'recurrence', 'vtex_conversions'].includes(
        props.widget.type,
      )
    ) {
      await updateWidget({
        ...props.widget,
        config: {},
        type: 'empty_column',
        name: '',
      });
    } else {
      await updateWidget({
        ...props.widget,
        config: { ...clearDeepValues(props.widget.config), currency: false },
        name: '',
      });
    }

    callSuccessAlert();
  } catch (error) {
    callErrorAlert();
    console.error(error);
  } finally {
    emit('finish-reset');
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.modal-reset-widget__content {
  padding: $unnnic-space-6;
  font: $unnnic-font-body;
  color: $unnnic-color-fg-base;
}
</style>
