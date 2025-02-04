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
      :pagination="page"
      :paginationInterval="limit"
      :paginationTotal="dataCount"
      :isLoading="loading"
      :rows="rows"
      @update:pagination="page = $event"
    />
  </UnnnicModalDialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import i18n from '@/utils/plugins/i18n';

import Unnnic from '@weni/unnnic-system';

import Widget from '@/services/api/resources/widgets';
import moment from 'moment';

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
const page = ref(1);
const dataCount = ref(0);
const loading = ref(false);
const rows = ref([]);

const formatRow = (data) => {
  return {
    ...data,
    content: [
      data.contact.name,
      data.urn,
      data.start
        ? `${moment(data.start).format('L')}  ${moment(data.start).format('HH:mm:ss')}`
        : '-',
    ],
  };
};

const getData = async () => {
  try {
    loading.value = true;

    const { pagination, contacts } = await Widget.getFlowContactResults({
      page: page.value,
      limit,
      result: props.flow.result,
      flow: props.flow.uuid,
      label: props.flowResultLabel,
    });

    dataCount.value = pagination.total_items;

    rows.value = contacts.map((item) => formatRow(item));
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
