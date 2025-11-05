<template>
  <NewsModal
    data-testid="news-human-support-modal"
    :modelValue="modelValue"
    :title="title"
    :news="
      news as {
        description: string;
        secondDescription: string;
        image: string;
      }[]
    "
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import NewsModal from '@/components/NewsModal.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
// @ts-ignore
import monitoringGif01 from '@/assets/images/news/monitoring-gif-01.gif';
// @ts-ignore
import monitoringGif02 from '@/assets/images/news/monitoring-gif-02.gif';
// @ts-ignore
import monitoringGif03 from '@/assets/images/news/monitoring-gif-03.gif';
// @ts-ignore
import monitoringGif04 from '@/assets/images/news/monitoring-gif-04.gif';
// @ts-ignore
import monitoringGif05 from '@/assets/images/news/monitoring-gif-05.gif';
// @ts-ignore
import analysisGif01 from '@/assets/images/news/analysis-gif-01.gif';
// @ts-ignore
import analysisGif02 from '@/assets/images/news/analysis-gif-02.gif';
// @ts-ignore
import analysisGif03 from '@/assets/images/news/analysis-gif-03.gif';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  type: 'monitoring' | 'analysis';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleClose = () => {
  emit('close');
};

const title = ref(t('news.title'));
const news = ref(
  props.type === 'monitoring'
    ? [
        {
          description: t('news.human_support_dashboard.monitoring.first_text'),
          image: monitoringGif01,
        },
        {
          description: t('news.human_support_dashboard.monitoring.second_text'),
          image: monitoringGif02,
        },
        {
          description: t('news.human_support_dashboard.monitoring.third_text'),
          image: monitoringGif03,
        },
        {
          description: t('news.human_support_dashboard.monitoring.fourth_text'),
          secondDescription: t(
            'news.human_support_dashboard.monitoring.fifth_text',
          ),
          image: monitoringGif04,
        },
        {
          description: t('news.human_support_dashboard.monitoring.sixth_text'),
          secondDescription: t(
            'news.human_support_dashboard.monitoring.seventh_text',
          ),
          image: monitoringGif05,
        },
      ]
    : [
        {
          description: t('news.human_support_dashboard.analysis.first_text'),
          image: analysisGif01,
        },
        {
          description: t('news.human_support_dashboard.analysis.second_text'),
          image: analysisGif02,
        },
        {
          description: t('news.human_support_dashboard.analysis.third_text'),
          secondDescription: t(
            'news.human_support_dashboard.analysis.fourth_text',
          ),
          image: analysisGif03,
        },
      ],
);
</script>
