<template>
  <div class="table-pagination">
    <section class="table-pagination__pages">
      <p class="table-pagination__pages__count">1 - 10 de 30</p>
      <unnnic-pagination
        :value="value"
        @input="$emit('input', $event)"
        :max="countPages"
        :show="limit"
      />
    </section>
  </div>
</template>

<script>
export default {
  name: 'TablePagination',

  props: {
    value: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    countPages: {
      type: Number,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.table-pagination {
  width: 100%;
  &__pages {
    display: flex;
    align-items: center;
    place-content: space-between;
    height: min-content;

    &__count {
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-body-gt;
    }
  }
}
</style>
