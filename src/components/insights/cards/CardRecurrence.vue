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
        <template v-for="index in 5" :key="index">
          <section
            v-if="!isLoading"
            class="content__container-group"
            data-testid="content-container-group"
            @click.stop="data[index - 1] && emitClickData(data[index - 1])"
          >
            <template v-if="data[index - 1]">
              <section class="content">
                <section class="content__container-item">
                  <p class="content__container-item-text">
                    {{ data[index - 1].label }}
                  </p>
                </section>
                <section class="progress-bar-container">
                  <UnnnicProgressBar
                    v-model="data[index - 1].value"
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

<script>
import { mapState } from 'vuex';
import CardBase from './CardBase.vue';
import IconLoading from '@/components/IconLoading.vue';

export default {
  name: 'CardRecurrence',

  components: { CardBase, IconLoading },

  props: {
    isLoading: Boolean,
    data: {
      type: Array,
      required: true,
    },
    widget: {
      type: Object,
      required: true,
    },
    seeMore: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['open-config', 'request-data', 'seeMore', 'clickData'],

  computed: {
    ...mapState({
      appliedFilters: (state) => state.dashboards.appliedFilters,
    }),
    isError() {
      return this.data?.length === 0;
    },
  },

  watch: {
    appliedFilters: {
      deep: true,
      handler() {
        this.emitRequestData();
      },
    },
  },

  created() {
    this.emitRequestData();
  },

  methods: {
    emitClickData(data) {
      this.$emit('clickData', { label: data.label, data: data.value });
    },
    emitRequestData() {
      this.$emit('request-data');
    },
  },
};
</script>

<style lang="scss" scoped>
.divider {
  margin-top: $unnnic-spacing-md;
  height: 1px;
  background-color: $unnnic-color-neutral-light;
  width: 100%;
}

.card-recurrence {
  min-height: 310px;
  height: 100%;

  padding: $unnnic-spacing-md;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $unnnic-spacing-sm;

  &__link {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-sm * 3;
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-decoration-skip-ink: none;
    text-decoration-thickness: auto;
    text-underline-offset: auto;
    text-underline-position: from-font;
  }

  &--not-data {
    .card-recurrence__header .header__title {
      color: $unnnic-color-neutral-cloudy;
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
      padding: $unnnic-spacing-nano 0;

      font-family: $unnnic-font-family-primary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-line-height-small * 7.5;
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
      gap: $unnnic-spacing-sm;
      background-color: $unnnic-color-neutral-white;
      padding: $unnnic-spacing-sm;

      &-group {
        cursor: pointer;
        min-height: $unnnic-avatar-size-sm;
        display: flex;
        flex-direction: column;
        justify-content: center;

        &:empty {
          background: $unnnic-color-neutral-lightest;
          border-radius: $unnnic-border-radius-sm;
        }

        &:not(:last-child) {
          border-bottom: 1px solid $unnnic-color-neutral-light;
          padding-bottom: $unnnic-spacing-sm;
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

          color: $unnnic-color-neutral-cloudy;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-lg;
          font-style: normal;
          font-weight: $unnnic-font-weight-regular;
          line-height: $unnnic-font-size-body-sm * 3;
        }
      }
    }

    .content__not-configured {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .not-configured__text {
        color: $unnnic-color-neutral-cloudy;
        font-size: $unnnic-font-size-body-lg;
        text-align: center;
        line-height: $unnnic-line-height-small * 6;
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
    background-color: $unnnic-color-weni-600;
  }

  :deep(
    .unnnic-progress-bar.primary .progress-bar-container .progress-container
  ) {
    background-color: $unnnic-color-weni-100;
  }

  :deep(.unnnic-progress-bar.primary .progress-bar-container .percentage) {
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg * 2;
    min-width: $unnnic-spacing-lg;
  }
}
</style>
