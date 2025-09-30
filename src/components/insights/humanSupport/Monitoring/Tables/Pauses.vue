<template>
  <UnnnicDataTable
    :locale="$i18n.locale"
    :isLoading="isLoading"
    clickable
    fixedHeaders
    height="100%"
    :headers="formattedHeaders"
    :items="formattedItems"
    hidePagination
    data-testid="pauses-table"
    @update:sort="handleSort"
  />
</template>

<script setup lang="ts">
import { UnnnicDataTable } from '@weni/unnnic-system';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const isLoading = ref(false);

const formattedHeaders = computed(() => [
  {
    title: 'Status',
    itemKey: 'status',
    isSortable: true,
  },
  {
    title: 'Agent',
    itemKey: 'agent',
    isSortable: true,
  },
  {
    title: 'Opened',
    itemKey: 'opened',
    isSortable: true,
  },
  {
    title: 'Closed',
    itemKey: 'closed',
    isSortable: true,
  },
]);

const formattedItems = computed(() => [
  {
    status: 'Online',
    agent: 'Alice',
    opened: '10',
    closed: '5',
  },
  {
    status: 'Offline',
    agent: 'Bob',
    opened: '10',
    closed: '5',
  },
  {
    status: 'Offline',
    agent: 'Charlie',
    opened: '10',
    closed: '5',
  },
  {
    status: 'Offline',
    agent: 'David',
    opened: '10',
    closed: '5',
  },
]);

const handleSort = (sort: any) => {
  console.log('pauses-table sort', sort);
};

onMounted(() => {
  console.log('pauses-table mounted');
});

onUnmounted(() => {
  console.log('pauses-table unmounted');
});
</script>
