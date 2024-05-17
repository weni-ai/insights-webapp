<template>
  <CardBase
    class="card-dashboard"
    :class="{ 'not-configured': !configured }"
  >
    <section class="card__content">
      <IconLoading v-if="isLoading" />
      <h1
        v-else
        class="content-title"
      >
        {{ configured ? title : '0' }}
      </h1>
      <p class="content-subtitle">
        {{ configured ? subtitle : 'Métrica vazia' }}
      </p>
    </section>
    <UnnnicButton
      v-if="configurable"
      type="secondary"
      :iconCenter="configured ? 'tune' : ''"
      :iconLeft="configured ? '' : 'tune'"
      :text="configured ? '' : 'Definir métrica'"
      @click.stop="emitHandleConfig"
    />
  </CardBase>
</template>

<script>
import CardBase from './CardBase.vue';
import IconLoading from '@/components/IconLoading.vue';

export default {
  name: 'DashboardCard',

  props: {
    title: String,
    subtitle: String,
    configured: Boolean,
    configurable: Boolean,
  },

  components: {
    CardBase,
    IconLoading,
  },

  data() {
    return {
      isLoading: false,
    };
  },

  created() {
    // Temporary code, to simulate a promise
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  },

  methods: {
    emitHandleConfig() {
      this.$emit('handle-config');
    },
  },
};
</script>

<style scoped lang="scss">
.card-dashboard {
  display: grid;
  grid-template-columns: 1fr auto;

  padding: $unnnic-spacing-md;

  max-height: min-content;

  cursor: pointer;

  &:not(.loading):hover {
    background-color: $unnnic-color-weni-50;
  }

  &.not-configured {
    align-items: center;

    .card__content {
      color: $unnnic-color-neutral-cloudy;
    }
  }

  .card__content {
    color: $unnnic-color-neutral-darkest;
    display: grid;
    gap: $unnnic-spacing-nano;

    .content-title {
      font-family: $unnnic-font-family-primary;
      font-size: $unnnic-font-size-title-lg;
      line-height: $unnnic-line-height-large * 3;
      font-weight: $unnnic-font-weight-bold;
    }
    .content-subtitle {
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-line-height-medium * 3;
    }
  }
}
</style>
