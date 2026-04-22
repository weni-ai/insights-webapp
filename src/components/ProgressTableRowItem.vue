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
        <UnnnicToolTip
          :enabled="!!props.deletedTooltip"
          :text="props.deletedTooltip"
          side="right"
          data-testid="progress-table-row-item-deleted-tooltip"
        >
          <section class="label__infos">
            <section class="infos__title-container">
              <p
                :class="[
                  'infos__title',
                  { 'infos__title--muted': props.labelMuted },
                ]"
                :title="label"
              >
                {{ label }}
              </p>
              <p
                v-if="props.subtitle"
                :class="[
                  'infos__subtitle',
                  { 'infos__subtitle--muted': props.subtitleMuted },
                ]"
                :title="props.subtitle"
              >
                {{ props.subtitle }}
              </p>
            </section>
            <p
              v-if="isExpandable"
              class="infos__description"
              data-testid="progress-table-row-item-expandable-description"
            >
              {{ expandableDescription }}
            </p>
          </section>
        </UnnnicToolTip>
      </td>
      <td class="progress-table-row-item__progress">
        <NativeProgress
          :progress="value"
          :backgroundColor="backgroundColor"
          :color="color"
          :tooltip="tooltip"
          :maxProgressValue="maxValue"
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
  subtitle?: string;
  value: number;
  description: string;
  backgroundColor?: string;
  color?: string;
  tooltip?: string;
  maxValue?: number;
  labelMuted?: boolean;
  subtitleMuted?: boolean;
  deletedTooltip?: string;
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
  display: table-row;

  &:not(:last-of-type) {
    &::after {
      content: '';
      display: block;
      width: 100%;
      margin: $unnnic-space-1 0;
      height: 1px;
      background-color: $unnnic-color-gray-2;
    }
  }

  &--expandable {
    cursor: pointer;
  }

  &__main-row {
    & > * {
      padding: $unnnic-space-4 0;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    .label__icon {
      transform: rotate(-90deg);
      transition: transform 0.2s ease-in-out;

      &--expanded {
        transform: rotate(0);
      }
    }

    :deep(.unnnic-tooltip) {
      display: flex;
    }

    .label__infos {
      display: flex;
      flex-direction: column;

      .infos__title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        color: $unnnic-color-gray-12;
        font: $unnnic-font-display-4;

        width: 200px;

        &-container {
          display: flex;
          flex-direction: column;
        }

        &--muted {
          color: $unnnic-color-fg-muted;
        }
      }

      .infos__subtitle {
        overflow: hidden;
        color: $unnnic-color-fg-base;
        font: $unnnic-font-caption-2;
        text-overflow: ellipsis;
        display: -webkit-box;
        max-width: 120px;
        -webkit-box-orient: vertical;
        line-clamp: 1;

        &--muted {
          color: $unnnic-color-fg-muted;
        }
      }

      .infos__description {
        white-space: nowrap;
        color: $unnnic-color-fg-muted;
        font: $unnnic-font-caption-2;
      }
    }
  }

  &__progress {
    width: 100%;

    padding: 0 $unnnic-space-4;
  }

  &__description {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    text-align: end;
    color: $unnnic-color-gray-10;
    font: $unnnic-font-display-3;
    min-width: 55px;
  }

  &__sub-items-row {
    cursor: default;
    border-top: none;

    .sub-items-row__sub-items {
      padding: 0;
      border-top: none;

      .sub-items__items-container {
        display: flex;
        flex-direction: column;

        margin: 0 0 $unnnic-space-4 $unnnic-space-8;

        border: 1px solid $unnnic-color-gray-2;
        border-radius: $unnnic-radius-2;

        overflow: hidden;

        padding: 0 $unnnic-space-4;

        width: calc(100% - $unnnic-space-8);

        :deep(.progress-table-row-item__main-row > *) {
          padding-top: $unnnic-space-6;
          padding-bottom: $unnnic-space-6;
        }
      }
    }
  }
}
</style>
style>
