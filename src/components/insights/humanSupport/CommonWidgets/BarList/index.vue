<template>
  <CardWidgetContainer
    :title="props.title"
    :tabs="props.tabs"
    :currentTab="props.currentTab"
    :hideHeader="showConfig"
    @tab-change="handleTabChange"
  >
    <section class="bar-list__content">
      <template v-if="showConfig">
        <section class="bar-list__setup">
          <p class="bar-list__setup__title">
            {{ props.setupTitle || props.title }}
          </p>
          <p class="bar-list__setup__description">
            {{ props.setupDescription }}
          </p>
          <UnnnicButton
            :text="$t('add')"
            type="primary"
            @click="emit('click:setup')"
          />
        </section>
      </template>
      <template v-if="emptyData && !props.isLoading">
        <UnnnicDisclaimer>
          <template #description>
            <p class="bar-list__empty-data-text">{{ props.emptyDataText }}</p>
          </template>
        </UnnnicDisclaimer>
      </template>
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
    </section>
  </CardWidgetContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import CardWidgetContainer from '@/components/insights/widgets/layout/CardWidgetContainer.vue';
import type { CardWidgetContainerProps } from '../../../widgets/layout/CardWidgetContainer.vue';
import ProgressTable from '@/components/ProgressTable.vue';
import { ProgressTableRowItem } from '@/components/ProgressTableRowItem.vue';
import { UnnnicDisclaimer } from '@weni/unnnic-system';

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
  emptyDataText?: string;
  setupTitle?: string;
  setupDescription?: string;
};

const props = withDefaults(defineProps<BarListProps>(), {
  items: () => [],
  countText: '',
  showConfig: false,
  isLoading: false,
  showSeeAllButton: false,
  tabs: () => [],
  currentTab: '',
  emptyDataText: '',
  setupTitle: '',
  setupDescription: '',
});

const emit = defineEmits<{
  'see-all': [];
  'tab-change': [tab: string];
  'click:setup': [];
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
  &__content {
    display: flex;
    flex-direction: column;
    position: relative;
    flex: 1;
  }
  &__setup {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    gap: $unnnic-space-3;
    z-index: 1;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);

    &__title {
      font: $unnnic-font-display-2;
      color: $unnnic-color-fg-emphasized;
    }
    &__description {
      font: $unnnic-font-emphasis;
      color: $unnnic-color-fg-base;
    }
  }
  &__empty-data-text {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }
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
