<template>
  <section class="content-vtex">
    <UnnnicInput
      :modelValue="widgetName"
      :label="$t('drawers.config_gallery.options.vtex.form.name.label')"
      :placeholder="
        $t('drawers.config_gallery.options.vtex.form.name.placeholder')
      "
      data-testid="widget-name-input"
      @update:model-value="updateWidgetName"
    />
    <UnnnicInput
      :modelValue="utmValue"
      :label="$t('drawers.config_gallery.options.vtex.form.utm.label')"
      :placeholder="
        $t('drawers.config_gallery.options.vtex.form.utm.placeholder')
      "
      data-testid="utm-input"
      @update:model-value="updateUtm"
    />
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
      required: true,
    },
  },

  emits: [
    'update:model-value',
    'reset-widget',
    'update-disable-primary-button',
  ],

  data() {
    return {
      widgetName: '',
      utmValue: '',
      validForm: false,
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
    isDisableResetWidget() {
      const isEmptyWidget = this.modelValue?.type === 'empty_column';

      return isEmptyWidget;
    },
  },

  watch: {
    validForm: {
      immediate: true,
      handler() {
        this.emitValidForm();
      },
    },
    widgetName: {
      handler() {
        this.updateValidForm();
      },
    },
    utmValue: {
      handler() {
        this.updateValidForm();
      },
    },
  },

  mounted() {
    this.widgetName =
      this.modelValue.name === 'vtex_orders' ? '' : this.modelValue.name;
    this.utmValue = this.modelValue.config?.filter?.utm || '';
  },

  methods: {
    updateWidgetData() {
      this.$emit('update:model-value', {
        ...this.modelValue,
        name: this.widgetName?.trim() || 'vtex_orders',
        config: {
          ...this.modelValue.config,
          ...this.defaultConfigVtex,
          filter: {
            utm: this.utmValue,
          },
        },
      });
    },

    updateUtm(utm) {
      this.utmValue = utm;
      this.updateWidgetData();
    },

    updateWidgetName(name) {
      this.widgetName = name;
      this.updateWidgetData();
    },

    resetWidget() {
      this.$emit('reset-widget');
    },

    updateValidForm() {
      this.validForm = !!this.utmValue.trim();
    },

    emitValidForm() {
      this.$emit('update-disable-primary-button', !this.validForm);
    },
  },
};
</script>

<style lang="scss" scoped>
.content-vtex {
  display: grid;
  gap: $unnnic-space-4;
}
</style>
