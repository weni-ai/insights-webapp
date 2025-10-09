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
          scheme="neutral-cleanest"
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
  padding: $unnnic-spacing-md;
  flex-direction: column;
  align-items: flex-start;
  gap: $unnnic-spacing-xs;
  flex: 1 0 0;
  align-self: stretch;

  border: 1px solid $unnnic-color-neutral-soft;
  background: #fff;

  &--clickable {
    cursor: pointer;
  }

  &--border-full {
    border-radius: $unnnic-border-radius-md;
  }

  &--border-left {
    border-radius: $unnnic-border-radius-md 0 0 $unnnic-border-radius-md;
  }

  &--border-right {
    border-radius: 0 $unnnic-border-radius-md $unnnic-border-radius-md 0;
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
    gap: $unnnic-spacing-sm;
  }

  &__text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    flex: 1 0 0;
    overflow: hidden;
    color: $unnnic-color-neutral-darkest;
    text-overflow: ellipsis;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
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
    gap: $unnnic-spacing-xs;
    align-items: end;

    &--enable-time-icon {
      align-items: center;
    }
  }

  &__number {
    color: $unnnic-color-neutral-black;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-title-md;
    font-style: normal;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
  }

  &__value-description {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-style: normal;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }

  &__skeleton {
    flex: 1;
    align-self: stretch;
  }
}
</style>
