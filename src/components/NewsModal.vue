<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :title="title"
    showCloseIcon
    size="large"
    @update:model-value="emit('close')"
  >
    <section class="news-modal__content">
      <section class="news-modal__description">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="currentNewsItem.description" />
        <p
          v-if="currentNewsItem.secondDescription"
          v-html="currentNewsItem.secondDescription"
        />
      </section>
      <img
        class="news-modal__image"
        :src="currentNewsItem.image"
        :alt="currentNewsItem.description"
      />
      <UnnnicPagination
        class="news-modal__pagination"
        :modelValue="page"
        :max="news.length"
        :show="pageSize"
        @update:model-value="updatePage"
      />
    </section>
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { UnnnicPagination, UnnnicModalDialog } from '@weni/unnnic-system';
import { computed, ref } from 'vue';

const emit = defineEmits<{
  (e: 'close'): void;
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
