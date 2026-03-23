<template>
  <UnnnicSkeletonLoading
    v-if="isLoadingChildren"
    data-testid="conversational-absolute-numbers-skeleton"
    :width="`100%`"
    height="100%"
  />
  <CardWidgetContainer
    v-else
    data-testid="conversational-absolute-numbers-card"
    hiddenTabs
    :title="widget?.name"
    :actions="actions"
    class="conversational-absolute-numbers"
  >
    <template #header-title>
      <p
        class="conversational-absolute-numbers__title"
        data-testid="conversational-absolute-numbers-title"
      >
        {{ widget?.name }}
      </p>
    </template>

    <section
      class="conversational-absolute-numbers__content"
      data-testid="conversational-absolute-numbers-content"
    >
      <AbsoluteNumbersMetric
        v-for="child in orderedChildren"
        :key="child.uuid"
        :metric="child"
        :parentName="widget?.name"
        @edit="handleOpenEditDrawer({ scrollToChild: child.uuid })"
      />
      <NewMetric
        v-if="children.length < 6"
        @click="
          handleOpenEditDrawer({
            addNewChild: true,
            scrollToChild: 'new-child',
          })
        "
      />
    </section>
  </CardWidgetContainer>
  <ModalRemoveWidget
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    data-testid="conversational-absolute-numbers-remove-modal"
    class="modal-remove-widget"
    type="absolute_numbers"
    size="md"
    :uuid="widget?.uuid"
  >
    <template #description>
      <section class="modal-remove-widget__description">
        <p class="modal-remove-widget__description__title">
          {{
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.remove_modal.description',
              { widget_name: widget?.name },
            )
          }}
        </p>
        <p class="modal-remove-widget__description__info">
          {{
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.remove_modal.info',
              { widget_name: widget?.name },
            )
          }}
        </p>
      </section>
    </template>
  </ModalRemoveWidget>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { cloneDeep } from 'lodash-es';

import CardWidgetContainer from '@/components/insights/widgets/layout/CardWidgetContainer.vue';
import AbsoluteNumbersMetric from './AbsoluteNumbersMetric.vue';
import NewMetric from './NewMetric.vue';
import ModalRemoveWidget from '@/components/insights/conversations/CustomizableWidget/ModalRemoveWidget.vue';

import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';

import i18n from '@/utils/plugins/i18n';

import WidgetService, {
  AbsoluteNumbersChildrenItem,
} from '@/services/api/resources/conversational/widgets';

defineOptions({
  name: 'ConversationalAbsoluteNumbers',
});

const { t } = i18n.global;

const props = defineProps<{
  uuid: string;
}>();

onMounted(async () => {
  await loadChildren();
});

const customWidgetsStore = useCustomWidgets();
const { getCustomWidgetByUuid } = customWidgetsStore;
const { absoluteNumbersForm, absoluteNumbersFormChildToScroll } =
  storeToRefs(customWidgetsStore);

const conversational = useConversational();
const { setIsDrawerCustomizableOpen } = conversational;

const widget = computed(() => {
  return getCustomWidgetByUuid(props.uuid);
});

const isLoadingChildren = ref<boolean>(false);
const children = ref<AbsoluteNumbersChildrenItem[]>([]);

const orderedChildren = computed(() => {
  return children.value
    .slice(0)
    .sort((a, b) => a.config.index - b.config.index);
});

const loadChildren = async () => {
  try {
    isLoadingChildren.value = true;
    const response = await WidgetService.getAbsoluteNumbersChildren(props.uuid);
    children.value = response.results;
  } catch (error) {
    console.error('Error loading children', error);
  } finally {
    isLoadingChildren.value = false;
  }
};

const isRemoveWidgetModalOpen = ref<boolean>(false);
const actions = computed(() => {
  const editOption = {
    icon: 'edit_square',
    text: t('edit_widget'),
    onClick: () => handleOpenEditDrawer(),
  };

  const deleteOption = {
    icon: 'delete',
    text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  };

  return [editOption, deleteOption];
});

interface HandleOpenEditDrawerProps {
  addNewChild?: boolean;
  scrollToChild?: string;
}
const handleOpenEditDrawer = (
  { addNewChild = false, scrollToChild = '' }: HandleOpenEditDrawerProps = {
    addNewChild: false,
    scrollToChild: '',
  },
) => {
  absoluteNumbersForm.value = {
    widget_uuid: widget.value?.uuid,
    name: widget.value?.name,
    children: cloneDeep(children.value),
  };
  if (addNewChild) {
    absoluteNumbersForm.value.children.push({
      name: '',
      parent: '',
      config: {
        index: absoluteNumbersForm.value.children.length + 1,
        agent_uuid: '',
        key: '',
        operation: '',
        value_field_name: '',
        currency: {
          is_active: false,
          code: null,
        },
      },
    });
  }
  if (scrollToChild) {
    absoluteNumbersFormChildToScroll.value = scrollToChild;
  }
  setIsDrawerCustomizableOpen(true, 'absolute_numbers', false);
};
</script>

<style lang="scss" scoped>
.conversational-absolute-numbers {
  &__title {
    font: $unnnic-font-display-2;
    color: $unnnic-color-fg-emphasized;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 500px;
    margin-right: $unnnic-space-2;
  }

  &__content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: $unnnic-space-6;
    flex: 1;
  }
}
.modal-remove-widget {
  &__description {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }
}
</style>
