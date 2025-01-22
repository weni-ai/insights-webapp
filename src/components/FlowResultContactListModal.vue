<template>
  <UnnnicModalDialog
    :modelValue="true"
    :title="$t('contact_list_modal.title', { label: props.flowResultLabel })"
    showCloseIcon
    size="lg"
    @update:model-value="$emit('close')"
  >
    <UnnnicTableNext
      :locale="i18n.global.locale"
      :headers="tableHeaders"
      :pagination="page + 1"
      :paginationInterval="limit"
      :paginationTotal="dataCount"
      :isLoading="loading"
      @update:pagination="page = $event - 1"
    />
  </UnnnicModalDialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import i18n from '@/utils/plugins/i18n';

import Unnnic from '@weni/unnnic-system';

import Widget from '@/services/api/resources/widgets';

const props = defineProps({
  flowResultLabel: {
    type: String,
    default: '',
  },
  flow: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close']);

const tableHeaders = [
  { content: i18n.global.t('contact_list_modal.header.contact_name') },
  { content: 'URN' },
  { content: i18n.global.t('contact_list_modal.header.start') },
];

const limit = 5;
const page = ref(0);
const dataCount = ref(0);
const loading = ref(false);
const rows = ref([]);

const formatRow = (data) => {
  return { ...data, content: [data.contact.name, data.urn, data.start] };
};

const getData = async () => {
  try {
    loading.value = true;

    const { count, results } = await Widget.getFlowContactResults({
      limit,
      offset: page.value * limit,
      flow: props.flow.uuid,
      result: props.flow.result,
      label: props.flowResultLabel,
    });

    dataCount.value = count;

    rows.value = results.map((item) => formatRow(item));
  } catch (error) {
    Unnnic.unnnicCallAlert({
      props: {
        text: i18n.global.t('contact_list_modal.message.get_data_fail'),
        type: 'error',
      },
    });
    console.log(error);
    emit('close');
  } finally {
    loading.value = false;
  }
};

watch(page, () => getData(), { immediate: true });
</script>
