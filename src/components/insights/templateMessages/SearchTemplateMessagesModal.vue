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
        class="filter filter__name"
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
        class="filter filter__category"
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
        class="filter filter__language"
        :placeholder="$t('language')"
        source="template-messages-languages"
        data-testid="filter-language"
        @update:model-value="
          tablePagination.page === 1
            ? searchTemplates()
            : (tablePagination.page = 1)
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
          @click="searchTemplates('previous')"
        />
        <UnnnicButton
          type="tertiary"
          size="small"
          iconCenter="arrow-right-1-1"
          :disabled="!tablePagination.next"
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
import { markRaw, reactive, ref, watch, onMounted } from 'vue';

import i18n from '@/utils/plugins/i18n';

import FilterInputText from '../Layout/HeaderFilters/FilterInputText.vue';
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
];

const templateMessages = ref([]);

const tablePagination = reactive({
  next: null,
  previous: null,
});

const searchTemplates = async (cursorKey) => {
  try {
    loadingTemplateMessages.value = true;

    const params = {
      limit: 5,
      cursor: cursorKey ? tablePagination[cursorKey] : undefined,
    };

    const mockTemplateResponse = {
      name: 'Template Name',
      category: 'Category',
      language: 'English',
      updated_at: '20/10/2000',
      quality: 'high',
    };

    const { results, next, previous } = await Promise.resolve({
      next: '',
      previous: '',
      results: new Array(5).fill(mockTemplateResponse),
    });

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
          props: { quality: template.quality },
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
  console.log(row);
};

onMounted(() => searchTemplates());
</script>

<style lang="scss" scoped>
.search-template-messages-modal {
  :deep(.unnnic-modal-dialog__container) {
    width: 1000px;
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
