<template>
  <CardBase class="card-empty">
    <section class="card-empty__content">
      <section class="content__not-configured">
        <img src="@/assets/images/icons/empty_monitory.svg" />
        <p class="not-configured__text">
          {{ $t('widgets.empty_widget.title') }}
        </p>
        <UnnnicButton
          :text="$t('widgets.empty_widget.config_btn')"
          type="primary"
          size="small"
          data-testid="card-empty-config-button-not-configured"
          @click="$emit('open-config')"
        />
      </section>
    </section>
  </CardBase>
</template>

<script>
import CardBase from './CardBase.vue';

export default {
  name: 'CardEmpty',

  components: { CardBase },

  props: {
    widget: {
      type: Object,
      required: true,
    },
    isLoading: Boolean,
  },

  emits: ['open-config'],
};
</script>

<style lang="scss" scoped>
.card-empty {
  min-height: 310px;
  height: 100%;

  padding: $unnnic-space-4;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $unnnic-space-4;

  &__content {
    overflow: hidden;

    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;

    .content__not-configured {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .not-configured__text {
        padding-bottom: $unnnic-space-4;
        color: $unnnic-color-gray-7;
        font: $unnnic-font-display-4;
        text-align: center;
      }
    }
  }
}
</style>
