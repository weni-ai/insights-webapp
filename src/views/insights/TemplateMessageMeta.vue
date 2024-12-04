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
      <SingleTable
        class="button-clicks-table"
        title="Button Clicks"
        :pagination="1"
        :paginationInterval="10"
        :paginationTotal="10"
        :headers="[
          { content: 'Label' },
          { content: 'Type' },
          { content: 'Total' },
          { content: 'Clicks in relation to the shot' },
          { content: 'Click rate' },
        ]"
        :rows="[
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
          { content: ['Teste', 'Teste', 'Teste', 'Teste', 'Teste'] },
        ]"
      />
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
import SingleTable from '@/components/insights/widgets/SingleTable.vue';

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
  gap: $unnnic-spacing-sm;

  height: 100vh;

  &__template {
    &-container {
      display: grid;
      background-color: red;
    }

    &-info-container {
      display: grid;

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
        min-height: fit-content;
      }

      .blocked-contacts {
        grid-area: blocked-contacts;
        min-height: fit-content;
      }
      .button-clicks-table {
        grid-area: button-clicks-table;
      }
    }
  }
}
</style>
