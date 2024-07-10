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

import { sortByKey } from '@/utils/array';
import { formatSecondsToHumanString } from '@/utils/time';

export default {
  name: 'DynamicWidget',

  props: {
    widget: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['open-config'],

  data() {
    return {
      isRequestingData: false,
    };
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
      return (
        this.isConfigured && (!('data' in this.widget) || this.isRequestingData)
      );
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
      const { name, data, type, config, report, is_configurable } = this.widget;

      const defaultProps = {
        isLoading,
      };

      const mappingMetricDataTypesFormat = {
        // use Math.roud function to prevent float number in media case
        sec: (value) => formatSecondsToHumanString(Math.round(value)),
      };

      const mappingProps = {
        card: {
          metric:
            mappingMetricDataTypesFormat[config.data_type]?.(data?.value) ||
            JSON.stringify(data?.value),
          description: name,
          configured: config && !!Object.keys(config).length,
          clickable: !!report,
          configurable: is_configurable,
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
          datalabelsSuffix: config?.data_suffix,
          seeMore: !!report,
        },
        graph_funnel: {
          widget: this.widget,
          chartData: data,
          configurable: is_configurable,
          configured: this.isConfigured,
        },
      };

      return { ...defaultProps, ...mappingProps[type] };
    },

    widgetGraphData() {
      if (
        !this.widget.type.includes('graph') ||
        this.widget.type === 'graph_funnel' ||
        !this.widget.data
      ) {
        return;
      }

      const widgetData = this.widget.data;
      let data = widgetData.data || widgetData.results;

      if (this.widget.type === 'graph_column') {
        data = sortByKey(data, 'label');
      }

      const labels = data.map((item) => item.label);
      const values = data.map((item) => item.value);

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
      const { type, uuid, config } = this.widget;
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
          requestData: () => {
            this.isRequestingData = true;
            this.getWidgetGraphFunnelData({
              uuid,
              widgetFunnelConfig: config,
            }).finally(() => {
              this.isRequestingData = false;
            });
          },
        },
        table_group: {
          requestData: ({ offset, limit }) =>
            this.requestWidgetData({ offset, limit }),
        },
      };

      return mappingEvents[type] || {};
    },
  },

  watch: {
    '$route.query': {
      handler() {
        if (['table_group', 'graph_funnel'].includes(this.widget.type)) {
          return;
        }
        this.requestWidgetData();
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions({
      getCurrentDashboardWidgetData: 'dashboards/getCurrentDashboardWidgetData',
      getWidgetReportData: 'reports/getWidgetReportData',
      getWidgetGraphFunnelData: 'dashboards/getWidgetGraphFunnelData',
    }),

    async requestWidgetData({ offset, limit, next } = {}) {
      this.isRequestingData = true;

      if (this.$route.name === 'report') {
        await this.getWidgetReportData({ offset, limit, next });
      } else if (this.isConfigured) {
        await this.getCurrentDashboardWidgetData(this.widget.uuid);
      }

      this.isRequestingData = false;
    },

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
            query: {
              ...this.$route.query,
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
};
</script>
