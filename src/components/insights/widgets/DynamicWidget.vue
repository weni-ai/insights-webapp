<template>
  <component
    :is="currentComponent"
    v-bind="widgetProps"
    v-on="widgetEvents"
  />
</template>

<script>
import BarChart from '@/components/insights/charts/BarChart.vue';
import CardFunnel from '@/components/insights/cards/CardFunnel.vue';
import CardDashboard from '@/components/insights/cards/CardDashboard.vue';
import TableDynamicByFilter from '@/components/insights/widgets/TableDynamicByFilter.vue';

export default {
  name: 'DynamicWidget',

  props: {
    widget: {
      type: Object,
      default: () => ({}),
    },
    isLoading: Boolean,
  },

  components: {
    BarChart,
  },

  computed: {
    currentComponent() {
      const componentMap = {
        graph_column: BarChart,
        graph_bar: null, // TODO: Create BarGraph component
        graph_funnel: CardFunnel,
        table_dynamic_by_filter: TableDynamicByFilter,
        table_group: null, // TODO: Create TableGroup component
        card: CardDashboard,
        insight: null, // TODO: Create Insight component
      };

      return componentMap[this.widget.type] || null;
    },

    widgetProps() {
      const { isLoading } = this;
      const { name, data, type, config, report } = this.widget;
      const mappingProps = {
        card: {
          metric: data?.value || data,
          description: name,
          configured: config && Object.keys(config).length,
          clickable: !!report,
          isLoading,
        },
        table_dynamic_by_filter: {
          headerIcon: config?.icon?.name,
          headerIconColor: config?.icon?.scheme,
          headerTitle: config?.name_overwrite || name,
          fields: config?.fields,
          items: data?.results,
          isLoading,
        },
        graph_column: {
          title: name,
          chartData: this.widgetGraphData,
          isLoading,
        },
      };

      return mappingProps[type];
    },

    widgetGraphData() {
      if (!this.widget.type.includes('graph') || !this.widget.data) {
        return;
      }

      const { data } = this.widget.data;
      const times = data.map((item) => item.time);
      const values = data.map((item) => item.value);

      const newData = {
        labels: times,
        datasets: [
          {
            data: values,
          },
        ],
      };

      return newData;
    },

    widgetEvents() {
      const { type } = this.widget;
      const mappingEvents = {
        card: {
          click: () => this.redirectToReport(),
        },
      };

      return mappingEvents[type];
    },
  },

  methods: {
    redirectToReport() {
      const { uuid, report } = this.widget;
      if (!report) {
        return;
      }

      this.$router.push({
        name: 'report',
        params: { widgetUuid: uuid, reportUuid: report },
      });
    },
  },
};
</script>
