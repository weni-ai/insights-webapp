<template>
  <section class="content-vtex">
    <UnnnicLabel label="UTM" />
    <UnnnicInput v-model="utmValue" />
    <UnnnicButton
      class="clear-button"
      :text="$t('drawers.reset_widget')"
      type="tertiary"
      :disabled="trimmedUtmValue"
      @click="clearUtm"
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

  emits: ['update:model-value', 'reset-widget'],

  computed: {
    utmValue: {
      get() {
        return this.modelValue.config?.UTM || '';
      },
      set(value) {
        this.updateUtm(value);
      },
    },
  },

  methods: {
    updateUtm(value) {
      this.$emit('update:model-value', {
        ...this.modelValue,
        config: {
          ...this.modelValue.config,
          UTM: value,
        },
      });
    },

    clearUtm() {
      //this.$emit('reset-widget');
      this.updateUtm('');
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
