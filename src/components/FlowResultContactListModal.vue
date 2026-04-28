<template>
  <UnnnicDialog
    :open="open"
    data-testid="contact-list-modal"
    @update:open="handleUpdateOpen"
  >
    <UnnnicDialogContent size="large">
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ $t('contact_list_modal.title', { label: props.flowResultLabel }) }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>
      <section class="flow-result-contact-list-modal__content">
        <UnnnicTableNext
          :locale="i18n.global.locale"
          :headers="tableHeaders"
          :pagination="page"
          :paginationInterval="limit"
          :paginationTotal="dataCount"
          :isLoading="loading"
          :rows="rows"
          data-testid="contact-list-table"
          @update:pagination="page = $event"
        />
      </section>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import i18n from '@/utils/plugins/i18n';

import Widget from '@/services/api/resources/widgets';
import moment from 'moment';
import { UnnnicCallAlert } from '@weni/unnnic-system';

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

const open = ref(true);

const handleUpdateOpen = (value) => {
  open.value = value;
  if (!value) {
    emit('close');
  }
};

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
    UnnnicCallAlert({
      props: {
        text: i18n.global.t('contact_list_modal.message.get_data_fail'),
        type: 'error',
      },
    });
    console.error(error);
    emit('close');
  } finally {
    loading.value = false;
  }
};

onMounted(getData);
watch(page, getData);
</script>

<style lang="scss" scoped>
.flow-result-contact-list-modal {
  &__content {
    padding: $unnnic-space-6;
  }
}
</style>
