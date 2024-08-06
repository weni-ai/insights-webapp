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
    @close="$event.cascade ? close() : (showDeleteDashboardModal = false)"
  />
</template>

<script>
import { Dashboards } from '@/services/api';
import ModalDeleteDashboard from './ModalDeleteDashboard.vue';
import unnnic from '@weni/unnnic-system';
import { mapMutations, mapState } from 'vuex';
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
    ...mapState({ dashboards: (state) => state.dashboards.dashboards }),
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
    ...mapMutations({
      setDashboards: 'dashboards/SET_DASHBOARDS',
      setCurrentDashboard: 'dashboards/SET_CURRENT_DASHBOARD',
    }),
    close() {
      this.$emit('close');
    },
    updateDashboard() {
      this.loadingRequest = true;

      Dashboards.updateFlowsDashboard({
        dashboardUuid: this.dashboard.uuid,
        dashboardName: this.dashboardConfig.name,
        currencyType: this.dashboardConfig.currency[0].value,
      })
        .then((response) => {
          let updatedDashboard;
          const dashboards = this.dashboards.map((dash) => {
            if (dash.uuid === this.dashboard.uuid) {
              updatedDashboard = {
                ...dash,
                name: response.name,
                config: {
                  ...dash.config,
                  currency_type: response.config.currency_type,
                },
              };
              return updatedDashboard;
            }
            return dash;
          });

          this.setDashboards(dashboards);
          this.setCurrentDashboard(updatedDashboard);

          unnnic.unnnicCallAlert({
            props: {
              text: this.$t('edit_dashboard.alert.success'),
              type: 'success',
            },
            seconds: 5,
          });
        })
        .catch((error) => {
          unnnic.unnnicCallAlert({
            props: {
              text: this.$t('edit_dashboard.alert.error'),
              type: 'error',
            },
            seconds: 5,
          });
          console.log(error);
        })
        .finally(() => {
          this.loadingRequest = false;
          this.close();
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
