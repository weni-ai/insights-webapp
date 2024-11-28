<template>
  <UnnnicModalDialog
    :modelValue="vmodel"
    :title="$t('template_messages_dashboard.templates_modal.title')"
    size="lg"
    showCloseIcon
    class="search-template-messages-modal"
    @update:model-value="close()"
  >
    <section class="search-template-messages-modal__filters-container">
      <FilterInputText
        v-model="filters.name"
        :placeholder="$t('search')"
        iconPosition="left"
        data-testid="filter-name"
        @update:model-value="
          tablePagination.page === 1
            ? searchTemplates()
            : (tablePagination.page = 1)
        "
      />
      <FilterSelect
        v-model="filters.category"
        :placeholder="$t('category')"
        source="template-messages-categories"
        data-testid="filter-category"
        @update:model-value="
          tablePagination.page === 1
            ? searchTemplates()
            : (tablePagination.page = 1)
        "
      />
      <FilterSelect
        v-model="filters.language"
        :placeholder="$t('language')"
        source="template-messages-languages"
        data-testid="filter-language"
        @update:model-value="
          tablePagination.page === 1
            ? searchTemplates()
            : (tablePagination.page = 1)
        "
      />
      <FilterSelectDate
        v-model="filters.date"
        data-testid="filter-date"
        @update:model-value="
          tablePagination.page === 1
            ? searchTemplates()
            : (tablePagination.page = 1)
        "
      />
    </section>

    <section class="search-template-messages-modal__table-container">
      <UnnnicTableNext
        :headers="tableHeaders"
        :rows="templateMessages"
        :paginationInterval="tablePagination.limit"
        :paginationTotal="tablePagination.total"
        :pagination="tablePagination.page"
        :isLoading="loadingTemplateMessages"
        data-testid="template-messages-table"
        @row-click="rowClick"
        @update:pagination="tablePagination.page = $event"
      />
    </section>
  </UnnnicModalDialog>
</template>

<script>
export default {
  name: 'SearchTemplateMessagesModal',
};
</script>

<script setup>
import { reactive, ref, watch } from 'vue';

import i18n from '@/utils/plugins/i18n';

import FilterInputText from '../Layout/HeaderFilters/FilterInputText.vue';
import FilterSelectDate from '../Layout/HeaderFilters/FilterSelectDate.vue';
import FilterSelect from '../Layout/HeaderFilters/FilterSelect.vue';

import QualityTemplateMessageFlag from './QualityTemplateMessageFlag.vue';

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
  date: { start: '', end: '' },
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
  {
    content: i18n.global.t(
      'template_messages_dashboard.templates_modal.table.header.last_edited',
    ),
    isSortable: true,
  },
];

const templateMessages = ref([]);

const tablePagination = reactive({
  page: 1,
  limit: 5,
  total: 0,
});

const searchTemplates = async () => {
  try {
    loadingTemplateMessages.value = true;
    const params = {
      limit: tablePagination.limit,
      offset:
        tablePagination.page === 1
          ? 0
          : tablePagination.limit * tablePagination.page,
    };

    const mockTemplateResponse = {
      name: 'Template Name',
      category: 'Category',
      language: 'English',
      updated_at: '20/10/2000',
      quality: 'high',
    };

    const { results, count } = await Promise.resolve({
      count: 100,
      results: new Array(5).fill(mockTemplateResponse),
    });

    tablePagination.total = count;

    templateMessages.value = results.map((template) => ({
      content: [
        template.name,
        template.category,
        template.language,
        {
          component: QualityTemplateMessageFlag,
          props: { quality: template.quality },
        },
        template.updated_at,
      ],
    }));
  } catch (error) {
    console.log(error);
  } finally {
    loadingTemplateMessages.value = false;
  }
};

const rowClick = (row) => {
  // TODO
};

watch(
  () => tablePagination.page,
  () => {
    searchTemplates();
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.search-template-messages-modal {
  :deep(.unnnic-modal-dialog__container) {
    width: 1000px;
  }
  &__filters-container {
    display: flex;
    gap: $unnnic-spacing-xs;

    :deep(.filter-date) {
      width: 30%;
    }
  }
  &__table-container {
    margin-top: $unnnic-spacing-md;
  }
}
</style>
