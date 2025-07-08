<template>
  <section class="topics-widget">
    <section class="topics-widget__header">
      <section class="topics-widget__header-title">
        <p class="topics-widget-title">
          {{ $t('widgets.topics.title') }}
        </p>
      </section>
      <ShortTab
        :tabs="tabsData"
        :defaultTab="0"
        @tab-change="handleTabChange"
      />
    </section>
    <section
      :class="{
        'topics-widget__content-align-center': isError,
        'topics-widget__content': true,
      }"
    >
      <section
        v-if="isError && !isLoading"
        class="topics-widget__content-not-configured"
      >
        <img src="@/assets/images/icons/empty_monitory.svg" />
        <p class="topics-widget__content-not-configured-text">
          {{ $t('widgets.topics.not_configured') }}
        </p>
      </section>
      <ProgressChart
        v-else
        :isLoading="isLoading"
        :data="data"
        :class="{ primary: isColorBlue, secondary: !isColorBlue }"
        @click-data="emitClickData"
      />
      <section class="topics-widget__see-more-container">
        <a
          v-if="seeMore && !isLoading && !isError"
          class="topics-widget__see-more"
          href=""
          data-testid="see-more-link"
          @click.prevent.stop="handleSeeMore"
        >
          {{ $t('widgets.see_more') }}
        </a>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ShortTab from '@/components/ShortTab.vue';
import ProgressChart from '@/components/insights/charts/ProgressChart.vue';
import { useI18n } from 'vue-i18n';

const isLoading = ref(false);
const isError = ref(false);
const isColorBlue = ref(true);
const seeMore = ref(true);

const { t } = useI18n();

const tabsData = computed(() => {
  return [
    { name: t('widgets.topics.tabs.general'), key: 'general' },
    { name: t('widgets.topics.tabs.human_service'), key: 'human_service' },
  ];
});

const data = ref([
  { label: t('widgets.topics.tabs.general'), value: 10 },
  { label: t('widgets.topics.tabs.human_service'), value: 20 },
]);

const handleTabChange = (index: number, tab: { name: string; key: string }) => {
  console.log('Tab changed:', index, tab);
  isColorBlue.value = index === 0;
};

const emitClickData = (data: any) => {
  console.log('Click data:', data);
};

const handleSeeMore = () => {
  console.log('See more');
};
</script>

<style lang="scss" scoped>
.topics-widget {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
  justify-content: start;
  width: 100%;
  height: 100%;
  padding: $unnnic-spacing-md;
  border-radius: $unnnic-border-radius-md;
  background-color: $unnnic-color-neutral-white;
  box-shadow: $unnnic-shadow-level-far;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  &-title {
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-dark;
  }

  &__see-more-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  &__see-more {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  &-align-center {
    align-items: center;
  }

  &__content {
    width: 100%;
    height: 100%;
    min-height: 485px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $unnnic-spacing-md;

    &-not-configured {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: $unnnic-spacing-md;

      &-text {
        color: $unnnic-color-neutral-cloudy;
        font-size: $unnnic-font-size-body-lg;
        text-align: center;
        line-height: $unnnic-line-height-md + $unnnic-font-size-body-lg;
      }
    }
  }

  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    &-title {
      align-items: center;
    }
  }

  :deep(.progress-bar-container) {
    flex: 6;
  }

  :deep(.progress-chart__container-item) {
    flex: 4;
  }

  .primary {
    :deep(
      .unnnic-progress-bar.primary
        .progress-bar-container
        .progress-container
        .bar
    ) {
      background-color: $unnnic-color-aux-blue-500;
    }

    :deep(
      .unnnic-progress-bar.primary .progress-bar-container .progress-container
    ) {
      background-color: $unnnic-color-aux-blue-100;
    }
  }

  .secondary {
    :deep(
      .unnnic-progress-bar.primary
        .progress-bar-container
        .progress-container
        .bar
    ) {
      background-color: $unnnic-color-aux-orange-500;
    }

    :deep(
      .unnnic-progress-bar.primary .progress-bar-container .progress-container
    ) {
      background-color: $unnnic-color-aux-orange-100;
    }
  }
}
</style>
