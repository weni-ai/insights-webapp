<template>
  <NewsModal
    :modelValue="modelValue"
    :title="title"
    :news="news"
  />
</template>

<script setup lang="ts">
import NewsModal from '@/components/NewsModal.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  type: 'monitoring' | 'analysis';
}>();

const title = ref(t('news.title'));
const news = ref(
  props.type === 'monitoring'
    ? [
        {
          description: t('news.human_support_dashboard.monitoring.third_text'),
          image: 'https://via.placeholder.com/150',
        },
        {
          description: t('news.human_support_dashboard.monitoring.fourth_text'),
          image: 'https://via.placeholder.com/150',
        },
        {
          description: t('news.human_support_dashboard.monitoring.fifth_text'),
          image: 'https://via.placeholder.com/150',
        },
        {
          description: t('news.human_support_dashboard.monitoring.sixth_text'),
          image: 'https://via.placeholder.com/150',
        },
        {
          description: t(
            'news.human_support_dashboard.monitoring.seventh_text',
          ),
          image: 'https://via.placeholder.com/150',
        },
      ]
    : [
        {
          description: t('news.human_support_dashboard.analysis.first_text'),
          image: 'https://via.placeholder.com/150',
        },
        {
          description: t('news.human_support_dashboard.analysis.second_text'),
          image: 'https://via.placeholder.com/150',
        },
        {
          description: t('news.human_support_dashboard.analysis.third_text'),
          image: 'https://via.placeholder.com/150',
        },
        {
          description: t('news.human_support_dashboard.analysis.fourth_text'),
          image: 'https://via.placeholder.com/150',
        },
      ],
);
</script>
