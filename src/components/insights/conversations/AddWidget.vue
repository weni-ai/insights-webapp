<template>
  <section
    class="add-widget"
    data-testid="add-widget"
  >
    <h2
      class="add-widget__title"
      data-testid="add-widget-title"
    >
      {{ $t('conversations_dashboard.customize_your_dashboard.title') }}
    </h2>
    <p
      class="add-widget__description"
      data-testid="add-widget-description"
    >
      {{ $t('conversations_dashboard.customize_your_dashboard.description') }}
    </p>
    <UnnnicButton
      data-testid="add-widget-button"
      :text="$t('conversations_dashboard.customize_your_dashboard.add_widget')"
      iconLeft="add"
      size="small"
      type="primary"
      @click="handleDrawerAddWidget"
    />
  </section>

  <UnnnicDrawer
    v-if="isAddWidgetDrawerOpen"
    :modelValue="isAddWidgetDrawerOpen"
    title="Widgets"
    class="add-widget-drawer"
    data-testid="add-widget-drawer"
    @close="handleDrawerAddWidget"
  >
    <template #content>
      <ul class="add-widget-drawer__widget-list">
        <li
          v-for="widget in availableWidgets"
          :key="widget.name"
          class="widget-list__item"
          data-testid="add-widget-drawer-item"
        >
          <h2
            class="item__title"
            data-testid="add-widget-drawer-item-title"
          >
            {{ widget.name }}
          </h2>
          <p
            class="item__description"
            data-testid="add-widget-drawer-item-description"
          >
            {{ widget.description }}
          </p>
        </li>
      </ul>
    </template>
  </UnnnicDrawer>
</template>

<script setup>
import { ref } from 'vue';

const isAddWidgetDrawerOpen = ref(false);

function handleDrawerAddWidget() {
  isAddWidgetDrawerOpen.value = !isAddWidgetDrawerOpen.value;
}

const availableWidgets = ref([
  {
    name: 'CSAT',
    description:
      'The Customer Satisfaction Score indicates the contact level of satisfaction with the service received.',
  },
  {
    name: 'NPS',
    description:
      'The Net Promoter Score indicates how likely contact are to recommend the service they received to others.',
  },
]);
</script>

<style scoped lang="scss">
.add-widget {
  position: absolute;
  top: 0;
  right: 0;

  padding: $unnnic-spacing-nano 0;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-ant;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  border-radius: $unnnic-border-radius-md;
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

  &-drawer {
    &__widget-list {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-sm;

      .widget-list__item {
        padding: $unnnic-spacing-md;

        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: $unnnic-spacing-nano;

        border-radius: $unnnic-border-radius-md;
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

        cursor: pointer;

        .item__title {
          color: $unnnic-color-neutral-darkest;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-lg;
          font-weight: $unnnic-font-weight-bold;
          line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        }

        .item__description {
          color: $unnnic-color-neutral-cloudy;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        }
      }
    }
  }
}
</style>
