<template>
  <UnnnicDropdown
    v-on-click-outside="handleClickOutside"
    class="filter-type__select-type"
    position="bottom-left"
    :open="!isDropdownOpen"
  >
    <template #trigger>
      <section
        data-testid="filter-type__select-type-dropdown"
        class="filter-type__select-type-dropdown"
        @click="toggleDropdown"
      >
        <p
          data-testid="filter-type-title"
          class="filter-type__title"
        >
          {{ currentItem.name }}
        </p>
        <UnnnicIcon
          data-testid="expand-icon"
          :icon="isDropdownOpen ? 'expand_more' : 'keyboard_arrow_up'"
        />
      </section>
    </template>
    <UnnnicDropdownItem
      v-for="(item, index) in items"
      :key="index"
      data-testid="option-select"
      class="filter-type__option"
      :class="{ 'filter-type__option-active': item.name === currentItem.name }"
      @click="item.action && handleItemAction(item.action, item.name)"
    >
      {{ item.name }}
    </UnnnicDropdownItem>
  </UnnnicDropdown>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { vOnClickOutside } from '@vueuse/components';

interface DropdownItem {
  name: string;
  action?: () => void;
}

const props = defineProps<{
  items: DropdownItem[];
  defaultItem: DropdownItem;
}>();

const isDropdownOpen = ref(false);
const currentItem = ref(props.defaultItem);

const handleClickOutside = () => {
  if (isDropdownOpen.value) {
    isDropdownOpen.value = false;
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleItemAction = (action: () => void, name: string) => {
  action();

  if (name === currentItem.value.name)
    currentItem.value = { name: props.defaultItem.name };
  else currentItem.value = { name };

  isDropdownOpen.value = false;
};
</script>

<style scoped lang="scss">
.filter-type {
  display: flex;
  align-items: center;

  &__select-type {
    &-dropdown {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    &-dropdown:hover {
      opacity: 0.9;
    }

    :deep(.unnnic-dropdown__content) {
      width: $unnnic-avatar-size-sm * 4;
    }
  }

  &__title {
    margin-right: $unnnic-spacing-nano;
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__option {
    display: flex;
    padding: $unnnic-spacing-sm;
    flex-direction: column;
    align-items: flex-start;
    gap: $unnnic-spacing-xs;
    border-bottom: 1px solid $unnnic-color-background-sky;

    &::before {
      display: none;
    }

    cursor: pointer;
    white-space: nowrap;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    &:last-child {
      border-bottom: none;
    }

    &-active {
      font-weight: $unnnic-font-weight-bold;
    }

    &:hover {
      border-radius: $unnnic-spacing-nano;
      background-color: $unnnic-color-background-sky;
    }
  }
}
</style>
