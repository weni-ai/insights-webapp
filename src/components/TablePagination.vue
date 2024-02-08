<template>
  <div class="table-pagination">
    <section class="table-pagination__pages">
      <p class="table-pagination__pages__count">
        {{ tablePagination.from }} - {{ tablePagination.to }} de
        {{ tablePagination.total }}
      </p>
      <unnnic-pagination
        :value="value"
        @input="goToPage"
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

  computed: {
    tablePagination() {
      const { value, limit, count } = this;
      return {
        from: count === 0 ? 0 : (value - 1) * limit + 1,
        to: Math.min(value * limit, count),
        total: count,
      };
    },
  },

  methods: {
    goToPage(page) {
      this.$emit('updatePage', page);
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
