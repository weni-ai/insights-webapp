<template>
  <section class="template-message-meta-dashboard">
    <section class="template-message-meta-dashboard__template-container">
      template-message-component
    </section>
    <section class="template-message-meta-dashboard__template-info-container">
      <MultipleLineChart
        class="line-chart"
        :data="chartDataMock"
      />
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
import MultipleLineChart from '@/components/insights/charts/MultipleLineChart.vue';

const chartDataMock = [
  {
    group: 'template_messages_dashboard.messages_graph.sent_messages',
    data: [
      { label: '24/11', value: 10 },
      { label: '25/11', value: 20 },
      { label: '26/11', value: 15 },
      { label: '27/11', value: 9 },
      { label: '28/11', value: 12 },
      { label: '29/11', value: 11 },
      { label: '30/11', value: 9 },
    ],
    total: 86,
  },
  {
    group: 'template_messages_dashboard.messages_graph.delivered_messages',
    data: [
      { label: '24/11', value: 5 },
      { label: '25/11', value: 5 },
      { label: '26/11', value: 15 },
      { label: '27/11', value: 9 },
      { label: '28/11', value: 2 },
      { label: '29/11', value: 5 },
      { label: '30/11', value: 6 },
    ],
    total: 20,
  },
  {
    group: 'template_messages_dashboard.messages_graph.readed_messages',
    data: [
      { label: '24/11', value: 1 },
      { label: '25/11', value: 2 },
      { label: '26/11', value: 3 },
      { label: '27/11', value: 4 },
      { label: '28/11', value: 5 },
      { label: '29/11', value: 6 },
      { label: '30/11', value: 7 },
    ],
    total: 10,
  },
  {
    group: 'template_messages_dashboard.messages_graph.clicks',
    data: [
      { label: '24/11', value: 1 },
      { label: '25/11', value: 1 },
      { label: '26/11', value: 9 },
      { label: '27/11', value: 9 },
      { label: '28/11', value: 9 },
      { label: '29/11', value: 4 },
      { label: '30/11', value: 6 },
    ],
    total: 5,
  },
];
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

      grid-template-rows: 0.5fr 0.5fr 1fr;
      grid-template-columns: 1fr 1fr;

      grid-template-areas:
        'line-chart line-chart'
        'active-contacts blocked-contacts'
        'button-clicks-table button-clicks-table';

      gap: $unnnic-spacing-sm;

      .line-chart {
        grid-area: line-chart;
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
