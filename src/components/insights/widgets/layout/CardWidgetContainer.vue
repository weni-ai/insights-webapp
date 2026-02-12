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
  padding: $unnnic-spacing-md;
  flex-direction: column;
  justify-content: space-between;
  gap: $unnnic-spacing-sm;
  flex: 1 0 0;
  align-self: stretch;

  border-radius: $unnnic-spacing-xs;
  border: 1px solid $unnnic-color-neutral-soft;
  background: $unnnic-color-neutral-white;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header__title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
      font-style: normal;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 500px;
      margin-right: $unnnic-spacing-xs;
    }

    .header__actions {
      display: flex;
      align-items: center;
      gap: $unnnic-spacing-xs;

      .actions__dropdown {
        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.unnnic-dropdown__trigger) {
          display: flex;

          cursor: pointer;
        }

        :deep(.unnnic-dropdown__content) {
          padding: $unnnic-spacing-sm;

          gap: $unnnic-spacing-sm;
        }

        .dropdown__action {
          display: flex;
          align-items: center;
          gap: $unnnic-spacing-xs;

          .action__text {
            font-family: $unnnic-font-family-secondary;
            font-size: $unnnic-font-size-body-md;
            line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
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
