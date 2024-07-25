<template>
  <UnnnicModalDialog
    :modelValue="showModal"
    :title="`Excluir Dashboard ${dashboard.name}`"
    :primaryButtonProps="{ text: 'Excluir', disabled: !validDashboardName }"
    showActionsDivider
    showCloseIcon
    size="sm"
    @update:model-value="!$event ? close() : {}"
  >
    <p>
      Essa ação será irreversível, para confirmar a ação digite o nome do
      dashboard
    </p>
    <UnnnicLabel :label="'Confirmação'" />
    <UnnnicInput
      v-model="dashboardName"
      :placeholder="dashboard.name"
    />
  </UnnnicModalDialog>
</template>

<script>
export default {
  name: 'ModalDeleteDashboard',
  props: {
    showModal: {
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
    };
  },
  computed: {
    validDashboardName() {
      return this.dashboardName === this.dashboard.name;
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped></style>
