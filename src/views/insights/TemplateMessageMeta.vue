<template>
  <section class="template-message-meta-dashboard">
    <section class="template-message-meta-dashboard__template-container">
      template-message-component
    </section>
    <section class="template-message-meta-dashboard__template-info-container">
      <div class="line-chart">multiple-line-chart</div>

      <CardDashboard
        class="active-contacts"
        configured
        :description="$t('template_messages_dashboard.active_contacts.title')"
        :tooltip="$t('template_messages_dashboard.active_contacts.tooltip')"
        metric="10"
      />
      <CardDashboard
        class="blocked-contacts"
        configured
        :description="$t('template_messages_dashboard.blocks.title')"
        metric="0"
      />

      <div class="button-clicks-table">button-clicks-table</div>
    </section>
  </section>
</template>

<script>
export default {
  name: 'TemplateMessageMeta',
};
</script>

<script setup>
import CardDashboard from '@/components/insights/cards/CardDashboard.vue';
</script>

<style lang="scss" scoped>
.template-message-meta-dashboard {
  display: grid;
  grid-template-columns: 3fr 9fr;
  width: 100%;
  height: 100%;
  gap: $unnnic-spacing-sm;
  overflow: auto;

  &__template {
    &-container {
      display: flex;
      background-color: red;
    }

    &-info-container {
      overflow-y: auto;
      display: grid;

      grid-template-rows: 1fr 0.5fr 0.8fr;
      grid-template-columns: 1fr 1fr;

      grid-template-areas:
        'line-chart line-chart'
        'active-contacts blocked-contacts'
        'button-clicks-table button-clicks-table';

      gap: $unnnic-spacing-sm;

      .line-chart {
        grid-area: line-chart;
        background-color: green;
      }

      .active-contacts {
        grid-area: active-contacts;
      }

      .blocked-contacts {
        grid-area: blocked-contacts;
      }
      .button-clicks-table {
        grid-area: button-clicks-table;
        background-color: grey;
      }
    }
  }
}
</style>
