<template>
  <CardBase
    class="card-recurrence"
    :class="{ 'card-recurrence--not-data': isError }"
  >
    <header class="card-recurrence__header">
      <h1 class="header__title">
        {{ widget?.name }}
      </h1>
      <UnnnicButton
        size="small"
        type="tertiary"
        iconCenter="tune"
        data-testid="card-recurrence-config-button-configurable"
        @click.stop="$emit('open-config')"
      />
    </header>
    <section class="card-recurrence__content">
      <section
        v-if="isError && !isLoading"
        class="content__not-configured"
      >
        <img src="@/assets/images/icons/empty_monitory.svg" />
        <p class="not-configured__text">
          {{ $t('widgets.recurrence.empty_data.title') }}
        </p>
        <p class="not-configured__text">
          {{ $t('widgets.recurrence.empty_data.sub_title') }}
        </p>
      </section>
      <section
        v-else
        class="content__container"
        :class="{ 'content__container-isLoading': isLoading }"
      >
        <IconLoading
          v-if="isLoading"
          class="content__container-icon-loading"
          data-testid="icon-loading"
        />
        <template
          v-for="(item, index) in rowData"
          :key="index"
        >
          <section
            v-if="!isLoading"
            class="content__container-group"
            data-testid="content-container-group"
            @click.stop="item && emitClickData(item)"
          >
            <template v-if="item">
              <section class="content">
                <section class="content__container-item">
                  <p class="content__container-item-text">
                    {{ item.label }}
                  </p>
                </section>
                <section class="progress-bar-container">
                  <UnnnicProgressBar
                    v-model="item.value"
                    class="progress-bar"
                    inline
                  />
                </section>
              </section>
            </template>
          </section>
        </template>
      </section>
    </section>
    <a
      v-if="seeMore && !isLoading"
      class="card-recurrence__link"
      href=""
      data-testid="see-more-link"
      @click.prevent.stop="$emit('seeMore')"
    >
      {{ $t('widgets.recurrence.see_more') }}
    </a>
  </CardBase>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

import CardBase from './CardBase.vue';
import IconLoading from '@/components/IconLoading.vue';

defineOptions({ name: 'CardRecurrence' });

interface RecurrenceItem {
  label: string;
  value: number;
}

interface CardRecurrenceProps {
  isLoading?: boolean;
  data: RecurrenceItem[];
  widget: Record<string, unknown>;
  seeMore?: boolean;
}

const props = withDefaults(defineProps<CardRecurrenceProps>(), {
  isLoading: false,
  seeMore: false,
});

const emit = defineEmits<{
  'open-config': [];
  'request-data': [];
  seeMore: [];
  clickData: [payload: { label: string; data: number }];
}>();

const dashboardsStore = useDashboards();
const { appliedFilters } = storeToRefs(dashboardsStore);

const isError = computed(() => props.data?.length === 0);

const rowData = computed(() =>
  Array(5)
    .fill(null)
    .map((_, index) => props.data[index] || null),
);

const emitClickData = (data: RecurrenceItem) => {
  emit('clickData', { label: data.label, data: data.value });
};

const emitRequestData = () => {
  emit('request-data');
};

watch(appliedFilters, emitRequestData, { deep: true });

emitRequestData();
</script>

<style lang="scss" scoped>
.divider {
  margin-top: $unnnic-space-6;
  height: 1px;
  background-color: $unnnic-color-gray-1;
  width: 100%;
}

.card-recurrence {
  min-height: 310px;
  height: 100%;

  padding: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $unnnic-space-4;

  &__link {
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-action;
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-decoration-skip-ink: none;
    text-decoration-thickness: auto;
    text-underline-offset: auto;
    text-underline-position: from-font;
  }

  &--not-data {
    .card-recurrence__header .header__title {
      color: $unnnic-color-fg-muted;
    }
  }

  &-margin-auto {
    margin: auto;
  }

  &__header {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    .header__title {
      padding: $unnnic-space-1 0;

      font: $unnnic-font-display-2;
    }
  }

  &__content {
    overflow: hidden;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;

    .content__container {
      height: 100%;
      display: grid;
      grid-template-rows: repeat(5, 1fr);
      gap: $unnnic-space-4;
      background-color: $unnnic-color-gray-0;
      padding: $unnnic-space-4;

      &-group {
        cursor: pointer;
        min-height: 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;

        &:empty {
          background: $unnnic-color-gray-1;
          border-radius: $unnnic-radius-1;
        }

        &:not(:last-child) {
          border-bottom: 1px solid $unnnic-color-gray-1;
          padding-bottom: $unnnic-space-4;
        }
      }

      &-isLoading {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &__container-item {
        max-width: 150px;

        @media screen and (max-width: 1440px) {
          max-width: 100px;
        }

        @media screen and (max-width: 1024px) {
          max-width: 80px;
        }

        overflow: hidden;

        &-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          display: inline-block;

          color: $unnnic-color-fg-muted;
          font: $unnnic-font-display-4;
        }
      }
    }

    .content__not-configured {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .not-configured__text {
        color: $unnnic-color-fg-muted;
        font: $unnnic-font-display-4;
        text-align: center;
      }
    }
  }
}
.progress-bar-container {
  :deep(.unnnic-progress-bar.primary) {
    background-color: inherit;
    box-shadow: none;
  }

  @media screen and (max-width: 1024px) {
    :deep(
      .unnnic-progress-bar.primary .progress-bar-container .progress-container
    ) {
      min-width: 100px;
    }
  }

  :deep(
    .unnnic-progress-bar.primary
      .progress-bar-container
      .progress-container
      .bar
  ) {
    border-radius: 37.5rem;
    background-color: $unnnic-color-teal-8;
  }

  :deep(
    .unnnic-progress-bar.primary .progress-bar-container .progress-container
  ) {
    background-color: $unnnic-color-teal-2;
  }

  :deep(.unnnic-progress-bar.primary .progress-bar-container .percentage) {
    font: $unnnic-font-display-4;
    min-width: $unnnic-space-8;
  }
}
</style>
