<template>
  <section class="single-table">
    <h1
      v-if="props.title"
      class="single-table__title"
      data-testid="single-table-title"
    >
      {{ title }}
    </h1>
    <UnnnicTableNext
      data-testid="single-table"
      class="single-table__table"
      :pagination="pagination"
      :paginationTotal="paginationTotal"
      :paginationInterval="paginationInterval"
      :headers="headers"
      :rows="rows"
      :locale="$i18n.locale"
      @update:pagination="$emit('changePage', $event)"
    />
  </section>
</template>

<script>
export default {
  name: 'SingleTable',
};
</script>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  title: { type: String, default: '' },
  pagination: { type: Number, required: true },
  paginationTotal: { type: Number, required: true },
  paginationInterval: { type: Number, default: 5 },
  headers: { type: Array, required: true },
  rows: { type: Array, required: true },
  hidePagination: { type: Boolean, default: false },
});
defineEmits(['changePage']);

const paginationCssToken = computed(() =>
  props.hidePagination ? 'none' : 'flex',
);
</script>

<style scoped lang="scss">
.single-table {
  display: grid;
  gap: 10px;

  &__title {
    color: $unnnic-color-neutral-dark;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-style: normal;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-line-height-large + $unnnic-line-height-medium;
  }

  &__table {
    :deep(.table-pagination) {
      display: v-bind(paginationCssToken);
    }
  }
}
</style>
