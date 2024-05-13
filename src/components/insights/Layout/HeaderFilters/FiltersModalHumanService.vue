<template>
  <UnnnicModal
    :showModal="showModal"
    @close="close"
    class="filters-modal-human-service"
    text="Filtros"
  >
    <form
      @submit.prevent
      class="filters-modal-human-service__form"
    >
      <section>
        <UnnnicLabel label="Pesquisa por contato" />
        <UnnnicInput
          v-model="filtersClone.contact"
          iconRight="search"
          placeholder="Nome ou URN do contato"
        />
      </section>
      <section>
        <UnnnicLabel label="Data" />
        <UnnnicInputDatePicker
          class="form__date-picker"
          v-model="filtersClone.date"
          position="right"
          inputFormat="DD/MM/YYYY"
        />
      </section>
      <section>
        <UnnnicLabel label="Setor" />
        <UnnnicSelectSmart
          v-model="filtersClone.sector"
          :options="selects.sectors"
          autocomplete
          autocompleteIconLeft
          autocompleteClearOnFocus
        />
      </section>
      <section>
        <UnnnicLabel label="Fila" />
        <UnnnicSelectSmart
          v-model="filtersClone.queue"
          :disabled="hasSectorFiltered || selects.queues.length < 2"
          :options="selects.queues"
          autocomplete
          autocompleteIconLeft
          autocompleteClearOnFocus
        />
      </section>
      <section>
        <UnnnicLabel label="Agente" />
        <UnnnicSelectSmart
          v-model="filtersClone.agent"
          :disabled="hasSectorFiltered || selects.agents.length < 2"
          :options="selects.agents"
          autocomplete
          autocompleteIconLeft
          autocompleteClearOnFocus
        />
      </section>
      <section>
        <UnnnicLabel label="Tags" />
        <UnnnicSelectSmart
          v-model="filtersClone.tags"
          :disabled="hasSectorFiltered || selects.tags.length < 2"
          :options="selects.tags"
          autocomplete
          autocompleteIconLeft
          autocompleteClearOnFocus
        />
      </section>
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
        @click="emitFilters"
      />
    </template>
  </UnnnicModal>
</template>

<script>
export default {
  name: 'FiltersModalHumanService',

  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
    filters: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      filtersClone: {},

      selects: {
        sectors: [
          { value: '', label: 'Selecione setor' },
          { value: 'all', label: 'Todos' },
        ],
        queues: [],
        agents: [],
        tags: [],
      },
    };
  },

  created() {
    this.clearFilters();
  },

  computed: {
    defaultFilters() {
      return {
        contact: '',
        date: {
          start: '',
          end: '',
        },
        sector: [{ value: 'all', label: 'Todos' }],
        queue: [{ value: '', label: 'Selecione fila' }],
        agent: [{ value: '', label: 'Selecione agente' }],
        tags: [{ value: '', label: 'Selecione tags' }],
      };
    },

    hasSectorFiltered() {
      return this.filtersClone.sector[0]?.value === '';
    },

    areFiltersPropAndCloneEqual() {
      return JSON.stringify(this.filters) === JSON.stringify(this.filtersClone);
    },
  },

  methods: {
    clearFilters() {
      this.filtersClone = { ...this.defaultFilters };
    },
    emitFilters() {
      this.$emit('update:filters', this.filtersClone);
      this.close();
    },
    close() {
      this.$emit('close');
    },
    syncFiltersClone() {
      if (!this.areFiltersPropAndCloneEqual) {
        const { filters, selects } = this;

        const filterHandlers = {
          default: (filterName, filterValue) => {
            this.filtersClone[filterName] = filterValue;
          },
          select: (filterName) => {
            const filterEquivalent = this.filtersClone?.filter(
              (mappedFilter) => mappedFilter.value === filterName,
            );
            this.filtersClone[filterName] = filterEquivalent;
          },
          date: (filterValue) => {
            this.filtersClone.date = {
              start: filterValue.dateStart,
              end: filterValue.dateEnd,
            };
          },
        };

        Object.keys(filters)?.forEach((filterName) => {
          const filterValue = filters[filterName];

          const handler = selects[filterName]
            ? filterHandlers.select
            : filterValue.dateStart && filterValue.dateEnd
              ? filterHandlers.date
              : filterHandlers.default;
          handler(filterName, filterValue);
        });
      }
    },
  },

  watch: {
    filters() {
      this.syncFiltersClone();
    },
  },
};
</script>

<style lang="scss" scoped>
.filters-modal-human-service {
  &__form {
    display: grid;
    gap: $unnnic-spacing-xs $unnnic-spacing-sm;
    grid-auto-columns: repeat(2, 1fr);

    text-align: left;

    > :nth-child(1),
    > :nth-child(2) {
      grid-column-start: 1;
      grid-column-end: 3;
    }

    .form__date-picker {
      display: grid;
    }
  }

  :deep(.unnnic-label__label),
  :deep(.unnnic-form__label) {
    margin: 0 0 $unnnic-spacing-nano;
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
