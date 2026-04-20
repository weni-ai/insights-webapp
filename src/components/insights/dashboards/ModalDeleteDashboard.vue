<template>
  <UnnnicDialog
    :open="modelValue"
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle>
          {{ $t('delete_dashboard.title') }} {{ dashboard.name }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section
        class="modal-delete-dashboard__body"
        data-testid="modal-delete-dashboard"
      >
        <p
          class="delete-notice"
          data-testid="delete-notice"
        >
          {{ $t('delete_dashboard.notice') }}
        </p>
        <UnnnicLabel :label="$t('confirmation')" />
        <UnnnicInput
          v-model="dashboardName"
          :placeholder="dashboard.name"
          data-testid="input-dashboard-name"
        />
      </section>

      <UnnnicDialogFooter>
        <UnnnicButton
          data-testid="modal-delete-dashboard-cancel"
          type="tertiary"
          :text="$t('cancel')"
          :disabled="loadingRequest"
          @click="close()"
        />
        <UnnnicButton
          data-testid="delete-dashboard-submit"
          type="warning"
          :text="$t('delete')"
          :disabled="!validDashboardName"
          :loading="loadingRequest"
          @click="deleteDashboard"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script>
import { mapState } from 'pinia';
import { useDashboards } from '@/store/modules/dashboards';

import { UnnnicCallAlert } from '@weni/unnnic-system';

import Dashboards from '@/services/api/resources/dashboards';

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
    ...mapState(useDashboards, ['dashboards', 'dashboardDefault']),

    validDashboardName() {
      return this.dashboardName === this.dashboard.name;
    },
  },
  methods: {
    handleOpenChange(isOpen) {
      if (!isOpen) {
        this.close();
      }
    },
    close(cascade = false) {
      this.$emit('close', { cascade });
    },
    deleteDashboard() {
      this.loadingRequest = true;

      Dashboards.deleteDashboard(this.dashboard.uuid)
        .then(() => {
          const dashboardsStore = useDashboards();
          const hasDeletedDefaultDashboard = this.dashboard.is_default;

          dashboardsStore.dashboards = this.dashboards.filter(
            (item) => item.uuid !== this.dashboard.uuid,
          );

          if (hasDeletedDefaultDashboard) {
            this.dashboardDefault.is_default = true;
          }

          UnnnicCallAlert({
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
          UnnnicCallAlert({
            props: {
              text: this.$t('delete_dashboard.alert.error'),
              type: 'error',
            },
            seconds: 5,
          });
          console.error(error);
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
.modal-delete-dashboard {
  &__body {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
    padding: $unnnic-space-6;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
