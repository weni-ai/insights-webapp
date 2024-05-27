<template>
  <component
    :is="currentComponent"
    v-bind="treatedWidgetProps"
  />
</template>

<script>
import BarChart from '@/components/insights/charts/BarChart.vue';
import CardFunnel from '@/components/insights/cards/CardFunnel.vue';
import CardDashboard from '@/components/insights/cards/CardDashboard.vue';
import OnlineAgents from '@/components/insights/widgets/OnlineAgents.vue';

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
        time_colum_graph: BarChart,
        bar_graph: null, // TODO: Create BarGraph component
        funnel: CardFunnel,
        dynamic_by_filter_table: OnlineAgents,
        tablegroup: null, // TODO: Create TableGroup component
        card: CardDashboard,
        insight: null, // TODO: Create Insight component
      };

      return componentMap[this.widget.type] || null;
    },

    treatedWidgetProps() {
      const { isLoading } = this;
      const { name, data, type } = this.widget;
      const mappingProps = {
        card: {
          metric: data?.value || data,
          description: name,
          configured: true,
        },
      };

      return mappingProps[type];
    },
  },
};
</script>
