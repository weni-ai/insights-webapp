<template>
  <UnnnicModalDialog
    :modelValue="showModal"
    :title="$t('new_dashboard.title')"
    showActionsDivider
    showCloseIcon
    size="sm"
    :primaryButtonProps="{
      text: 'Criar Dashboard',
      disabled: !isValidConfig,
    }"
    @update:model-value="!$event ? $emit('close') : {}"
  >
    <form @submit.prevent>
      <UnnnicLabel label="Nome do dashboard" />
      <UnnnicInput
        v-model="dashboard.name"
        :placeholder="'Ex: Vendas'"
      />
      <UnnnicLabel label="Funil" />
      <UnnnicSelectSmart
        v-model="dashboard.qtdFunnel"
        :options="funnelOptions"
        :placeholder="'Selecione'"
      />
      <p class="input-hint">
        Selecione quanto gráficos de funil deseja no seu dashboard
      </p>
    </form>
  </UnnnicModalDialog>
</template>

<script>
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
    };
  },
  computed: {
    isValidConfig() {
      return (
        !!this.dashboard.name.trim() && !!this.dashboard.qtdFunnel[0].value
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.input-hint {
  font-family: Lato;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 166.667% */
}

// Temporary adjustments to allow dropdowns to not be limited to the modal space and may overflow
:deep(.unnnic-select-smart__options.active) {
  position: fixed;
  left: auto;
  right: auto;
}
</style>
