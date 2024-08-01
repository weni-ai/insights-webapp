<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    :style="{ display: loadingRequest ? 'none' : 'flex' }"
    :modelValue="modelValue"
    :title="$t('new_dashboard.title')"
    :primaryButtonText="$t('save')"
    :disabledPrimaryButton="!isValidConfig"
    :loadingPrimaryButton="loadingRequest"
    :secondaryButtonText="$t('cancel')"
    :disabledSecondaryButton="loadingRequest"
    wide
    @primary-button-click="createDashboard"
    @secondary-button-click="$refs.unnnicDrawer.close()"
    @close="close"
  >
    <template #content>
      <form @submit.prevent>
        <UnnnicLabel :label="$t('dashboard_name')" />
        <UnnnicInput
          v-model="dashboard.name"
          :placeholder="$t('new_dashboard.dashboard_name_placeholder')"
        />
        <UnnnicLabel :label="$t('funnel')" />
        <UnnnicSelectSmart
          v-model="dashboard.qtdFunnel"
          :options="funnelOptions"
          :placeholder="$t('select')"
        />
        <p class="input-hint">
          {{ $t('new_dashboard.funnel_hint') }}
        </p>
        <UnnnicLabel :label="$t('currency')" />
        <UnnnicSelectSmart
          v-model="dashboard.currency"
          :options="currencyOptions"
          :placeholder="$t('select')"
        />
      </form>
    </template>
  </UnnnicDrawer>
  <section
    v-if="loadingRequest"
    class="progress-bar-container"
  >
    <UnnnicProgressBar
      v-model="createDashboardProgress"
      inline
      title="Criando novo Dashboard"
    />
  </section>
</template>

<script>
import { Dashboards } from '@/services/api';
import unnnic from '@weni/unnnic-system';
export default {
  name: 'DrawerNewDashboard',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close', 'update:modelValue'],
  data() {
    return {
      dashboard: {
        name: '',
        qtdFunnel: [],
        currency: [],
      },
      funnelOptions: [
        { label: this.$t('select'), value: '' },
        { label: this.$t('none'), value: '0' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ],
      currencyOptions: [
        { label: this.$t('currency_options.BRL'), value: 'BRL' },
        { label: this.$t('currency_options.USD'), value: 'USD' },
        { label: this.$t('currency_options.EUR'), value: 'EUR' },
        { label: this.$t('currency_options.ARS'), value: 'ARS' },
      ],
      loadingRequest: false,
      createDashboardProgress: 0,
      createDashboardInterval: null,
    };
  },
  computed: {
    isValidConfig() {
      return (
        this.dashboard.name.trim() &&
        this.dashboard.qtdFunnel.length &&
        this.dashboard.qtdFunnel[0].value !== '' &&
        this.dashboard.currency.length &&
        this.dashboard.currency[0].value
      );
    },
  },
  methods: {
    startCreateDashboardProgress() {
      this.createDashboardProgress = 0;
      const interval = 50;
      this.createDashboardInterval = setInterval(
        this.updateDashboardProgress,
        interval,
      );
    },
    updateDashboardProgress() {
      if (this.createDashboardProgress === 100) {
        clearInterval(this.createDashboardInterval);
        this.loadingRequest = false;
        unnnic.unnnicCallAlert({
          props: {
            text: this.$t('new_dashboard.alert.success'),
            type: 'success',
          },
          seconds: 5,
        });
        this.close();
      } else {
        this.createDashboardProgress += 1;
      }
    },
    close() {
      this.$emit('close');
    },
    createDashboard() {
      this.loadingRequest = true;

      Dashboards.createFlowsDashboard({
        dashboardName: this.dashboard.name,
        funnelAmount: Number(this.dashboard.qtdFunnel[0].value),
        currencyType: this.dashboard.currency[0].value,
      })
        .then((response) => {
          this.startCreateDashboardProgress();
          // TODO redirect
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
          this.close();
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-bar-container {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  background-color: rgba(0, 0, 0, 0.4);
  top: 0;
  left: 0;
}
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
