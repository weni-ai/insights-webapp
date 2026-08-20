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

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { UnnnicCallAlert } from '@weni/unnnic-system';

import { useDashboards } from '@/store/modules/dashboards';
import Dashboards from '@/services/api/resources/dashboards';

defineOptions({ name: 'ModalDeleteDashboard' });

interface ModalDeleteDashboardProps {
  modelValue: boolean;
  dashboard: { name: string; uuid: string; is_default?: boolean };
}

const props = defineProps<ModalDeleteDashboardProps>();

const emit = defineEmits<{
  close: [payload: { cascade: boolean }];
}>();

const { t } = useI18n();
const router = useRouter();
const dashboardsStore = useDashboards();
const { dashboards, dashboardDefault } = storeToRefs(dashboardsStore);

const dashboardName = ref('');
const loadingRequest = ref(false);

const validDashboardName = computed(
  () => dashboardName.value === props.dashboard.name,
);

const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    close();
  }
};

const close = (cascade = false) => {
  emit('close', { cascade });
};

const deleteDashboard = () => {
  loadingRequest.value = true;

  Dashboards.deleteDashboard(props.dashboard.uuid)
    .then(() => {
      const hasDeletedDefaultDashboard = props.dashboard.is_default;

      dashboardsStore.dashboards = dashboards.value.filter(
        (item: { uuid: string }) => item.uuid !== props.dashboard.uuid,
      );

      if (hasDeletedDefaultDashboard) {
        dashboardDefault.value.is_default = true;
      }

      UnnnicCallAlert({
        props: {
          text: t('delete_dashboard.alert.success'),
          type: 'success',
        },
        seconds: 5,
      });

      router?.push({
        name: 'dashboard',
        params: { dashboardUuid: dashboardDefault.value.uuid },
      });
    })
    .catch((error) => {
      UnnnicCallAlert({
        props: {
          text: t('delete_dashboard.alert.error'),
          type: 'error',
        },
        seconds: 5,
      });
      console.error(error);
    })
    .finally(() => {
      loadingRequest.value = false;
      close(true);
    });
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
