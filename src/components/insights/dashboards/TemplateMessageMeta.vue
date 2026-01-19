<template>
  <section
    v-if="initialLoading"
    class="template-message-meta-dashboard__loading"
    data-testid="template-message-meta-dashboard-loading"
  >
    <img
      :src="weniLoading"
      width="50"
      height="50"
    />
  </section>

  <section class="template-message-meta-dashboard__tabs">
    <section class="template-message-meta-dashboard__tabs-container">
      <p
        :class="{
          'template-message-meta-dashboard__tab': true,
          'template-message-meta-dashboard__tab--active': viewTab === 'home',
        }"
        @click="viewTab = 'home'"
      >
        {{ $t('template_messages_dashboard.all_data') }}
      </p>
      <template v-if="templatePreview.name">
        <UnnnicIcon
          icon="arrow-right-1-1"
          size="sm"
        />
        <p
          :class="{
            'template-message-meta-dashboard__tab': true,
            'template-message-meta-dashboard__tab--active':
              viewTab === 'template',
          }"
          @click="viewTab = 'template'"
        >
          {{ templatePreview.name }}
        </p>
      </template>
    </section>
    <UnnnicSelectSmart
      v-if="viewTab === 'template'"
      v-model="selectedApiOptions"
      :options="dataSourceOptions"
    />
  </section>
  <template v-if="viewTab === 'home'">
    <h1 class="template-message-meta-dashboard__categories-title">
      {{ $t('template_messages_dashboard.all_data_table.title') }}
    </h1>
    <section class="template-message-meta-dashboard__categories">
      <SingleTable
        :headers="categoriesMetricsHeaders"
        :rows="formattedCategoriesMetrics"
        hidePagination
        :pagination="1"
        :paginationInterval="3"
        :paginationTotal="categoriesMetrics?.length"
        :isLoading="isLoadingCategoriesMetrics"
      />
    </section>
  </template>

  <template v-else-if="viewTab === 'template'">
    <section
      v-if="isEmptyTemplates"
      class="template-message-meta-dashboard__empty"
    >
      <img
        class="template-message-meta-dashboard__empty-image"
        :src="emptyMonitory"
      />
      <p class="template-message-meta-dashboard__empty-text">
        {{ $t('template_messages_dashboard.empty_templates') }}
      </p>
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
          @favorite="favoriteTemplate()"
          @unfavorite="unfavoriteTemplate()"
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
            :title="$t('template_messages_dashboard.button_clicks_table.title')"
            hidePagination
            :pagination="1"
            :paginationInterval="10"
            :paginationTotal="formattedClicksTableData?.length"
            :headers="buttonClicksTableHeaders"
            :rows="formattedClicksTableData"
            :isLoading="isLoadingButtonsClicksData"
          />
        </div>
      </section>
    </section>
  </template>
</template>

<script>
export default {
  name: 'TemplateMessageMeta',
};
</script>

<script setup>
import { onMounted, ref, computed, watch, onUnmounted } from 'vue';

import { moduleStorage } from '@/utils/storage';

import MultipleLineChart from '@/components/insights/charts/MultipleLineChart.vue';
import SingleTable from '@/components/insights/widgets/SingleTable.vue';
import MetaTemplateMessage from '@/components/insights/widgets/MetaTemplateMessage.vue';

import emptyMonitory from '@/assets/images/icons/empty_monitory.svg';

import i18n from '@/utils/plugins/i18n';

import MetaTemplateMessageService from '@/services/api/resources/template/metaTemplateMessage';

import weniLoading from '@/assets/images/weni-loading.svg';

import moment from 'moment';

import Unnnic from '@weni/unnnic-system';

import { formatValue, formatToPercent } from '@/utils/numbers';
import { useDashboards } from '@/store/modules/dashboards';
import { useConfig } from '@/store/modules/config';
import { useMetaTemplateMessage } from '@/store/modules/templates/metaTemplateMessage';

const dashboardsStore = useDashboards();
const configStore = useConfig();
const metaTemplateMessageStore = useMetaTemplateMessage();

const waba_id = computed(
  () => dashboardsStore.currentDashboard.config?.waba_id,
);

const app_uuid = computed(
  () => dashboardsStore.currentDashboard.config?.app_uuid,
);

const project_uuid = computed(() => configStore.project?.uuid);

const lastOpenTemplates = ref(
  moduleStorage.getItem('meta-last-templates-viewed', {}),
);

const initialLoading = ref(false);

const viewTab = ref('home');

const dataSourceOptions = [
  {
    label: i18n.global.t('template_messages_dashboard.data_source', {
      source: 'Cloud API',
    }),
    value: 'CLOUD_API',
  },
  {
    label: i18n.global.t('template_messages_dashboard.data_source', {
      source: 'MM Lite API',
    }),
    value: 'MARKETING_MESSAGES_LITE_API',
  },
];

const selectedApiOptions = ref([
  {
    label: i18n.global.t('template_messages_dashboard.data_source', {
      source: 'Cloud API',
    }),
    value: 'cloud_api',
  },
]);

onUnmounted(() => {
  metaTemplateMessageStore.setSelectedTemplateUuid('');
});

onMounted(async () => {
  try {
    initialLoading.value = true;

    getCategoriesMetrics();

    const lastViwedTemplateUuid =
      lastOpenTemplates.value[currentDashboard.value?.uuid];

    if (lastViwedTemplateUuid) {
      handlerSelectedTemplateUuid(lastViwedTemplateUuid);
    } else {
      const { results: templates } =
        await MetaTemplateMessageService.listTemplates({
          limit: 1,
          waba_id: waba_id.value,
          project_uuid: project_uuid.value,
        });

      if (templates.length) {
        metaTemplateMessageStore.setEmptyTemplates(false);
        handlerSelectedTemplateUuid(templates[0]?.id);
      } else metaTemplateMessageStore.setEmptyTemplates(true);
    }
  } catch (error) {
    console.error(error);
  } finally {
    initialLoading.value = false;
  }
});

const favoritesTemplates = computed(
  () => metaTemplateMessageStore.favoritesTemplates,
);

const isEmptyTemplates = computed(
  () => metaTemplateMessageStore.emptyTemplates,
);

const selectedTemplateUuid = computed(
  () => metaTemplateMessageStore.selectedTemplateUuid,
);

const selectedFavoriteTemplate = computed(
  () => metaTemplateMessageStore.selectedFavoriteTemplate,
);

const currentDashboard = computed(() => dashboardsStore.currentDashboard);

const handlerSelectedTemplateUuid = (templateUuid) => {
  metaTemplateMessageStore.setSelectedTemplateUuid(templateUuid);
};

const categoriesMetricsHeaders = [
  {
    content: i18n.global.t(
      'template_messages_dashboard.all_data_table.header.category',
    ),
  },
  {
    content: i18n.global.t(
      'template_messages_dashboard.all_data_table.header.qtd',
    ),
  },
];

const categoriesMetrics = ref({
  MARKETING: 0,
  SERVICE: 0,
  UTILITY: 0,
  AUTHENTICATION: 0,
});

const formattedCategoriesMetrics = computed(() => {
  return Object.entries(categoriesMetrics.value).map(([key, value]) => ({
    content: [
      i18n.global.t(`template_messages_dashboard.all_data_table.row.${key}`),
      value,
    ],
  }));
});

const isLoadingCategoriesMetrics = ref(false);

const getCategoriesMetrics = async () => {
  try {
    isLoadingCategoriesMetrics.value = true;
    const response = await MetaTemplateMessageService.getCategoriesMetrics({
      app_uuid: app_uuid.value,
      project_uuid: project_uuid.value,
      start: appliedFilters.value?.date?._start,
      end: appliedFilters.value?.date?._end,
    });

    if (response?.templates) {
      const keys = Object.keys(categoriesMetrics.value);
      keys.forEach((key) => {
        categoriesMetrics.value[key] = response.templates[key] || 0;
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingCategoriesMetrics.value = false;
  }
};

const templatePreview = ref({});
const isLoadingTemplatePreview = ref(false);

const getTemplatePreview = async () => {
  try {
    isLoadingTemplatePreview.value = true;
    const params = {
      project_uuid: project_uuid.value,
      waba_id: waba_id.value,
      template_id: selectedTemplateUuid.value,
    };
    const response =
      await MetaTemplateMessageService.getTemplatePreview(params);
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

const formattedClicksTableData = computed(() => {
  return buttonsClicksData.value?.map((row) => ({
    content: [
      row.label,
      i18n.global.t(
        `template_messages_dashboard.button_clicks_table.button_type.${row.type}`,
      ),
      String(row.total),
      formatToPercent(row.click_rate),
    ],
  }));
});

const getButtonClicksData = async () => {
  try {
    isLoadingButtonsClicksData.value = true;

    const params = {
      waba_id: waba_id.value,
      project_uuid: project_uuid.value,
      template_id: selectedTemplateUuid.value,
      date_start: appliedFilters.value?.date?._start,
      date_end: appliedFilters.value?.date?._end,
      product_type: selectedApiOptions.value[0].value,
    };

    const response =
      await MetaTemplateMessageService.getTemplateButtonsAnalytics(params);

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

    const params = {
      waba_id: waba_id.value,
      project_uuid: project_uuid.value,
      template_id: selectedTemplateUuid.value,
      start_date: appliedFilters.value?.date?._start,
      end_date: appliedFilters.value?.date?._end,
      product_type: selectedApiOptions.value[0].value,
    };

    const response =
      await MetaTemplateMessageService.getTemplateMessagesAnalytics(params);

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
    read: 'template_messages_dashboard.messages_graph.read_messages',
    clicked: 'template_messages_dashboard.messages_graph.clicks',
  };

  return Object.keys(keyMapper).map((key) => {
    const data =
      messagesAnalyticsData.value.data_points?.map((dataPoint) => ({
        label: moment(dataPoint.date).format(i18n.global.t('date_format')),
        value: dataPoint[key],
      })) || [];

    return {
      group: keyMapper[key],
      data: data,
      total: formatValue(
        messagesAnalyticsData.value.status_count?.[key]?.value || 0,
        i18n.global.locale,
      ),
    };
  });
});

const getSelectedTemplateData = (
  { ignorePreview } = { ignorePreview: false },
) => {
  if (!ignorePreview) getTemplatePreview();
  getButtonClicksData();
  getMessagesAnalytics();
};

const appliedFilters = computed(() => dashboardsStore.appliedFilters);

watch([appliedFilters, selectedApiOptions], () => {
  const isLoadedPreview = Object.keys(templatePreview.value).length > 0;
  getCategoriesMetrics();
  if (selectedTemplateUuid.value)
    getSelectedTemplateData({ ignorePreview: isLoadedPreview });
});

watch(selectedTemplateUuid, (newUuid, oldUuid) => {
  if (newUuid !== oldUuid) {
    lastOpenTemplates.value[currentDashboard.value.uuid] = newUuid;
    moduleStorage.setItem(
      'meta-last-templates-viewed',
      lastOpenTemplates.value,
    );
    if (oldUuid) viewTab.value = 'template';
    getSelectedTemplateData();
  }
});

const favoriteTemplate = async () => {
  if (favoritesTemplates.value.length === 5) {
    Unnnic.unnnicCallAlert({
      props: {
        text: i18n.global.t(
          'template_messages_dashboard.favorite_limit_reached',
        ),
        type: 'error',
      },
    });
    return;
  }

  await MetaTemplateMessageService.favoriteTemplate({
    dashboardUuid: currentDashboard.value.uuid,
    templateUuid: selectedTemplateUuid.value,
  });

  templatePreview.value.is_favorite = true;

  const favorites = metaTemplateMessageStore.favoritesTemplates;

  metaTemplateMessageStore.favoritesTemplates = [
    { name: templatePreview.value.name, id: selectedTemplateUuid.value },
    ...favorites,
  ];
};

const unfavoriteTemplate = async () => {
  await MetaTemplateMessageService.unfavoriteTemplate({
    dashboardUuid: currentDashboard.value.uuid,
    templateUuid: selectedTemplateUuid.value,
  });

  templatePreview.value.is_favorite = false;

  const favorites = metaTemplateMessageStore.favoritesTemplates;

  if (selectedFavoriteTemplate.value[0]?.value === selectedTemplateUuid.value) {
    metaTemplateMessageStore.setSelectedFavorite([{ value: '' }]);
  }

  metaTemplateMessageStore.favoritesTemplates = favorites.filter(
    (favorite) => favorite.id !== selectedTemplateUuid.value,
  );
};
</script>

<style lang="scss" scoped>
.template-message-meta-dashboard {
  display: grid;
  grid-template-columns: 2.5fr 9.5fr;
  gap: $unnnic-space-4;
  height: 100%;

  &__tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $unnnic-spacing-md;

    &-container {
      display: flex;
      align-items: center;
      gap: $unnnic-space-4;
    }
  }

  &__tab {
    cursor: pointer;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
    text-decoration: underline solid;
    color: $unnnic-color-neutral-cloudy;

    &--active {
      color: $unnnic-color-neutral-dark;
      font-weight: $unnnic-font-weight-black;
      text-decoration: none;
    }
  }

  &__categories {
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;
    &-title {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
      color: $unnnic-color-neutral-dark;
      margin-bottom: 10px;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;

    &-image {
      max-width: 202px;
      max-height: 202px;
    }
    &-text {
      color: $unnnic-color-neutral-cloudy;
      text-align: center;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
    }
  }

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

        gap: $unnnic-space-4;

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
