<template>
  <section class="add-widget">
    <h2 class="add-widget__title">Customize your dashboard</h2>
    <p class="add-widget__description">
      Customize the dashboard with your key metrics
    </p>
    <UnnnicButton
      text="Add widget"
      iconLeft="add"
      size="small"
      type="primary"
      @click="handleDrawerAddWidget"
    />
  </section>
</template>

<script setup>
import { ref } from 'vue';

const isAddWidgetDrawerOpen = ref(false);

function handleDrawerAddWidget() {
  isAddWidgetDrawerOpen.value = !isAddWidgetDrawerOpen.value;
}
</script>

<style scoped lang="scss">
.add-widget {
  padding: $unnnic-spacing-nano 0;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-ant;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  border-radius: $unnnic-border-radius-sm;
  border: $unnnic-border-width-thinner dashed $unnnic-color-neutral-soft;
  background: #ffffffcc;

  backdrop-filter: blur(5px);

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }
}
</style>
