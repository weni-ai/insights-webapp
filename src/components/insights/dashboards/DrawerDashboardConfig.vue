<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    :style="{ display: showProgressBar ? 'none' : 'flex' }"
    :modelValue="modelValue"
    :withoutOverlay="showDeleteDashboardModal"
    :title="dashboard ? t('edit_dashboard.title') : t('new_dashboard.title')"
    :primaryButtonText="t('save')"
    :disabledPrimaryButton="!isValidConfig"
    :loadingPrimaryButton="loadingRequest"
    :secondaryButtonText="t('cancel')"
    :disabledSecondaryButton="loadingRequest"
    wide
    @primary-button-click="dashboard ? updateDashboard() : createDashboard()"
    @secondary-button-click="close"
    @close="close"
  >
    <template #content>
      <form
        class="config-form"
        @submit.prevent
      >
        <section class="config-form__input">
          <UnnnicLabel :label="t('dashboard_name')" />
          <UnnnicInput
            v-model="dashboardForm.name"
            :placeholder="t('new_dashboard.dashboard_name_placeholder')"
          />
        </section>
        <section class="config-form__input">
          <UnnnicLabel :label="t('currency')" />
          <UnnnicSelect
            v-model="dashboardForm.currency"
            :options="currencyOptions"
            :placeholder="t('select')"
            optionsLines="8"
            itemLabel="label"
            itemValue="value"
          />
        </section>
        <UnnnicButton
          v-if="dashboard?.is_deletable"
          class="config-form__delete-dashboard-button"
          type="tertiary"
          :text="t('edit_dashboard.delete_dashboard')"
          @click="showDeleteDashboardModal = true"
        />
        <section
          v-if="!dashboard"
          class="config-form__layout"
        >
          <UnnnicLabel :label="t('select_layout')" />
          <LayoutSelector @layout-selected="handleLayoutSelected" />
        </section>
      </form>
    </template>
  </UnnnicDrawer>
  <ProgressBar
    v-if="showProgressBar"
    :title="t('new_dashboard.creating_new_dashboard')"
    @progress-complete="handleCreateProgressComplete"
  />
  <ModalDeleteDashboard
    v-if="showDeleteDashboardModal"
    v-model="showDeleteDashboardModal"
    :dashboard="dashboard"
    @close="$event.cascade ? close() : (showDeleteDashboardModal = false)"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import unnnic from '@weni/unnnic-system';

import ProgressBar from '@/components/ProgressBar.vue';
import ModalDeleteDashboard from './ModalDeleteDashboard.vue';
import LayoutSelector from '@/components/insights/dashboards/layout/LayoutSelector.vue';

import { Dashboards } from '@/services/api';
import { Dashboard } from '@/models';
import { useDashboards } from '@/store/modules/dashboards';
import { getCurrencyOptions } from '@/utils/currency';

defineOptions({ name: 'DrawerDashboardConfig' });

const props = defineProps<{
  modelValue: boolean;
  dashboard?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:modelValue', value: boolean): void;
}>();

const { t } = useI18n();
const router = useRouter();

const dashboardsStore = useDashboards();
const { dashboards } = storeToRefs(dashboardsStore);

const dashboardForm = reactive({
  name: '',
  layout: 1,
  currency: '',
});

const loadingRequest = ref(false);
const createdDashboard = ref<any>({});
const showProgressBar = ref(false);
const showDeleteDashboardModal = ref(false);

const currencyOptions = computed(() => {
  return getCurrencyOptions(t);
});

const isValidConfig = computed(() => {
  const commonValidations = !!(
    dashboardForm.name.trim() && dashboardForm.currency
  );

  if (!props.dashboard) {
    return !!commonValidations;
  }

  return commonValidations;
});

onMounted(() => {
  if (props.dashboard) {
    handleDashboardFields();
  }
});

function handleDashboardFields() {
  const currencyOption = currencyOptions.value.find(
    (currency: any) =>
      currency.value === props.dashboard?.config?.currency_type,
  );
  dashboardForm.currency = currencyOption?.value || '';
  dashboardForm.name = props.dashboard?.name || '';
}

function handleLayoutSelected(value: number) {
  dashboardForm.layout = value;
}

function close() {
  emit('close');
}

async function handleCreateProgressComplete() {
  loadingRequest.value = false;
  dashboards.value.push(createdDashboard.value);

  dashboardsStore.currentDashboard = createdDashboard.value;

  await router.push({
    name: 'dashboard',
    params: {
      dashboardUuid: createdDashboard.value.uuid,
    },
  });
  unnnic.unnnicCallAlert({
    props: {
      text: t('new_dashboard.alert.success'),
      type: 'success',
    },
    seconds: 5,
  });
  close();
}

function createDashboard() {
  loadingRequest.value = true;
  Dashboards.createFlowsDashboard({
    dashboardName: dashboardForm.name,
    funnelAmount: dashboardForm.layout,
    currencyType: dashboardForm.currency,
  })
    .then((response: any) => {
      const { dashboard } = response;
      createdDashboard.value = new (Dashboard as any)(
        dashboard.uuid,
        dashboard.name,
        { columns: dashboard.grid[0], rows: dashboard.grid[1] },
        dashboard.is_default,
        dashboard.is_editable,
        dashboard.is_deletable,
        dashboard.config,
      );
      showProgressBar.value = true;
    })
    .catch((error: any) => {
      unnnic.unnnicCallAlert({
        props: {
          text: t('new_dashboard.alert.error'),
          type: 'error',
        },
        seconds: 5,
      });
      console.error('createFlowsDashboard', error);
      close();
    });
}

function updateDashboard() {
  loadingRequest.value = true;

  Dashboards.updateFlowsDashboard({
    dashboardUuid: props.dashboard!.uuid,
    dashboardName: dashboardForm.name,
    currencyType: dashboardForm.currency,
  })
    ?.then((response: any) => {
      let updatedDashboard: any;
      const updatedDashboards = dashboards.value.map((dash: any) => {
        if (dash.uuid === props.dashboard!.uuid) {
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

      dashboardsStore.dashboards = updatedDashboards;
      dashboardsStore.currentDashboard = updatedDashboard;

      unnnic.unnnicCallAlert({
        props: {
          text: t('edit_dashboard.alert.success'),
          type: 'success',
        },
        seconds: 5,
      });
    })
    .catch((error: any) => {
      unnnic.unnnicCallAlert({
        props: {
          text: t('edit_dashboard.alert.error'),
          type: 'error',
        },
        seconds: 5,
      });
      console.error('updateFlowsDashboard', error);
    })
    .finally(() => {
      loadingRequest.value = false;
      close();
    });
}

defineExpose({
  dashboardForm,
  isValidConfig,
  currencyOptions,
  showProgressBar,
  showDeleteDashboardModal,
  loadingRequest,
  createdDashboard,
  close,
  createDashboard,
  updateDashboard,
  handleLayoutSelected,
  handleDashboardFields,
  handleCreateProgressComplete,
});
</script>

<style lang="scss" scoped>
.unnnic-label__label:first-child {
  margin-top: 0;
}

.config-form {
  display: grid;
  gap: $unnnic-space-4;
  &__input-hint {
    font: $unnnic-font-caption-2;
    margin-top: $unnnic-space-1;
  }

  &__layout {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }
}

.unnnic-popover {
  background-color: $unnnic-color-background-snow;
}
</style>
