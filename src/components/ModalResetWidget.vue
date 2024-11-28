<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :title="$t('widgets.reset')"
    showCloseIcon
    :primaryButtonProps="primaryButtonProps"
    :secondaryButtonProps="secondaryButtonProps"
    @primary-button-click="resetWidget"
    @secondary-button-click="updateModelValue"
    @update:model-value="updateModelValue"
  >
    <p>{{ $t('widgets.info_reset') }}</p>
  </UnnnicModalDialog>
</template>

<script>
import { mapActions } from 'vuex';
import Unnnic from '@weni/unnnic-system';

import { clearDeepValues } from '@/utils/object';

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

  computed: {
    primaryButtonProps() {
      return {
        text: this.$t('reset'),
        loading: this.isLoading,
      };
    },
    secondaryButtonProps() {
      return {
        text: this.$t('cancel'),
      };
    },
  },

  methods: {
    ...mapActions({
      updateWidget: 'widgets/updateWidget',
    }),

    updateModelValue(value) {
      this.$emit('update:model-value', value);
    },

    async resetWidget() {
      this.isLoading = true;

      try {
        if (['vtex_order', 'graph_funnel'].includes(this.widget.type)) {
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
      Unnnic.unnnicCallAlert({
        props: {
          text: this.$t('widgets.success_reset'),
          type: 'success',
        },
        seconds: 5,
      });
    },

    callErrorAlert() {
      Unnnic.unnnicCallAlert({
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
