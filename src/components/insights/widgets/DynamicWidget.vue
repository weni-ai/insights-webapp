<template>
  <component
    :is="currentComponent"
    v-bind="widgetProps"
    v-on="widgetEvents"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex';

import BarChart from '@/components/insights/charts/BarChart.vue';
import HorizontalBarChart from '../charts/HorizontalBarChart.vue';
import CardFunnel from '@/components/insights/cards/CardFunnel.vue';
import CardDashboard from '@/components/insights/cards/CardDashboard.vue';
import TableDynamicByFilter from '@/components/insights/widgets/TableDynamicByFilter.vue';
import TableGroup from '@/components/insights/widgets/TableGroup.vue';

export default {
  name: 'DynamicWidget',

  props: {
    widget: {
      type: Object,
      default: () => ({}),
    },
  },

  created() {
    if (this.$route.name === 'report') {
      this.getWidgetReportData();
    } else if (this.isConfigured) {
      this.getCurrentDashboardWidgetData(this.widget.uuid);
    }
  },

  computed: {
    ...mapState({
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),

    isConfigured() {
      const { config } = this.widget;
      return config && Object.keys(config).length > 0;
    },

    isLoading() {
      return this.isConfigured && !('data' in this.widget);
    },

    currentComponent() {
      const componentMap = {
        graph_column: BarChart,
        graph_bar: HorizontalBarChart,
        graph_funnel: CardFunnel,
        table_dynamic_by_filter: TableDynamicByFilter,
        table_group: TableGroup,
        card: CardDashboard,
        insight: null, // TODO: Create Insight component
      };

      return componentMap[this.widget.type] || null;
    },

    widgetProps() {
      const { isLoading } = this;
      const { name, data, type, config, report } = this.widget;

      const defaultProps = {
        isLoading,
      };

      const mappingProps = {
        card: {
          metric: data?.value || data,
          description: name,
          configured: config && !!Object.keys(config).length,
          clickable: !!report,
        },
        table_dynamic_by_filter: {
          headerIcon: config?.icon?.name,
          headerIconColor: config?.icon?.scheme,
          headerTitle: config?.name_overwrite || name,
          fields: config?.fields,
          items: data?.results,
        },
        table_group: {
          tabs: config,
          data: data?.results,
          paginationTotal: data?.count,
        },
        graph_column: {
          title: name,
          chartData: this.widgetGraphData || {},
          seeMore: !!report,
        },
        graph_bar: {
          title: name,
          chartData: this.widgetGraphData || {},
          seeMore: !!report,
        },
      };

      return { ...defaultProps, ...mappingProps[type] };
    },

    widgetGraphData() {
      if (!this.widget.type.includes('graph') || !this.widget.data) {
        return;
      }

      const { data, results } = this.widget.data;
      const labels = (data || results).map((item) => item.label);
      const values = (data || results).map((item) => item.value);

      const newData = {
        labels,
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
          openConfig: () => this.$emit('open-config'),
        },
        graph_column: {
          seeMore: () => this.redirectToReport(),
        },
        graph_funnel: {
          openConfig: () => this.$emit('open-config'),
        },
      };

      return mappingEvents[type] || {};
    },
  },

  methods: {
    ...mapActions({
      getCurrentDashboardWidgetData: 'dashboards/getCurrentDashboardWidgetData',
      getWidgetReportData: 'reports/getWidgetReportData',
    }),

    redirectToReport() {
      const { uuid, report } = this.widget;
      if (!report) {
        return;
      }

      switch (report.type) {
        case 'internal':
          this.$router.push({
            name: 'report',
            params: {
              dashboardUuid: this.currentDashboard.uuid,
              widgetUuid: uuid,
            },
          });
          break;

        case 'external':
          window.open(report.url, '_blank');
          break;

        default:
          break;
      }
    },
  },

  watch: {
    '$route.query'() {
      if (this.$route.name === 'report') {
        this.getWidgetReportData();
      }
    },
  },
};
</script>
