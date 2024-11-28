<template>
  <UnnnicModalDialog
    :modelValue="vmodel"
    :title="$t('template_messages_dashboard.templates_modal.title')"
    size="lg"
    showCloseIcon
    class="search-template-messages-modal"
  >
    <section class="search-template-messages-modal__filters-container">
      <FilterInputText
        v-model="filters.name"
        :placeholder="$t('search')"
        iconPosition="left"
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
        @update:model-value="
          tablePagination.page === 1
            ? searchTemplates()
            : (tablePagination.page = 1)
        "
      />
      <FilterSelectDate
        v-model="filters.date"
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
import { asyncTimeout } from '@/utils/time';
import i18n from '@/utils/plugins/i18n';

import FilterInputText from '../Layout/HeaderFilters/FilterInputText.vue';
import FilterSelectDate from '../Layout/HeaderFilters/FilterSelectDate.vue';
import FilterSelect from '../Layout/HeaderFilters/FilterSelect.vue';

import QualityTemplateMessageFlag from './QualityTemplateMessageFlag.vue';

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
    await asyncTimeout(3000);
    const { results, count } = await Promise.resolve({
      count: 100,
      results: [
        {
          content: [
            'name',
            'marketing',
            'pt-br',
            {
              component: QualityTemplateMessageFlag,
              props: { quality: 'high' },
              events: {},
            },
            '21/10/2024',
          ],
        },
        {
          content: [
            'name',
            'marketing',
            'pt-br',
            {
              component: QualityTemplateMessageFlag,
              props: { quality: 'high' },
              events: {},
            },
            '21/10/2024',
          ],
        },
        {
          content: [
            'name',
            'marketing',
            'pt-br',
            {
              component: QualityTemplateMessageFlag,
              props: { quality: 'medium' },
              events: {},
            },
            '21/10/2024',
          ],
        },
        {
          content: [
            'name',
            'marketing',
            'pt-br',
            {
              component: QualityTemplateMessageFlag,
              props: { quality: 'low' },
              events: {},
            },
            '21/10/2024',
          ],
        },
        {
          content: [
            'name',
            'marketing',
            'pt-br',
            {
              component: QualityTemplateMessageFlag,
              props: { quality: 'low' },
              events: {},
            },
            '21/10/2024',
          ],
        },
      ],
    });
    tablePagination.total = count;
    templateMessages.value = results;
  } catch (error) {
    console.log(error);
  } finally {
    loadingTemplateMessages.value = false;
  }
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
