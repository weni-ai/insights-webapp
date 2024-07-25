<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    :modelValue="modelValue"
    :title="$t('new_dashboard.title')"
    :primaryButtonText="$t('save')"
    :disabledPrimaryButton="!isValidConfig"
    :loadingPrimaryButton="loadingRequest"
    :secondaryButtonText="$t('cancel')"
    :disabledSecondaryButton="loadingRequest"
    wide
    @primary-button-click="updateDashboard"
    @secondary-button-click="$refs.unnnicDrawer.close()"
    @close="close"
  >
    <template #content>
      <form @submit.prevent>
        <UnnnicLabel :label="$t('dashboard_name')" />
        <UnnnicInput
          v-model="dashboardConfig.name"
          :placeholder="$t('new_dashboard.dashboard_name_placeholder')"
        />
        <UnnnicLabel :label="$t('currency')" />
        <UnnnicSelectSmart
          v-model="dashboardConfig.currency"
          :options="currencyOptions"
          :placeholder="$t('select')"
        />
      </form>
    </template>
  </UnnnicDrawer>
</template>

<script>
import { Dashboards } from '@/services/api';
import unnnic from '@weni/unnnic-system';
export default {
  name: 'DrawerEditDashboard',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    dashboard: { type: Object, required: true },
  },
  emits: ['close', 'update:modelValue'],
  data() {
    return {
      dashboardConfig: {
        name: '',
        currency: [],
      },
      currencyOptions: [
        { label: this.$t('currency_options.BRL'), value: 'BRL' },
        { label: this.$t('currency_options.USD'), value: 'USD' },
        { label: this.$t('currency_options.EUR'), value: 'EUR' },
        { label: this.$t('currency_options.ARS'), value: 'ARS' },
      ],
      loadingRequest: false,
    };
  },
  computed: {
    isValidConfig() {
      return (
        this.dashboard.name.trim() &&
        this.dashboard.currency.length &&
        this.dashboard.currency[0].value
      );
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    updateDashboard() {
      this.loadingRequest = true;

      Dashboards.createFlowsDashboard({
        dashboardName: this.dashboardConfig.name,
        currencyType: this.dashboardConfig.currency[0].value,
      })
        .then((response) => {
          unnnic.unnnicCallAlert({
            props: {
              text: this.$t('new_dashboard.alert.success'),
              type: 'success',
            },
            seconds: 5,
          });
          // TODO redirect
          this.close();
        })
        .catch((error) => {
          unnnic.unnnicCallAlert({
            props: {
              text: this.$t('new_dashboard.alert.error'),
              type: 'error',
            },
            seconds: 5,
          });
          console.log(error);
        })
        .finally(() => {
          this.loadingRequest = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.unnnic-label__label:first-child {
  margin-top: 0;
}
.input-hint {
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-md;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-line-height-large * 1.25; // 20px
  margin-top: $unnnic-spacing-nano;
}

// Temporary adjustments to allow dropdowns to not be limited to the modal space and may overflow
:deep(.unnnic-select-smart__options.active) {
  position: fixed;
  left: auto;
  right: auto;
}
</style>
