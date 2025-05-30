<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    :style="{ display: showProgressBar ? 'none' : 'flex' }"
    :modelValue="modelValue"
    :title="dashboard ? $t('edit_dashboard.title') : $t('new_dashboard.title')"
    :primaryButtonText="$t('save')"
    :disabledPrimaryButton="!isValidConfig"
    :loadingPrimaryButton="loadingRequest"
    :secondaryButtonText="$t('cancel')"
    :disabledSecondaryButton="loadingRequest"
    wide
    @primary-button-click="dashboard ? updateDashboard() : createDashboard()"
    @secondary-button-click="$refs.unnnicDrawer.close()"
    @close="close"
  >
    <template #content>
      <form
        class="config-form"
        @submit.prevent
      >
        <section class="config-form__input">
          <UnnnicLabel :label="$t('dashboard_name')" />
          <UnnnicInput
            v-model="dashboardForm.name"
            :placeholder="$t('new_dashboard.dashboard_name_placeholder')"
          />
        </section>
        <section class="config-form__input">
          <UnnnicLabel :label="$t('currency')" />
          <UnnnicSelectSmart
            v-model="dashboardForm.currency"
            :options="currencyOptions"
            :placeholder="$t('select')"
          />
        </section>
        <UnnnicButton
          v-if="dashboard?.is_deletable"
          class="config-form__delete-dashboard-button"
          type="tertiary"
          :text="$t('edit_dashboard.delete_dashboard')"
          @click="showDeleteDashboardModal = true"
        />
        <section
          v-if="!dashboard"
          class="config-form__layout"
        >
          <UnnnicLabel :label="$t('select_layout')" />
          <LayoutSelector @layout-selected="handleLayoutSelected" />
        </section>
      </form>
    </template>
  </UnnnicDrawer>
  <ProgressBar
    v-if="showProgressBar"
    :title="$t('new_dashboard.creating_new_dashboard')"
    @progress-complete="handleCreateProgressComplete"
  />
  <ModalDeleteDashboard
    v-if="showDeleteDashboardModal"
    v-model="showDeleteDashboardModal"
    :dashboard="dashboard"
    @close="$event.cascade ? close() : (showDeleteDashboardModal = false)"
  />
</template>

<script>
import { mapState } from 'pinia';
import unnnic from '@weni/unnnic-system';

import ProgressBar from '@/components/ProgressBar.vue';
import ModalDeleteDashboard from './ModalDeleteDashboard.vue';
import LayoutSelector from '@/components/insights/dashboards/layout/LayoutSelector.vue';

import { Dashboards } from '@/services/api';
import { Dashboard } from '@/models';
import { useDashboards } from '@/store/modules/dashboards';
export default {
  name: 'DrawerDashboardConfig',
  components: { ProgressBar, ModalDeleteDashboard, LayoutSelector },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    dashboard: {
      type: [Object, undefined],
      default: undefined,
    },
  },
  emits: ['close', 'update:modelValue'],
  data() {
    return {
      dashboardForm: {
        name: '',
        layout: 1,
        currency: [],
      },
      currencyOptions: [
        { label: this.$t('currency_options.BRL'), value: 'BRL' },
        { label: this.$t('currency_options.USD'), value: 'USD' },
        { label: this.$t('currency_options.EUR'), value: 'EUR' },
        { label: this.$t('currency_options.ARS'), value: 'ARS' },
      ],
      loadingRequest: false,
      createdDashboard: {},
      showProgressBar: false,

      showDeleteDashboardModal: false,
    };
  },
  computed: {
    ...mapState(useDashboards, ['dashboards']),

    isValidConfig() {
      const commonValidations = !!(
        this.dashboardForm.name.trim() &&
        this.dashboardForm.currency.length &&
        this.dashboardForm.currency[0].value
      );

      if (!this.dashboard) {
        return !!commonValidations;
      }

      return commonValidations;
    },
  },
  mounted() {
    if (this.dashboard) {
      this.handleDashboardFields();
    }
  },
  methods: {
    handleDashboardFields() {
      const currencyOption = this.currencyOptions.find(
        (currency) => currency.value === this.dashboard.config?.currency_type,
      );
      this.dashboardForm.currency = currencyOption ? [currencyOption] : [];
      this.dashboardForm.name = this.dashboard.name;
    },
    handleLayoutSelected(value) {
      this.dashboardForm.layout = value;
    },
    close() {
      this.$emit('close');
    },
    async handleCreateProgressComplete() {
      const dashboardsStore = useDashboards();
      this.loadingRequest = false;
      this.dashboards.push(this.createdDashboard);

      dashboardsStore.currentDashboard = this.createdDashboard;

      await this.$router.push({
        name: 'dashboard',
        params: {
          dashboardUuid: this.createdDashboard.uuid,
        },
      });
      unnnic.unnnicCallAlert({
        props: {
          text: this.$t('new_dashboard.alert.success'),
          type: 'success',
        },
        seconds: 5,
      });
      this.close();
    },
    createDashboard() {
      this.loadingRequest = true;
      Dashboards.createFlowsDashboard({
        dashboardName: this.dashboardForm.name,
        funnelAmount: this.dashboardForm.layout,
        currencyType: this.dashboardForm.currency[0].value,
      })
        .then((response) => {
          const { dashboard } = response;
          this.createdDashboard = new Dashboard(
            dashboard.uuid,
            dashboard.name,
            { columns: dashboard.grid[0], rows: dashboard.grid[1] },
            dashboard.is_default,
            dashboard.is_editable,
            dashboard.is_deletable,
            dashboard.config,
          );
          this.showProgressBar = true;
        })
        .catch((error) => {
          unnnic.unnnicCallAlert({
            props: {
              text: this.$t('new_dashboard.alert.error'),
              type: 'error',
            },
            seconds: 5,
          });
          console.error('createFlowsDashboard', error);
          this.close();
        });
    },
    updateDashboard() {
      const dashboardsStore = useDashboards();
      this.loadingRequest = true;

      Dashboards.updateFlowsDashboard({
        dashboardUuid: this.dashboard.uuid,
        dashboardName: this.dashboardForm.name,
        currencyType: this.dashboardForm.currency[0].value,
      })
        ?.then((response) => {
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

          dashboardsStore.dashboards = dashboards;
          dashboardsStore.currentDashboard = updatedDashboard;

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
          console.error('updateFlowsDashboard', error);
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

.config-form {
  display: grid;
  gap: $unnnic-spacing-sm;
  &__input-hint {
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-line-height-large * 1.25; // 20px
    margin-top: $unnnic-spacing-nano;
  }

  &__layout {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
  }
}

// Temporary adjustments to allow dropdowns to not be limited to the modal space and may overflow
:deep(.unnnic-select-smart__options.active) {
  position: fixed;
  left: auto;
  right: auto;
}
</style>
