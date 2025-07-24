<template>
  <tbody
    :class="[
      'progress-table-row-item',
      {
        'progress-table-row-item--expandable': isExpandable,
      },
    ]"
    data-testid="progress-table-row-item"
  >
    <tr
      class="progress-table-row-item__main-row"
      data-testid="progress-table-row-item-main-row"
      @click="handleExpand()"
    >
      <td
        class="progress-table-row-item__label"
        data-testid="progress-table-row-item-label"
      >
        <UnnnicIcon
          v-if="isExpandable"
          data-testid="progress-table-row-item-icon"
          :class="[
            'label__icon',
            {
              'label__icon--expanded': expanded,
            },
          ]"
          icon="keyboard_arrow_down"
          size="md"
          scheme="neutral-cloudy"
        />
        <section class="label__infos">
          <p class="infos__title">{{ label }}</p>
          <p
            v-if="isExpandable"
            class="infos__description"
            data-testid="progress-table-row-item-expandable-description"
          >
            {{ expandableDescription }}
          </p>
        </section>
      </td>
      <td class="progress-table-row-item__progress">
        <NativeProgress
          :progress="value"
          :backgroundColor="backgroundColor"
          :color="color"
          data-testid="progress-table-row-item-progress"
        />
      </td>
      <td
        class="progress-table-row-item__description"
        data-testid="progress-table-row-item-description"
      >
        {{ description }}
      </td>
    </tr>

    <tr
      v-if="isExpandable && expanded"
      class="progress-table-row-item__sub-items-row"
      data-testid="progress-table-row-item-sub-items-row"
    >
      <td
        colspan="3"
        class="sub-items-row__sub-items"
      >
        <section class="sub-items__items-container">
          <slot name="sub-items" />
        </section>
      </td>
    </tr>
  </tbody>
</template>

<script setup lang="ts">
import NativeProgress from './insights/charts/NativeProgress.vue';

export interface BaseProgressTableRowItem {
  label: string;
  value: number;
  description: string;
  backgroundColor?: string;
  color?: string;
}

export interface ProgressTableRowItem extends BaseProgressTableRowItem {
  expanded?: boolean;
  isExpandable?: boolean;
  expandableDescription?: string;
  subItems?: BaseProgressTableRowItem[];
}

const props = defineProps<ProgressTableRowItem>();

const emit = defineEmits<{
  (_e: 'expand', _expanded: boolean): void;
}>();

const handleExpand = () => {
  if (props.isExpandable) {
    emit('expand', !props.expanded);
  }
};
</script>

<style scoped lang="scss">
.progress-table-row-item {
  &:not(:last-of-type) {
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  }

  &--expandable {
    cursor: pointer;
  }

  &__main-row {
    & > * {
      padding: $unnnic-spacing-sm 0;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-xs;

    .label__icon {
      transform: rotate(-90deg);
      transition: transform 0.2s ease-in-out;

      &--expanded {
        transform: rotate(0);
      }
    }

    .label__infos {
      display: flex;
      flex-direction: column;

      .infos__title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-lg;
        font-weight: $unnnic-font-weight-regular;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

        max-width: 250px;
      }

      .infos__description {
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      }
    }
  }

  &__progress {
    width: 100%;

    padding: 0 $unnnic-spacing-sm;
  }

  &__description {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    text-align: end;
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  &__sub-items-row {
    cursor: default;
    border-top: none;

    .sub-items-row__sub-items {
      padding: 0;
      border-top: none;

      .sub-items__items-container {
        margin: 0 0 $unnnic-spacing-sm $unnnic-spacing-lg;

        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
        border-radius: $unnnic-border-radius-md;

        overflow: hidden;

        padding: 0 $unnnic-spacing-sm;

        width: calc(100% - $unnnic-spacing-lg);

        :deep(.progress-table-row-item__main-row > *) {
          padding-top: $unnnic-spacing-md;
          padding-bottom: $unnnic-spacing-md;
        }
      }
    }
  }
}
</style>
