<template>
  <section class="template-message-meta-dashboard">
    <section class="template-message-meta-dashboard__template-container">
      <MetaTemplateMessage
        class="template-message-preview"
        :template="{
          title:
            'VTEX adquire Weni e passa a oferecer solução de IA para transformar o atendimento pós-venda de marcas e varejistas',
          text: 'A aquisição fortalece a jornada omnichannel da VTEX, reduz custos de suporte ao cliente e impulsionada por dados e IA aprimora a experiência pós-venda para marcas e varejistas globais.',
          hint: `Não tem interesse? Toque em 'Parar promoções'`,
          quality: 'high',
          name: 'template_dev',
          image:
            'https://vtexecommercep.wpenginepowered.com/wp-content/uploads/2024/09/Weni-Press-Website-3.png',
          buttons: [
            { icon: 'open_in_new', label: 'Acessar notícia' },
            { icon: 'reply', label: 'Parar de receber' },
          ],
        }"
      />
    </section>
    <section class="template-message-meta-dashboard__template-info">
      <div class="template-message-meta-dashboard__template-info-container">
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
          hidePagination
          :pagination="1"
          :paginationInterval="10"
          :paginationTotal="formattedClicksTableData.length"
          :headers="buttonClicksTableHeaders"
          :rows="formattedClicksTableData"
        />
      </div>
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
import MetaTemplateMessage from '@/components/insights/widgets/MetaTemplateMessage.vue';
import { formatToPercent } from '@/utils/number';
import i18n from '@/utils/plugins/i18n';

const buttonClicksTableHeaders = [
  {
    content: i18n.global.t(
      'template_messages_dashboard.button_clicks_table.header.label',
    ),
    isSortable: true,
  },
  {
    content: i18n.global.t(
      'template_messages_dashboard.button_clicks_table.header.type',
    ),
  },
  {
    content: i18n.global.t(
      'template_messages_dashboard.button_clicks_table.header.total',
    ),
  },
  {
    content: i18n.global.t(
      'template_messages_dashboard.button_clicks_table.header.clicks_in_relation_to_the_shot',
    ),
  },
  {
    content: i18n.global.t(
      'template_messages_dashboard.button_clicks_table.header.click_rate',
    ),
  },
];

const buttonClicksTableData = [
  {
    label: 'Teste',
    type: 'Type',
    total: 159,
    clicks_in_relation_to_the_shot: 0,
    click_rate: 10.5,
  },
  {
    label: 'Teste 2',
    type: 'Type',
    total: 50,
    clicks_in_relation_to_the_shot: 0,
    click_rate: 20,
  },
  {
    label: 'Teste 3',
    type: 'Type',
    total: 100,
    clicks_in_relation_to_the_shot: 0,
    click_rate: 50,
  },
  {
    label: 'Teste 4',
    type: 'Type',
    total: 100,
    clicks_in_relation_to_the_shot: 0,
    click_rate: 50,
  },
  {
    label: 'Teste 5',
    type: 'Type',
    total: 100,
    clicks_in_relation_to_the_shot: 0,
    click_rate: 50,
  },
  {
    label: 'Teste 6',
    type: 'Type',
    total: 100,
    clicks_in_relation_to_the_shot: 0,
    click_rate: 50,
  },
  {
    label: 'Teste 7',
    type: 'Type',
    total: 100,
    clicks_in_relation_to_the_shot: 0,
    click_rate: 50,
  },
];

const formattedClicksTableData = buttonClicksTableData.map((row) => ({
  content: [
    row.label,
    row.type,
    row.total,
    row.clicks_in_relation_to_the_shot || '--',
    formatToPercent(row.click_rate),
  ],
}));

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
  height: 100%;

  &__template {
    &-container {
      position: sticky;
      top: 0;
    }

    &-info {
      overflow-y: auto;
      overflow-x: hidden;
      height: 100%;

      &-container {
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
}
</style>
