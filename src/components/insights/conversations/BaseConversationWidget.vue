<template>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    class="base-conversation-widget__skeleton"
    :width="`100%`"
    height="450px"
    data-testid="base-conversation-widget-skeleton"
  />

  <section
    v-else
    class="base-conversation-widget"
    v-bind="$attrs"
    data-testid="base-conversation-widget"
  >
    <section
      class="base-conversation-widget__header"
      data-testid="base-conversation-widget-header"
    >
      <p
        class="header__title"
        data-testid="base-conversation-widget-title"
      >
        {{ title }}
      </p>
      <section
        class="header__actions"
        data-testid="base-conversation-widget-actions"
      >
        <ShortTab
          v-if="!hiddenTabs"
          :tabs="tabs"
          :currentTab="currentTab"
          data-testid="base-conversation-widget-tabs"
          @tab-change="handleTabChange"
        />

        <UnnnicDropdown
          v-if="actions"
          class="actions__dropdown"
          data-testid="actions-dropdown"
        >
          <template #trigger>
            <UnnnicIcon
              icon="more_vert"
              size="ant"
              scheme="neutral-cloudy"
            />
          </template>

          <UnnnicDropdownItem
            v-for="(action, index) in actions"
            :key="index"
            class="dropdown__action"
            data-testid="action"
            @click="action.onClick()"
          >
            <UnnnicIcon
              data-testid="action-icon"
              :icon="action.icon"
              size="sm"
              :scheme="action.scheme || 'neutral-dark'"
            />
            <p
              data-testid="action-text"
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
import { defineProps, computed } from 'vue';
import ShortTab from '@/components/ShortTab.vue';
import i18n from '@/utils/plugins/i18n';

export type Tab = 'artificial-intelligence' | 'human-support';

const emit = defineEmits<{
  (_event: 'tab-change', _tab: Tab): void;
}>();

const props = defineProps<{
  title: string;
  isLoading?: boolean;
  actions?: {
    icon: string;
    text: string;
    onClick: () => void;
    scheme?: string;
  }[];
  currentTab?: string;
  isOnlyTab?: boolean;
  hiddenTabs?: boolean;
}>();

const tabs = computed(() => {
  const tabs = [
    {
      name: i18n.global.t('conversations_dashboard.artificial_intelligence'),
      key: 'artificial-intelligence',
    },
    {
      name: i18n.global.t('conversations_dashboard.human_support'),
      key: 'human-support',
    },
  ];

  if (props.isOnlyTab) {
    return [tabs[0]];
  }

  return tabs;
});

const handleTabChange = (tab: Tab) => {
  emit('tab-change', tab);
};
</script>

<style scoped lang="scss">
.base-conversation-widget {
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
