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

<script>
import { mapActions } from 'pinia';

import { useWidgets } from '@/store/modules/widgets';

import { clearDeepValues } from '@/utils/object';

import { UnnnicCallAlert } from '@weni/unnnic-system';

export default {
  name: 'ModalResetWidget',

  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    widget: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['update:model-value', 'finish-reset'],

  data() {
    return {
      isLoading: false,
    };
  },

  methods: {
    ...mapActions(useWidgets, ['updateWidget']),

    updateModelValue(value) {
      this.$emit('update:model-value', value);
    },

    async resetWidget() {
      this.isLoading = true;

      try {
        if (
          [
            'vtex_order',
            'graph_funnel',
            'recurrence',
            'vtex_conversions',
          ].includes(this.widget.type)
        ) {
          await this.updateWidget({
            ...this.widget,
            config: {},
            type: 'empty_column',
            name: '',
          });
        } else {
          await this.updateWidget({
            ...this.widget,
            config: { ...clearDeepValues(this.widget.config), currency: false },
            name: '',
          });
        }

        this.callSuccessAlert();
      } catch (error) {
        this.callErrorAlert();
        console.error(error);
      } finally {
        this.$emit('finish-reset');
        this.isLoading = false;
      }
    },

    callSuccessAlert() {
      UnnnicCallAlert({
        props: {
          text: this.$t('widgets.success_reset'),
          type: 'success',
        },
        seconds: 5,
      });
    },

    callErrorAlert() {
      UnnnicCallAlert({
        props: {
          text: this.$t('widgets.error_reset'),
          type: 'error',
        },
        seconds: 5,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-reset-widget__content {
  padding: $unnnic-space-6;
  font: $unnnic-font-body;
  color: $unnnic-color-fg-base;
}
</style>
