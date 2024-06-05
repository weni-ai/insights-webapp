<template>
  <UnnnicCollapse
    class="metric-accordion"
    :class="{ 'metric-accordion--active': active }"
    :active="active"
    @change="$emit('update:active', $event)"
  >
    <template #header>
      <header class="metric-accordion__header">
        <UnnnicIcon
          icon="check_circle"
          :scheme="iconScheme"
          size="avatar-nano"
          filled
        />
        {{ title }}
      </header>
    </template>

    <section>
      <UnnnicLabel label="Nomear métrica" />
      <UnnnicInput
        :modelValue="name"
        placeholder="Ex: fluxos do projeto"
        @update:model-value="$emit('update:name', $event)"
      />
    </section>
    <section>
      <UnnnicLabel label="Selecionar fluxo de origem" />
      <UnnnicSelectSmart
        :modelValue="flow"
        :options="flowsOptions"
        autocomplete
        autocompleteIconLeft
        autocompleteClearOnFocus
        @update:model-value="$emit('update:flow', $event)"
      />
    </section>
  </UnnnicCollapse>
</template>

<script>
export default {
  name: 'MetricAccordion',

  props: {
    active: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    flow: {
      type: Array,
      default: () => [],
    },
    flowsOptions: {
      type: Array,
      default: () => [],
    },
  },

  emits: ['update:name', 'update:flow', 'update:active'],

  computed: {
    iconScheme() {
      const { name, flow } = this;
      return name && flow[0]?.value ? 'weni-600' : 'neutral-soft';
    },
  },
};
</script>

<style lang="scss" scoped>
.metric-accordion {
  border-radius: $unnnic-border-radius-sm;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  :deep(.unnnic-collapse__header) {
    padding: $unnnic-spacing-ant;
  }
  :deep(.unnnic-collapse__body) {
    margin-top: - calc($unnnic-spacing-ant + $unnnic-spacing-nano);
    padding: 0 $unnnic-spacing-ant $unnnic-spacing-ant;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-nano;

    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-line-height-small * 5.5;
  }
}
</style>
