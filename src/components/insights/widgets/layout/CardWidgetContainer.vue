<template>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    :width="`100%`"
    height="500px"
  />
  <section
    v-else
    class="card-widget-container"
    v-bind="$attrs"
  >
    <section
      v-if="!props.hideHeader"
      class="card-widget-container__header"
    >
      <p class="header__title">
        {{ props.title }}
      </p>
      <section class="header__actions">
        <ShortTab
          v-if="!hiddenTabs && props.tabs.length > 0"
          :tabs="props.tabs"
          :currentTab="props.currentTab"
          @tab-change="handleTabChange"
        />

        <UnnnicDropdown
          v-if="props.actions.length > 0"
          class="actions__dropdown"
        >
          <template #trigger>
            <UnnnicIcon
              icon="more_vert"
              size="ant"
              scheme="neutral-cloudy"
            />
          </template>

          <UnnnicDropdownItem
            v-for="(action, index) in props.actions"
            :key="index"
            class="dropdown__action"
            @click="action.onClick()"
          >
            <UnnnicIcon
              :icon="action.icon"
              size="sm"
              :scheme="action.scheme || 'neutral-dark'"
            />
            <p
              :class="[
                'action__text',
                `u color-${action.scheme || 'neutral-dark'}`, // Unnnic color classes
              ]"
            >
              {{ action.text }}
            </p>
          </UnnnicDropdownItem>
        </UnnnicDropdown>
      </section>
    </section>
    <slot />
  </section>
</template>

<script setup lang="ts">
import ShortTab from '@/components/ShortTab.vue';

type CardWidgetContainerAction = {
  icon: string;
  text: string;
  onClick: Function;
  scheme?: string;
};

export type CardWidgetContainerProps = {
  title?: string;
  isLoading?: boolean;
  actions?: CardWidgetContainerAction[];
  currentTab?: string;
  hiddenTabs?: boolean;
  hideHeader?: boolean;
  tabs?: { name: string; key: string }[];
};

const props = withDefaults(defineProps<CardWidgetContainerProps>(), {
  title: '',
  isLoading: false,
  actions: () => [],
  tabs: () => [],
  currentTab: '',
  hiddenTabs: false,
  hideHeader: false,
});

const emit = defineEmits<{
  'tab-change': [tab: string];
}>();

const handleTabChange = (tab: string) => {
  emit('tab-change', tab);
};
</script>

<style scoped lang="scss">
.card-widget-container {
  width: 100%;
  height: 100%;
  display: flex;
  padding: $unnnic-space-6;
  flex-direction: column;
  justify-content: space-between;
  gap: $unnnic-space-4;
  flex: 1 0 0;
  align-self: stretch;

  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-border-base;
  background: $unnnic-color-bg-base;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header__title {
      color: $unnnic-color-gray-12;
      font: $unnnic-font-display-3;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 500px;
      margin-right: $unnnic-space-2;
    }

    .header__actions {
      display: flex;
      align-items: center;
      gap: $unnnic-space-2;

      .actions__dropdown {
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.unnnic-dropdown__trigger) {
          display: flex;

          cursor: pointer;
        }

        :deep(.unnnic-dropdown__content) {
          padding: $unnnic-space-4;

          gap: $unnnic-space-4;
        }

        .dropdown__action {
          display: flex;
          align-items: center;
          gap: $unnnic-space-2;

          .action__text {
            font: $unnnic-font-caption-2;
            white-space: nowrap;
          }

          &::before {
            display: none;
          }
        }
      }
    }
  }
}
</style>
