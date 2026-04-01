<template>
  <section class="absolute-numbers-form">
    <section class="absolute-numbers-form__container">
      <p class="absolute-numbers-form__description">
        {{
          $t(
            'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.description',
          )
        }}
      </p>
      <UnnnicInput
        v-model="absoluteNumbersForm.name"
        :label="
          $t(
            'conversations_dashboard.customize_your_dashboard.label_widget_name',
          )
        "
        :placeholder="
          $t('conversations_dashboard.customize_your_dashboard.set_widget_name')
        "
      />
    </section>
    <hr class="absolute-numbers-form__divider" />
    <section
      v-for="(child, index) in absoluteNumbersForm.children"
      ref="absoluteNumbersFormChildren"
      :key="`absolute-numbers-form-child-${index}`"
    >
      <section
        :ref="`absolute-numbers-form-child-${child.uuid || 'new-child'}`"
        class="absolute-numbers-form__child-form"
      >
        <section class="absolute-numbers-form__child-form__container">
          <p class="absolute-numbers-form__child-form__title">
            {{ $t('metric') }}
          </p>
          <UnnnicIcon
            icon="delete"
            clickable
            size="ant"
            scheme="fg-emphasized"
            @click="handleDeleteChild(index)"
          />
        </section>
        <UnnnicInput
          v-model="child.name"
          :label="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.metric_name.label',
            )
          "
          :placeholder="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.metric_name.placeholder',
            )
          "
        />
        <UnnnicSelect
          v-model="child.config.agent_uuid"
          :data-testid="`absolute-numbers-agent-select-${index}`"
          :options="agentsTeam.agents"
          itemLabel="name"
          itemValue="uuid"
          enableSearch
          :search="searchAgent[index]"
          :label="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.select_agent.label',
            )
          "
          :placeholder="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.select_agent.placeholder',
            )
          "
          @update:search="searchAgent[index] = $event"
        />
        <UnnnicInput
          v-model="child.config.key"
          :label="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.key.label',
            )
          "
          :placeholder="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.key.placeholder',
            )
          "
          :message="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.key.hint',
            )
          "
        />
        <UnnnicInput
          v-model="child.config.value_field_name"
          :label="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.value_field_name.label',
            )
          "
          :placeholder="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.value_field_name.placeholder',
            )
          "
          :message="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.value_field_name.hint',
            )
          "
        />
        <UnnnicCheckbox
          v-model="child.config.currency.is_active"
          :data-testid="`absolute-numbers-currency-checkbox-${index}`"
          :label="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.currency.switch',
            )
          "
          @update:model-value="handleCurrencySwitch(index)"
        />
        <UnnnicSelect
          v-if="child.config.currency.is_active"
          v-model="child.config.currency.code"
          :options="currencies"
          optionsLines="4"
          itemLabel="label"
          itemValue="value"
        />
        <UnnnicSelect
          v-model="child.config.operation"
          :options="operations"
          itemLabel="label"
          itemValue="value"
          :label="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.operation.label',
            )
          "
          :placeholder="
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.operation.placeholder',
            )
          "
        />
      </section>
      <hr class="absolute-numbers-form__divider" />
    </section>
    <UnnnicButton
      data-testid="absolute-numbers-add-child"
      :text="
        $t(
          'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.add_child',
        )
      "
      type="secondary"
      :disabled="disabledAddChildButton"
      @click="handleAddChild"
    />
  </section>
  <RemoveMetricModal
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    :metric="removeMetric"
    :parentName="absoluteNumbersForm.name"
    @success="removeMetricForm(removeMetricIndex)"
  />
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  useTemplateRef,
} from 'vue';
import { storeToRefs } from 'pinia';

import RemoveMetricModal from '@/components/insights/widgets/conversational/ConversacionalAbsoluteNumbers/RemoveMetricModal.vue';

import { useProject } from '@/store/modules/project';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import type { absoluteNumbersFormChildren } from '@/store/modules/conversational/customWidgets';

import i18n from '@/utils/plugins/i18n';

defineOptions({ name: 'AbsoluteNumbersForm' });

const project = useProject();
const { agentsTeam } = storeToRefs(project);

const customWidgets = useCustomWidgets();
const { absoluteNumbersForm, absoluteNumbersFormChildToScroll } =
  storeToRefs(customWidgets);

const { t } = i18n.global;

onMounted(() => {
  if (absoluteNumbersForm.value.children.length === 0) {
    handleAddChild();
  }
  if (absoluteNumbersFormChildToScroll.value) {
    nextTick(() => {
      scrollToChild(absoluteNumbersFormChildToScroll.value);
    });
  }
});

onUnmounted(() => {
  absoluteNumbersForm.value = {
    widget_uuid: '',
    name: '',
    children: [],
  };
  absoluteNumbersFormChildToScroll.value = null;
});

const absoluteNumbersFormChildrenRefs = useTemplateRef<HTMLElement[]>(
  'absoluteNumbersFormChildren',
);

const scrollToChild = (key: string) => {
  let childIndex = -1;

  if (key === 'new-child') {
    childIndex = absoluteNumbersForm.value.children.length - 1;
  } else {
    childIndex = absoluteNumbersForm.value.children.findIndex(
      (child) => child.uuid === key,
    );
  }
  const child = absoluteNumbersFormChildrenRefs.value[childIndex];
  if (child) {
    child.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
};

const isRemoveWidgetModalOpen = ref<boolean>(false);
const removeMetric = ref<absoluteNumbersFormChildren | null>(null);
const removeMetricIndex = ref<number>(-1);
const searchAgent = ref<Record<number, string>>({});

watch(isRemoveWidgetModalOpen, (newValue) => {
  if (!newValue) {
    removeMetric.value = null;
    removeMetricIndex.value = -1;
  }
});

const currencies = computed(() => {
  return [
    { label: t('currency_options.BRL'), value: 'BRL' },
    { label: t('currency_options.USD'), value: 'USD' },
    { label: t('currency_options.EUR'), value: 'EUR' },
    { label: t('currency_options.ARS'), value: 'ARS' },
  ];
});

const handleCurrencySwitch = (index: number) => {
  if (absoluteNumbersForm.value.children[index].config.currency.is_active) {
    absoluteNumbersForm.value.children[index].config.currency.code = 'BRL';
  } else {
    absoluteNumbersForm.value.children[index].config.currency.code = '';
  }
};

const operations = computed(() => {
  return [
    {
      label: t(
        'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.operation.options.sum',
      ),
      value: 'SUM',
    },
    {
      label: t(
        'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.operation.options.average',
      ),
      value: 'AVERAGE',
    },
    {
      label: t(
        'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.operation.options.highest',
      ),
      value: 'HIGHEST',
    },
    {
      label: t(
        'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.operation.options.lowest',
      ),
      value: 'LOWEST',
    },
    {
      label: t(
        'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.operation.options.total',
      ),
      value: 'TOTAL',
    },
  ];
});

const handleAddChild = () => {
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
};

const handleDeleteChild = (index: number) => {
  const child = absoluteNumbersForm.value.children[index];
  if (child.uuid) {
    removeMetricIndex.value = index;
    removeMetric.value = child;
    isRemoveWidgetModalOpen.value = true;
  } else {
    removeMetricForm(index);
  }
};

const removeMetricForm = (index: number) => {
  absoluteNumbersForm.value.children.splice(index, 1);
};

const disabledAddChildButton = computed(() => {
  return absoluteNumbersForm.value.children?.length >= 6;
});
</script>

<style lang="scss" scoped>
.absolute-numbers-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-5;
  margin-bottom: $unnnic-space-2;

  &__container {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-3;
  }

  &__child-form {
    display: flex;
    flex-direction: column;
    padding: $unnnic-space-4;
    gap: $unnnic-space-4;
    border-radius: $unnnic-radius-2;
    border: 1px solid $unnnic-color-border-soft;

    &__container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    &__title {
      font: $unnnic-font-display-3;
      color: $unnnic-color-fg-emphasized;
    }
  }

  &__divider {
    background: $unnnic-color-neutral-light;
    height: 100%;
    border: 1px solid $unnnic-color-neutral-light;
  }
}
</style>
