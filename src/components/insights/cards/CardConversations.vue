<template>
  <section
    v-if="!isLoading"
    :class="[
      'card-conversations',
      `card-conversations--border-${props.borderRadius || 'full'}`,
      props.class,
      {
        'card-conversations--clickable': props.isClickable,
      },
    ]"
    data-testid="card-conversations"
    @click="$emit('click')"
  >
    <section class="card-conversations__title">
      <p
        class="card-conversations__text"
        data-testid="card-title"
      >
        {{ title }}
      </p>
      <UnnnicToolTip
        v-if="tooltipInfo"
        enabled
        :text="tooltipInfo"
        :side="tooltipSide || 'top'"
        class="card-conversations__tooltip"
        data-testid="card-conversations-tooltip"
      >
        <UnnnicIcon
          data-testid="card-conversations-info-icon"
          class="card-conversations__info-icon"
          icon="info"
          size="sm"
          filled
          scheme="fg-muted"
        />
      </UnnnicToolTip>
    </section>
    <section
      :class="[
        'card-conversations__content',
        {
          'card-conversations__content--active-gap': props.activeDescriptionGap,
        },
      ]"
      data-testid="card-content"
    >
      <section
        :class="[
          'card-conversations__value',
          {
            'card-conversations__value--enable-time-icon': props.enableTimeIcon,
          },
        ]"
      >
        <UnnnicIcon
          v-if="props.enableTimeIcon"
          icon="alarm"
          size="sm"
          filled
          scheme="neutral-black"
          data-testid="card-time-icon"
        />
        <p
          class="card-conversations__number"
          data-testid="card-value"
        >
          {{ value }}
        </p>
        <p
          v-if="valueDescription"
          class="card-conversations__value-description"
          data-testid="card-value-description"
        >
          {{ valueDescription }}
        </p>
      </section>
      <p
        v-if="description"
        class="card-conversations__description"
        data-testid="card-description"
      >
        {{ description }}
      </p>
    </section>
  </section>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    class="card-conversations__skeleton"
    width="100%"
    height="100%"
    data-testid="card-skeleton"
  />
</template>

<script setup lang="ts">
interface Props {
  class?: string;
  title: string;
  value: string;
  borderRadius?: 'full' | 'left' | 'right' | 'none';
  valueDescription?: string;
  description?: string;
  tooltipInfo?: string;
  isLoading?: boolean;
  tooltipSide?: 'left' | 'right' | 'top' | 'bottom';
  activeDescriptionGap?: boolean;
  enableTimeIcon?: boolean;
  isClickable?: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  (_e: 'click'): void;
}>();
</script>

<style scoped lang="scss">
.card-conversations {
  display: flex;
  padding: $unnnic-space-6;
  flex-direction: column;
  align-items: flex-start;
  gap: $unnnic-space-2;
  flex: 1 0 0;
  align-self: stretch;

  border: 1px solid $unnnic-color-gray-2;
  background: $unnnic-color-gray-0;

  &--clickable {
    cursor: pointer;
  }

  &--border-full {
    border-radius: $unnnic-radius-2;
  }

  &--border-left {
    border-radius: $unnnic-radius-2 0 0 $unnnic-radius-2;
  }

  &--border-right {
    border-radius: 0 $unnnic-radius-2 $unnnic-radius-2 0;
    border-left: none;
  }

  &--border-none {
    border-radius: 0;
    border-left: none;
  }

  &__title {
    display: flex;
    width: 100%;
    align-items: center;
    gap: $unnnic-space-4;
  }

  &__text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    flex: 1 0 0;
    overflow: hidden;
    color: $unnnic-color-gray-12;
    text-overflow: ellipsis;
    font: $unnnic-font-display-4;
  }

  &__info-icon {
    cursor: help;
  }

  &__content {
    display: flex;
    flex-direction: column;

    &--active-gap {
      gap: $unnnic-space-2;
    }
  }

  &__value {
    display: flex;
    gap: $unnnic-space-2;
    align-items: end;

    &--enable-time-icon {
      align-items: center;
    }
  }

  &__number {
    color: $unnnic-color-gray-13;
    font: $unnnic-font-display-1;
  }

  &__value-description {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-display-3;
  }

  &__description {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-caption-2;
  }

  &__skeleton {
    flex: 1;
    align-self: stretch;
  }
}
</style>
