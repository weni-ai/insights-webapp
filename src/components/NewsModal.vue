<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    :title="title"
    showCloseIcon
  >
    <section>
      <template
        v-for="(item, index) in news"
        :key="index"
      >
        <p v-html="item.description" />
        <img
          :src="item.image"
          alt="news image"
        />
      </template>
      <UnnnicPagination
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
import { ref } from 'vue';
defineProps<{
  modelValue: boolean;
  title: string;
  news: {
    description: string;
    image: string;
  }[];
}>();

const page = ref(1);
const pageSize = ref(5);

const updatePage = (value: number) => {
  page.value = value;
};
</script>
