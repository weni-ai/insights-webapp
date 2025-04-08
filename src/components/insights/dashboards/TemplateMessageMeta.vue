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
    v-else-if="isEmptyTemplates"
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

import emptyMonitory from '@/assets/images/icons/empty_monitory.svg';

import i18n from '@/utils/plugins/i18n';

import MetaTemplateMessageService from '@/services/api/resources/template/metaTemplateMessage';

import weniLoading from '@/assets/images/weni-loading.svg';

import moment from 'moment';

import Unnnic from '@weni/unnnic-system';

const store = useStore();

const waba_id = computed(
  () => store.state.dashboards.currentDashboard.config?.waba_id,
);

const project_uuid = computed(() => store.state.config.project?.uuid);

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
        await MetaTemplateMessageService.listTemplates({
          limit: 1,
          waba_id: waba_id.value,
          project_uuid: project_uuid.value,
        });

      if (templates.length) {
        store.dispatch('metaTemplateMessage/setEmptyTemplates', false);
        handlerSelectedTemplateUuid(templates[0]?.id);
        store.dispatch(
          'metaTemplateMessage/handlerShowSearchTemplateModal',
          true,
        );
      } else store.dispatch('metaTemplateMessage/setEmptyTemplates', true);
    }
  } catch (error) {
    console.error(error);
  } finally {
    initialLoading.value = false;
  }
});

const favoritesTemplates = computed(
  () => store.state.metaTemplateMessage.favoritesTemplates,
);

const isEmptyTemplates = computed(
  () => store.state.metaTemplateMessage.emptyTemplates,
);

const selectedTemplateUuid = computed(
  () => store.state.metaTemplateMessage.selectedTemplateUuid,
);

const selectedFavoriteTemplate = computed(
  () => store.state.metaTemplateMessage.selectedFavoriteTemplate,
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
    read: 'template_messages_dashboard.messages_graph.readed_messages',
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
      total: messagesAnalyticsData.value.status_count?.[key]?.value || 0,
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

const appliedFilters = computed(() => store.state.dashboards.appliedFilters);

watch(appliedFilters, () => {
  const isLoadedPreview = Object.keys(templatePreview.value).length > 0;
  if (selectedTemplateUuid.value)
    getSelectedTemplateData({ ignorePreview: isLoadedPreview });
});

watch(selectedTemplateUuid, (newUuid, oldUuid) => {
  if (newUuid !== oldUuid) {
    lastOpenTemplates.value[currentDashboard.value.uuid] = newUuid;
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

  const favorites = store.state.metaTemplateMessage.favoritesTemplates;

  store.commit('metaTemplateMessage/SET_FAVORITES_TEMPLATES', [
    { name: templatePreview.value.name, id: selectedTemplateUuid.value },
    ...favorites,
  ]);
};

const unfavoriteTemplate = async () => {
  await MetaTemplateMessageService.unfavoriteTemplate({
    dashboardUuid: currentDashboard.value.uuid,
    templateUuid: selectedTemplateUuid.value,
  });

  templatePreview.value.is_favorite = false;

  const favorites = store.state.metaTemplateMessage.favoritesTemplates;

  if (selectedFavoriteTemplate.value[0]?.value === selectedTemplateUuid.value) {
    store.commit('metaTemplateMessage/SET_SELECTED_FAVORITE_TEMPLATE', [
      { value: '' },
    ]);
  }

  store.commit(
    'metaTemplateMessage/SET_FAVORITES_TEMPLATES',
    favorites.filter((favorite) => favorite.id !== selectedTemplateUuid.value),
  );
};
</script>

<style lang="scss" scoped>
.template-message-meta-dashboard {
  display: grid;
  grid-template-columns: 2.5fr 9.5fr;
  gap: $unnnic-spacing-sm;
  height: 100%;

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
