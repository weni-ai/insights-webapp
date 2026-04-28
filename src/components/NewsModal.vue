<template>
  <UnnnicDialog
    data-testid="news-modal"
    :open="modelValue"
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent
      size="large"
      class="news-modal"
    >
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>{{ title }}</UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section
        class="news-modal__content"
        data-testid="news-modal-content"
      >
        <section
          class="news-modal__description"
          data-testid="news-modal-description"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p
            data-testid="news-modal-description-text"
            v-html="currentNewsItem.description"
          />
          <p
            v-if="currentNewsItem.secondDescription"
            data-testid="news-modal-description-second-text"
            v-html="currentNewsItem.secondDescription"
          />
        </section>
        <img
          class="news-modal__image"
          data-testid="news-modal-image"
          :src="currentNewsItem.image"
          :alt="currentNewsItem.description"
        />
        <UnnnicPagination
          class="news-modal__pagination"
          data-testid="news-modal-pagination"
          :modelValue="page"
          :max="news.length"
          :show="pageSize"
          @update:model-value="updatePage"
        />
      </section>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import {
  UnnnicDialog,
  UnnnicDialogContent,
  UnnnicDialogHeader,
  UnnnicDialogTitle,
  UnnnicPagination,
} from '@weni/unnnic-system';
import { computed, ref } from 'vue';

const emit = defineEmits<{
  close: [];
}>();

const props = defineProps<{
  modelValue: boolean;
  title: string;
  news: Array<{
    description: string;
    secondDescription: string;
    image: string;
  }>;
}>();

const page = ref(1);
const pageSize = ref(props.news.length);

const currentNewsItem = computed(() => {
  return props.news[page.value - 1];
});

const handleOpenChange = (open: boolean) => {
  if (!open) {
    emit('close');
  }
};

const updatePage = (value: number) => {
  page.value = value;
};
</script>

<style scoped lang="scss">
.news-modal {
  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
    justify-content: space-between;
    max-width: 750px;
    padding: $unnnic-space-6;
  }

  &__description {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }

  &__image {
    max-height: 450px;
    align-self: stretch;
    aspect-ratio: 16/9;
  }

  &__pagination {
    justify-content: center;
  }
}
</style>
