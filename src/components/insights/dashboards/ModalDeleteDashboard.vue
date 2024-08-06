<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :title="`${$t('delete_dashboard.title')} ${dashboard.name}`"
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
      {{ $t('delete_dashboard.notice') }}
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
import { mapGetters, mapMutations, mapState } from 'vuex';
import unnnic from '@weni/unnnic-system';
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
    ...mapState({ dashboards: (state) => state.dashboards.dashboards }),

    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),

    validDashboardName() {
      return this.dashboardName === this.dashboard.name;
    },
  },
  methods: {
    ...mapMutations({ setDashboards: 'dashboards/SET_DASHBOARDS' }),
    close(cascade = false) {
      this.$emit('close', { cascade });
    },
    deleteDashboard() {
      this.loadingRequest = true;
      Dashboards.deleteDashboard(this.dashboard.uuid)
        .then(() => {
          this.setDashboards(
            this.dashboards.filter((item) => item.uuid !== this.dashboard.uuid),
          );

          unnnic.unnnicCallAlert({
            props: {
              text: this.$t('delete_dashboard.alert.success'),
              type: 'success',
            },
            seconds: 5,
          });

          this.$router.push({
            name: 'dashboard',
            params: { dashboardUuid: this.dashboardDefault.uuid },
          });
        })
        .catch((error) => {
          unnnic.unnnicCallAlert({
            props: {
              text: this.$t('delete_dashboard.alert.error'),
              type: 'error',
            },
            seconds: 5,
          });
          console.log(error);
        })
        .finally(() => {
          this.loadingRequest = false;
          this.close(true);
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
