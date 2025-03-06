<template>
  <section
    v-if="initialLoading"
    class="template-message-meta-dashboard__loading"
  >
    <img
      :src="weniLoading"
      width="50"
      height="50"
    />
  </section>

  <section
    v-else
    class="template-message-meta-dashboard"
  >
    <section class="template-message-meta-dashboard__template-container">
      <MetaTemplateMessage
        class="template-message-preview"
        :template="templatePreview"
        :isLoading="isLoadingTemplatePreview"
      />
    </section>
    <section class="template-message-meta-dashboard__template-info">
      <div class="template-message-meta-dashboard__template-info-container">
        <MultipleLineChart
          class="line-chart"
          :isLoading="isLoadingMessagesAnalyticsData"
          :data="formattedMessagesAnalyticsData"
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
          :isLoading="isLoadingButtonsClicksData"
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
import { onMounted, ref, computed, watch } from 'vue';
import { formatToPercent } from '@/utils/number';
import { useStore } from 'vuex';
import { useLocalStorage } from '@vueuse/core';

import MultipleLineChart from '@/components/insights/charts/MultipleLineChart.vue';
import SingleTable from '@/components/insights/widgets/SingleTable.vue';
import MetaTemplateMessage from '@/components/insights/widgets/MetaTemplateMessage.vue';

import i18n from '@/utils/plugins/i18n';

import MetaTemplateMessageService from '@/services/api/resources/template/metaTemplateMessage';

import weniLoading from '@/assets/images/weni-loading.svg';

const store = useStore();

const lastOpenTemplates = useLocalStorage('meta-last-templates-viewed', {});

const initialLoading = ref(false);

onMounted(async () => {
  try {
    initialLoading.value = true;

    const lastViwedTemplateUuid =
      lastOpenTemplates.value[currentDashboard.value?.uuid];

    if (lastViwedTemplateUuid) {
      handlerSelectedTemplateUuid(lastViwedTemplateUuid);
    } else {
      const { results: templates } =
        await MetaTemplateMessageService.listTemplates();
      handlerSelectedTemplateUuid(templates[0]?.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    initialLoading.value = false;
  }
});

const selectedTemplateUuid = computed(
  () => store.state.metaTemplateMessage.selectedTemplateUuid,
);

const currentDashboard = computed(
  () => store.state.dashboards.currentDashboard,
);

const handlerSelectedTemplateUuid = (templateUuid) => {
  store.dispatch('metaTemplateMessage/setSelectedTemplateUuid', templateUuid);
};

const templatePreview = ref({});
const isLoadingTemplatePreview = ref(false);

const getTemplatePreview = async () => {
  try {
    isLoadingTemplatePreview.value = true;
    const response = await MetaTemplateMessageService.getTemplatePreview();
    templatePreview.value = response;
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingTemplatePreview.value = false;
  }
};

const buttonClicksTableHeaders = [
  {
    content: i18n.global.t(
      'template_messages_dashboard.button_clicks_table.header.label',
    ),
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
      'template_messages_dashboard.button_clicks_table.header.click_rate',
    ),
  },
];

const buttonsClicksData = ref([]);
const isLoadingButtonsClicksData = ref(false);

const formattedClicksTableData = computed(() =>
  buttonsClicksData.value.map((row) => ({
    content: [
      row.label,
      row.type,
      String(row.total),
      formatToPercent(row.click_rate),
    ],
  })),
);

const getButtonClicksData = async () => {
  try {
    isLoadingButtonsClicksData.value = true;
    const response =
      await MetaTemplateMessageService.getTemplateButtonsAnalytics();

    buttonsClicksData.value = response;
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingButtonsClicksData.value = false;
  }
};

const messagesAnalyticsData = ref({});
const isLoadingMessagesAnalyticsData = ref(false);

const getMessagesAnalytics = async () => {
  try {
    isLoadingMessagesAnalyticsData.value = true;

    const response =
      await MetaTemplateMessageService.getTemplateMessagesAnalytics();

    messagesAnalyticsData.value = response;
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingMessagesAnalyticsData.value = false;
  }
};

const formattedMessagesAnalyticsData = computed(() => {
  const keyMapper = {
    sent: 'template_messages_dashboard.messages_graph.sent_messages',
    delivered: 'template_messages_dashboard.messages_graph.delivered_messages',
    read: 'template_messages_dashboard.messages_graph.readed_messages',
    clicked: 'template_messages_dashboard.messages_graph.clicks',
  };

  return Object.keys(keyMapper).map((key) => {
    const data =
      messagesAnalyticsData.value.data_points?.map((dataPoint) => ({
        label: dataPoint.date,
        value: dataPoint[key],
      })) || [];

    return {
      group: keyMapper[key],
      data: data,
      total: messagesAnalyticsData.value.status_count?.[key]?.value || 0,
    };
  });
});

const getSelectedTemplateData = () => {
  getTemplatePreview();
  getButtonClicksData();
  getMessagesAnalytics();
};

watch(selectedTemplateUuid, (newUuid, oldUuid) => {
  if (newUuid !== oldUuid) {
    lastOpenTemplates.value[currentDashboard.value.uuid] = newUuid;
    getSelectedTemplateData();
  }
});
</script>

<style lang="scss" scoped>
.template-message-meta-dashboard {
  display: grid;
  grid-template-columns: 3fr 9fr;
  gap: $unnnic-spacing-sm;
  height: 100%;

  &__loading {
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
  }

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
          'button-clicks-table button-clicks-table';

        gap: $unnnic-spacing-sm;

        .line-chart {
          grid-area: line-chart;
        }

        .button-clicks-table {
          grid-area: button-clicks-table;
        }
      }
    }
  }
}
</style>
