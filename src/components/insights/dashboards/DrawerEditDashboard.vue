<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    :modelValue="modelValue"
    :title="$t('edit_dashboard.title')"
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
      <section class="drawer-content">
        <form @submit.prevent>
          <UnnnicLabel :label="$t('dashboard_name')" />
          <UnnnicInput
            v-model="dashboardConfig.name"
            :placeholder="dashboard.name"
          />
          <UnnnicLabel :label="$t('currency')" />
          <UnnnicSelectSmart
            v-model="dashboardConfig.currency"
            :options="currencyOptions"
            :placeholder="$t('select')"
          />
        </form>
        <UnnnicButton
          v-if="dashboard.is_deletable"
          class="delete-dashboard-button"
          type="tertiary"
          :text="$t('edit_dashboard.delete_dashboard')"
          @click="showDeleteDashboardModal = true"
        />
      </section>
    </template>
  </UnnnicDrawer>
  <ModalDeleteDashboard
    v-if="showDeleteDashboardModal"
    v-model="showDeleteDashboardModal"
    :dashboard="dashboard"
    @close="showDeleteDashboardModal = false"
  />
</template>

<script>
import { Dashboards } from '@/services/api';
import ModalDeleteDashboard from './ModalDeleteDashboard.vue';
import unnnic from '@weni/unnnic-system';
export default {
  name: 'DrawerEditDashboard',
  components: {
    ModalDeleteDashboard,
  },
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
      showDeleteDashboardModal: false,
    };
  },
  computed: {
    isValidConfig() {
      return (
        this.dashboardConfig.name.trim() &&
        this.dashboardConfig.currency.length &&
        this.dashboardConfig.currency[0].value
      );
    },
  },
  mounted() {
    const currencyOption = this.currencyOptions.find(
      (currency) => currency.value === this.dashboard.config?.currency_type,
    );
    this.dashboardConfig.currency = currencyOption ? [currencyOption] : [];
    this.dashboardConfig.name = this.dashboard.name;
  },
  methods: {
    close() {
      this.$emit('close');
    },
    updateDashboard() {
      this.loadingRequest = true;

      Dashboards.updateFlowsDashboard({
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
.drawer-content {
  display: grid;
  .delete-dashboard-button {
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
