<template>
  <UnnnicModal
    v-show="showModal"
    @close="close"
    class="modal-filters"
    text="Filtros"
  >
    <form
      @submit.prevent
      class="modal-filters__form"
    >
      <template
        v-for="filter of currentDashboardFilters"
        :key="filter.name"
      >
        <DynamicFilter
          :filter="filter"
          :modelValue="filtersInternal[filter.name]"
          @update:modelValue="updateFilter(filter.name, $event)"
          :disabled="
            filter.depends_on && !filtersInternal[filter.depends_on?.filter]
          "
        />
      </template>
    </form>
    <template #options>
      <UnnnicButton
        text="Limpar filtros"
        type="tertiary"
        @click="clearFilters"
      />
      <UnnnicButton
        text="Filtrar"
        type="primary"
        @click="setFilters"
      />
    </template>
  </UnnnicModal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import DynamicFilter from './DynamicFilter.vue';

export default {
  name: 'ModalFilters',

  components: {
    DynamicFilter,
  },

  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      filtersInternal: {},
    };
  },

  created() {
    this.syncFiltersInternal();
  },

  computed: {
    ...mapState({
      currentDashboardFilters: (state) =>
        state.dashboards.currentDashboardFilters,
      appliedFilters: (state) => state.dashboards.appliedFilters,
      widgets: (state) => state.dashboards.currentDashboardWidgets,
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),

    areStoreFiltersAndInternalEqual() {
      return (
        JSON.stringify(this.appliedFilters) ===
        JSON.stringify(this.filtersInternal)
      );
    },
  },

  methods: {
    ...mapActions({
      setAppliedFilters: 'dashboards/setAppliedFilters',
      getCurrentDashboardWidgetsDatas:
        'dashboards/getCurrentDashboardWidgetsDatas',
    }),
    clearFilters() {
      this.filtersInternal = {};
    },
    updateFilter(filterName, value) {
      const hasNonNullValues =
        typeof value === 'object' && value
          ? Object.values(value).some((val) => val)
          : value;

      if (hasNonNullValues) {
        this.filtersInternal[filterName] = value;
      } else {
        delete this.filtersInternal[filterName];
      }
    },
    setFilters() {
      this.setAppliedFilters(this.filtersInternal);
      this.getCurrentDashboardWidgetsDatas();
      this.close();
    },
    syncFiltersInternal() {
      if (!this.areStoreFiltersAndInternalEqual) {
        this.filtersInternal = this.appliedFilters;
      }
    },
    close() {
      this.$emit('close');
    },
  },

  watch: {
    appliedFilters() {
      this.syncFiltersInternal();
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-filters {
  &__form {
    display: grid;
    gap: $unnnic-spacing-xs $unnnic-spacing-sm;
    grid-template-columns: repeat(2, 1fr);

    text-align: left;

    > :nth-child(1),
    > :nth-child(2) {
      grid-column-start: 1;
      grid-column-end: 3;
    }
  }

  :deep(.unnnic-modal-container) {
    .unnnic-modal-container-background {
      overflow: visible;

      &-body {
        padding-top: $unnnic-spacing-lg;
        padding-bottom: $unnnic-spacing-md;

        display: flex;
        flex-direction: row-reverse;
        align-items: center;

        > * {
          padding: 0;
        }

        &-description,
        &-description-container {
          overflow: visible;
        }
      }

      &-body {
        border-radius: $unnnic-border-radius-sm $unnnic-border-radius-sm 0 0;
      }
      &-body-description-container {
        padding-bottom: 0;
      }
      &-button {
        gap: $unnnic-spacing-sm;
        padding-bottom: $unnnic-spacing-lg;

        :first-child {
          margin: 0;
        }
      }
    }
  }
}
</style>
