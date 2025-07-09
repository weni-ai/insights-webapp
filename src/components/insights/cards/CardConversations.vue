<template>
  <section
    v-if="!isLoading"
    :class="[
      'card-conversations',
      `card-conversations--border-${props.borderRadius || 'full'}`,
    ]"
    data-testid="card-conversations"
  >
    <section class="card-conversations__title">
      <p
        class="card-conversations__title-text"
        data-testid="card-title"
      >
        {{ title }}
      </p>
      <UnnnicToolTip
        v-if="tooltipInfo"
        enabled
        :text="tooltipInfo"
        side="right"
        class="card-conversations__title-tooltip"
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
      class="card-conversations__content"
      data-testid="card-content"
    >
      <section class="card-conversations__content-value">
        <p
          class="card-conversations__content-value-number"
          data-testid="card-value"
        >
          {{ value }}
        </p>
        <p
          v-if="valueDescription"
          class="card-conversations__content-value-description"
          data-testid="card-value-description"
        >
          {{ valueDescription }}
        </p>
      </section>
      <p
        v-if="description"
        class="card-conversations__content-description"
        data-testid="card-description"
      >
        {{ description }}
      </p>
    </section>
  </section>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    class="card-conversations__skeleton"
    :width="`100%`"
    height="134px"
    data-testid="card-skeleton"
  />
</template>

<script setup lang="ts">
interface Props {
  title: string;
  value: string;
  borderRadius?: 'full' | 'left' | 'right' | 'none';
  valueDescription?: string;
  description?: string;
  tooltipInfo?: string;
  isLoading?: boolean;
}

const props = defineProps<Props>();
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

    &-text {
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
  }

  &__content {
    display: flex;
    flex-direction: column;

    &-value {
      display: flex;
      align-items: end;
      gap: $unnnic-spacing-xs;

      &-number {
        color: $unnnic-color-neutral-black;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-title-md;
        font-style: normal;
        font-weight: $unnnic-font-weight-bold;
        line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
      }

      &-description {
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-lg;
        font-style: normal;
        font-weight: $unnnic-font-weight-bold;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
      }
    }

    &-description {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-md;
      font-style: normal;
      font-weight: $unnnic-font-weight-regular;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    }
  }

  &__skeleton {
    flex: 1;
    align-self: stretch;
  }
}
</style>
