<template>
  <CardBase>
    <section class="card-conversations__content">
      <section class="card-conversations__content-item">
        <p class="card-conversations__content-item-title">Resoluções por ia</p>
        <section class="card-conversations__content-item-value-container">
          <p class="card-conversations__content-item-value">100</p>
          <p class="card-conversations__content-item-percentage">10%</p>
        </section>
      </section>
      <section class="card-conversations-progress">
        <UnnnicProgressBar
          v-model="progress"
          class="progress-bar"
          inline
        />
      </section>
    </section>
  </CardBase>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CardBase from './CardBase.vue';

const isLoading = ref(false);
const progress = ref(10);
</script>

<style lang="scss" scoped>
.card-conversations {
  &__content {
    padding: $unnnic-spacing-md;
    min-width: 650px;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-spacing-md;

    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      &-title {
        font-weight: $unnnic-font-weight-bold;
        color: $unnnic-color-neutral-dark;
      }
      &-value-container {
        display: flex;
        flex-direction: column;
        gap: $unnnic-spacing-xs;
      }
      &-value {
        font-weight: $unnnic-font-weight-bold;
        color: $unnnic-color-neutral-dark;
        font-size: $unnnic-font-size-title-lg;
      }
    }
  }
}
</style>
