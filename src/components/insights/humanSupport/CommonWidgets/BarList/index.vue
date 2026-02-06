<template>
  <CardWidgetContainer
    :title="props.title"
    :tabs="props.tabs"
    :currentTab="props.currentTab"
    @tab-change="handleTabChange"
  >
    <template v-if="showConfig"> TODO: setup </template>
    <template v-if="emptyData && !props.isLoading"> TODO: empty data </template>
    <template v-if="props.isLoading">
      <UnnnicSkeletonLoading
        v-for="i in 5"
        :key="i"
        width="100%"
        height="80px"
      />
    </template>

    <template v-else>
      <div class="bar-list__table-container">
        <ProgressTable :progressItems="props.items" />
      </div>
      <section
        v-if="!isLoading"
        class="bar-list__footer"
      >
        <p class="bar-list__footer__count">
          {{ props.countText }}
        </p>
        <UnnnicButton
          v-if="props.showSeeAllButton"
          :text="$t('see_all')"
          type="tertiary"
          @click="emit('see-all')"
        />
      </section>
    </template>
  </CardWidgetContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import CardWidgetContainer from '@/components/insights/widgets/layout/CardWidgetContainer.vue';
import type { CardWidgetContainerProps } from '../../../widgets/layout/CardWidgetContainer.vue';
import ProgressTable from '@/components/ProgressTable.vue';
import { ProgressTableRowItem } from '@/components/ProgressTableRowItem.vue';

defineOptions({
  name: 'BarList',
});

type BarListProps = CardWidgetContainerProps & {
  countText?: string;
  items?: ProgressTableRowItem[];
  showConfig?: boolean;
  isLoading?: boolean;
  showSeeAllButton?: boolean;
  tabs?: { name: string; key: string }[];
  currentTab?: string;
};

const props = withDefaults(defineProps<BarListProps>(), {
  items: () => [],
  countText: '',
  showConfig: false,
  isLoading: false,
  showSeeAllButton: false,
  tabs: () => [],
  currentTab: '',
});

const emit = defineEmits<{
  'see-all': [];
  'tab-change': [tab: string];
}>();

const emptyData = computed(() => {
  return props.items?.length === 0;
});

const handleTabChange = (tab: string) => {
  emit('tab-change', tab);
};
</script>

<style scoped lang="scss">
.bar-list {
  &__table-container {
    flex: 1;
  }
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__count {
      font: $unnnic-font-body;
      color: $unnnic-color-neutral-clean;
    }
    &__see-more {
      font: $unnnic-font-display-4;
      color: $unnnic-color-fg-base;
      cursor: pointer;
    }
  }
}
</style>
