<template>
  <UnnnicModalDialog
    :modelValue="vmodel"
    :title="$t('template_messages_dashboard.templates_modal.title')"
    size="lg"
    showCloseIcon
    class="search-template-messages-modal"
    data-testid="search-template-messages-modal"
    @update:model-value="close()"
  >
    <section
      class="search-template-messages-modal__filters-container"
      data-testid="filters"
    >
      <FilterInputText
        v-model="filters.name"
        class="filter filter__name"
        :placeholder="$t('search')"
        iconPosition="left"
        data-testid="filter-name"
        @update:model-value="handlerSearchTemplatesByName()"
      />
      <FilterSelect
        :modelValue="filters.category"
        class="filter filter__category"
        :placeholder="$t('category')"
        :fetchRequest="() => sourceRequest('categories')"
        keyValueField="value"
        data-testid="filter-category"
        @update:model-value="
          ($event) => {
            filters.category = $event;
            if ($event) searchTemplates();
          }
        "
      />
      <FilterSelect
        :modelValue="filters.language"
        class="filter filter__language"
        :placeholder="$t('language')"
        :fetchRequest="() => sourceRequest('languages')"
        keyValueField="value"
        data-testid="filter-language"
        @update:model-value="
          ($event) => {
            filters.language = $event;
            if ($event) searchTemplates();
          }
        "
      />
    </section>

    <section class="search-template-messages-modal__table-container">
      <UnnnicTableNext
        class="search-template-messages-modal__table"
        :headers="tableHeaders"
        :rows="templateMessages"
        :paginationInterval="5"
        :paginationTotal="5"
        :pagination="1"
        :isLoading="loadingTemplateMessages"
        data-testid="template-messages-table"
        @row-click="rowClick"
      />
      <section class="search-template-messages-modal__table-pagination">
        <UnnnicButton
          type="tertiary"
          size="small"
          iconCenter="arrow-left-1-1"
          :disabled="!tablePagination.previous"
          data-testid="previous-button"
          @click="searchTemplates('previous')"
        />
        <UnnnicButton
          type="tertiary"
          size="small"
          iconCenter="arrow-right-1-1"
          :disabled="!tablePagination.next"
          data-testid="next-button"
          @click="searchTemplates('next')"
        />
      </section>
    </section>
  </UnnnicModalDialog>
</template>

<script>
export default {
  name: 'SearchTemplateMessagesModal',
};
</script>

<script setup>
import { markRaw, reactive, ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';

import i18n from '@/utils/plugins/i18n';

import FilterInputText from '../Layout/HeaderFilters/FilterInputText.vue';
import FilterSelect from '../Layout/HeaderFilters/FilterSelect.vue';

import QualityTemplateMessageFlag from './QualityTemplateMessageFlag.vue';

import MetaTemplateMessageService from '@/services/api/resources/template/metaTemplateMessage';

const store = useStore();

const waba_id = computed(
  () => store.state.dashboards.currentDashboard.config?.waba_id,
);

const project_uuid = computed(() => store.state.config.project?.uuid);

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const vmodel = defineModel({ required: true, type: Boolean });

const loadingTemplateMessages = ref(false);

const filters = reactive({
  name: '',
  category: '',
  language: '',
});

const tableHeaders = [
  {
    content: i18n.global.t(
      'template_messages_dashboard.templates_modal.table.header.name',
    ),
  },
  { content: i18n.global.t('category') },
  { content: i18n.global.t('language') },
  { content: i18n.global.t('status'), size: 1.5 },
];

const sourceRequest = (source) => {
  return MetaTemplateMessageService.listMetricsSource(source);
};

const templateMessages = ref([]);

const tablePagination = reactive({
  next: undefined,
  previous: undefined,
});

const timer = ref(0);

const handlerSearchTemplatesByName = () => {
  if (timer.value !== 0) clearTimeout(timer.value);

  timer.value = setTimeout(async () => {
    searchTemplates();
  }, 500);
};

const searchTemplates = async (cursorKey) => {
  if (loadingTemplateMessages.value) return;
  try {
    loadingTemplateMessages.value = true;

    const after = cursorKey === 'next' && tablePagination.next;
    const before = cursorKey === 'previous' && tablePagination.previous;

    const params = {
      limit: 5,
      after: after || undefined,
      before: before || undefined,
      category: filters.category || undefined,
      language: filters.language || undefined,
      search: filters.name || undefined,
      waba_id: waba_id.value,
      project_uuid: project_uuid.value,
    };

    const { results, next, previous } =
      await MetaTemplateMessageService.listTemplates(params);

    tablePagination.next = next;

    tablePagination.previous = previous;

    templateMessages.value = results.map((template) => ({
      ...template,
      content: [
        template.name,
        template.category,
        template.language,
        {
          component: markRaw(QualityTemplateMessageFlag),
          props: { status: template.status },
          events: {},
        },
      ],
    }));
  } catch (error) {
    console.log(error);
  } finally {
    loadingTemplateMessages.value = false;
  }
};

const rowClick = (row) => {
  store.dispatch('metaTemplateMessage/setSelectedTemplateUuid', row?.id);
  close();
};

onMounted(() => searchTemplates());
</script>

<style lang="scss" scoped>
.search-template-messages-modal {
  :deep(.unnnic-modal-dialog__container) {
    width: 1000px;
  }
  :deep(.search-template-messages-modal__table) {
    :hover.unnnic-table-next__body-row {
      cursor: pointer;
      background-color: $unnnic-color-neutral-lightest;
      font-weight: $unnnic-font-weight-bold;
    }
  }
  &__filters-container {
    display: flex;
    gap: $unnnic-spacing-xs;
    .filter {
      width: 100%;
    }
  }
  &__table-container {
    margin-top: $unnnic-spacing-md;
    :deep(.table-pagination) {
      display: none;
    }
  }
  &__table-pagination {
    display: flex;
    justify-content: end;
    padding: $unnnic-spacing-xs 0;
    gap: $unnnic-spacing-nano;
  }
}
</style>
