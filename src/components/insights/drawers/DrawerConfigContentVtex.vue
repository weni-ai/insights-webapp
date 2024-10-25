<template>
  <section class="content-vtex">
    <UnnnicLabel label="UTM" />
    <UnnnicInput v-model="utmValue" />
    <UnnnicButton
      class="clear-button"
      :text="$t('drawers.reset_widget')"
      type="tertiary"
      :disabled="isDisableResetWidget"
      @click="resetWidget"
    />
  </section>
</template>

<script>
export default {
  name: 'DrawerConfigContentVtex',

  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: [
    'update:model-value',
    'reset-widget',
    'update-disable-primary-button',
  ],

  data() {
    return {
      defaultConfigVtex: {
        orders: {
          icon: 'local_activity',
        },
        total_value: {
          icon: 'currency_exchange',
        },
        average_ticket: {
          icon: 'sell',
        },
      },
    };
  },

  computed: {
    utmValue: {
      get() {
        return this.modelValue.config?.filter?.utm || '';
      },
      set(value) {
        this.updateUtm(value);
      },
    },

    isDisableResetWidget() {
      const isEmptyWidget = this.modelValue.type === 'empty_column';

      return isEmptyWidget;
    },
  },

  methods: {
    updateUtm(value) {
      this.$emit('update:model-value', {
        ...this.modelValue,
        config: {
          ...this.modelValue.config,
          ...this.defaultConfigVtex,
          filter: {
            utm: value,
          },
        },
      });
    },

    resetWidget() {
      this.$emit('reset-widget');
    },
  },
};
</script>

<style lang="scss" scoped>
.content-vtex {
  display: grid;
  gap: $unnnic-spacing-nano;

  .clear-button {
    margin-top: $unnnic-spacing-nano;
  }
}
</style>
