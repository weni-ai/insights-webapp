<template>
  <UnnnicModalDialog
    :modelValue="showModal"
    :title="$t('new_dashboard.title')"
    showActionsDivider
    showCloseIcon
    size="sm"
    :primaryButtonProps="{
      text: $t('new_dashboard.create_dashboard'),
      disabled: !isValidConfig,
      loading: loadingRequest,
    }"
    @primary-button-click="createDashboard"
    @update:model-value="!$event ? close() : {}"
  >
    <form @submit.prevent>
      <UnnnicLabel :label="$t('new_dashboard.dashboard_name')" />
      <UnnnicInput
        v-model="dashboard.name"
        :placeholder="$t('new_dashboard.dashboard_name_placeholder')"
      />
      <UnnnicLabel :label="$t('new_dashboard.funnel')" />
      <UnnnicSelectSmart
        v-model="dashboard.qtdFunnel"
        :options="funnelOptions"
        :placeholder="$t('select')"
      />
      <p class="input-hint">
        {{ $t('new_dashboard.funnel_hint') }}
      </p>
    </form>
  </UnnnicModalDialog>
</template>

<script>
import { Dashboards } from '@/services/api';
import unnnic from '@weni/unnnic-system';
export default {
  name: 'ModalNewDashboard',
  props: {
    showModal: {
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
      },
      funnelOptions: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
      ],
      loadingRequest: false,
    };
  },
  computed: {
    isValidConfig() {
      return (
        !!this.dashboard.name.trim() && !!this.dashboard.qtdFunnel[0].value
      );
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    createDashboard() {
      this.loadingRequest = true;
      Dashboards.createFlowsDashboard({
        dashboardName: this.dashboard.name,
        funnelAmount: this.dashboard.qtdFunnel[0].value,
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
