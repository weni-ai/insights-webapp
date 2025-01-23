<template>
  <component
    :is="currentComponent"
    v-bind="widgetProps"
    v-on="widgetEvents"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex';

import LineChart from '@/components/insights/charts/LineChart.vue';
import HorizontalBarChart from '../charts/HorizontalBarChart.vue';
import CardFunnel from '@/components/insights/cards/CardFunnel.vue';
import CardRecurrence from '@/components/insights/cards/CardRecurrence.vue';
import CardEmpty from '@/components/insights/cards/CardEmpty.vue';
import CardVtexOrder from '@/components/insights/cards/CardVtexOrder.vue';
import CardDashboard from '@/components/insights/cards/CardDashboard.vue';
import HumanServiceAgentsTable from './HumanServiceAgentsTable/index.vue';
import TableGroup from '@/components/insights/widgets/TableGroup.vue';

import { formatSecondsToHumanString } from '@/utils/time';
import { currencySymbols } from '@/utils/currency';

export default {
  name: 'DynamicWidget',

  props: {
    widget: {
      type: Object,
      required: true,
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
      appliedFilters: (state) => state.dashboards.appliedFilters,
    }),

    isConfigured() {
      const { config } = this.widget;
      return !!(config && Object.keys(config).length > 0);
    },

    isLoading() {
      return (
        this.isConfigured && (!('data' in this.widget) || this.isRequestingData)
      );
    },

    currentComponent() {
      const componentMap = {
        graph_column: LineChart,
        graph_bar: HorizontalBarChart,
        graph_funnel: CardFunnel,
        table_dynamic_by_filter: HumanServiceAgentsTable,
        table_group: TableGroup,
        card: CardDashboard,
        empty_column: CardEmpty,
        vtex_order: CardVtexOrder,
        recurrence: CardRecurrence,
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

      const tableDynamicFilterConfig =
        'created_on' in this.appliedFilters
          ? config?.created_on
          : config?.default;

      const mappingProps = {
        card: {
          metric: this.getWidgetFormattedData(this.widget),
          description: name,
          configured: !!name,
          /* The "configured" field is only checking if the name is defined, since the widget may be unconfigured,
          but still have empty fields in the "config" object. */
          clickable: !!report,
          configurable: is_configurable,
          friendlyId: config?.friendly_id,
          tooltip: config?.tooltip ? this.$t(config.tooltip) : '',
        },
        table_dynamic_by_filter: {
          headerTitle: tableDynamicFilterConfig?.name_overwrite || name,
          headers: tableDynamicFilterConfig?.fields,
          items: data?.results,
        },
        table_group: {
          tabs: config,
          data: data?.results,
          paginationTotal: data?.count,
        },
        graph_column: {
          title: this.$t(name),
          chartData: this.widgetGraphData || {},
          seeMore: !!report,
        },
        graph_bar: {
          title: this.$t(name),
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
        empty_column: {
          widget: this.widget,
        },
        vtex_order: {
          widget: this.widget,
          data: this.widgetVtexData,
        },
        recurrence: {
          widget: this.widget,
          data: this.widget?.data,
          seeMore: !!report,
        },
      };

      return { ...defaultProps, ...mappingProps[type] };
    },

    widgetVtexData() {
      if (this.widget.type === 'vtex_order' && this.widget.data) {
        const { total_value, average_ticket, orders } = this.widget.data;
        const existOrders = orders !== '';
        const existTotalValue = total_value !== '';
        const existAverageTicketValue = average_ticket !== '';
        const currentSymbol =
          currencySymbols[this.currentDashboard.config?.currency_type];

        const numbersNormalization = (value) =>
          `${currentSymbol} ${Number(value || 0).toLocaleString(this.$i18n.locale || 'en-US', { minimumFractionDigits: 2 })}`;

        return {
          ...this.widget.data,
          orders: existOrders
            ? (orders || 0).toLocaleString(this.$i18n.locale || 'en-US')
            : orders,
          total_value: existTotalValue
            ? numbersNormalization(total_value)
            : total_value,
          average_ticket: existAverageTicketValue
            ? numbersNormalization(average_ticket)
            : average_ticket,
        };
      }

      return null;
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
      const data = widgetData.data || widgetData.results;

      const labels = data.map((item) => item.label);
      const values = data.map((item) => item.value);
      const fullValues = data.map((item) => item.full_value);

      const newData = {
        labels,
        datasets: [
          {
            data: values,
            fullValues,
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
        empty_column: {
          openConfig: () => this.$emit('open-config'),
        },
        vtex_order: {
          openConfig: () => this.$emit('open-config'),
          requestData: () => {
            this.isRequestingData = true;
            this.requestVtexOrderData().finally(() => {
              this.isRequestingData = false;
            });
          },
        },
        recurrence: {
          openConfig: () => this.$emit('open-config'),
          seeMore: () => this.redirectToReport(),
          requestData: () => {
            this.isRequestingData = true;
            this.requestRecurrenceData().finally(() => {
              this.isRequestingData = false;
            });
          },
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
        if (
          ![
            'table_group',
            'graph_funnel',
            'empty_column',
            'vtex_order',
            'recurrence',
          ].includes(this.widget.type)
        ) {
          this.requestWidgetData();
        }
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions({
      getCurrentDashboardWidgetData: 'widgets/getCurrentDashboardWidgetData',
      getWidgetReportData: 'reports/getWidgetReportData',
      getWidgetGraphFunnelData: 'widgets/getWidgetGraphFunnelData',
      getWidgetVtexOrderData: 'widgets/getWidgetVtexOrderData',
      getWidgetRecurrenceData: 'widgets/getWidgetRecurrenceData',
    }),

    async requestWidgetData({ offset, limit, next } = {}) {
      try {
        this.isRequestingData = true;

        if (this.$route.name === 'report') {
          await this.getWidgetReportData({ offset, limit, next });
        } else if (this.isConfigured) {
          await this.getCurrentDashboardWidgetData(this.widget);
        }
      } catch (e) {
        console.error('requestWidgetData error', e);
      } finally {
        this.isRequestingData = false;
      }
    },

    async requestVtexOrderData() {
      const { uuid, config } = this.widget;

      await this.getWidgetVtexOrderData({
        uuid,
        utm_source: config.filter.utm,
      });
    },

    async requestRecurrenceData() {
      const { uuid } = this.widget;

      await this.getWidgetRecurrenceData({
        uuid,
      });
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

    getWidgetFormattedData(widget) {
      const { config, data } = widget;

      if (config?.operation === 'recurrence') {
        return (
          (data?.value || 0).toLocaleString(this.$i18n.locale || 'en-US', {
            minimumFractionDigits: 2,
          }) + '%'
        );
      }
      if (config?.data_type === 'sec') {
        return formatSecondsToHumanString(Math.round(data?.value));
      }
      if (config?.currency) {
        return `${currencySymbols[this.currentDashboard.config?.currency_type]} ${Number(data?.value || 0).toLocaleString(this.$i18n.locale || 'en-US', { minimumFractionDigits: 2 })}`;
      }
      return (data?.value || 0).toLocaleString(this.$i18n.locale || 'en-US');
    },
  },
};
</script>
