<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :title="`${$t('edit_dashboard.delete_dashboard')} ${dashboard.name}`"
    :primaryButtonProps="{
      text: $t('delete'),
      disabled: !validDashboardName,
      loading: loadingRequest,
    }"
    :secondaryButtonProps="{ disabled: loadingRequest }"
    showActionsDivider
    showCloseIcon
    size="sm"
    @update:model-value="!$event ? close() : {}"
    @primary-button-click="deleteDashboard"
  >
    <p class="delete-notice">
      {{ $t('edit_dashboard.delete_dashboard_notice') }}
    </p>
    <UnnnicLabel :label="$t('confirmation')" />
    <UnnnicInput
      v-model="dashboardName"
      :placeholder="dashboard.name"
    />
  </UnnnicModalDialog>
</template>

<script>
import Dashboards from '@/services/api/resources/dashboards';
import { mapGetters } from 'vuex';
export default {
  name: 'ModalDeleteDashboard',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    dashboard: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],
  data() {
    return {
      dashboardName: '',
      loadingRequest: false,
    };
  },
  computed: {
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),

    validDashboardName() {
      return this.dashboardName === this.dashboard.name;
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    deleteDashboard() {
      Dashboards.deleteDashboard(this.dashboard.uuid)
        .then(() => {
          this.$router.push({
            name: 'dashboard',
            params: { dashboardUuid: this.dashboardDefault.uuid },
          });
        })
        .catch((error) => {
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
.delete-notice {
  font-family: $unnnic-font-family-secondary;
  font-size: 14px;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-line-height-large * 1.375;
}
</style>
