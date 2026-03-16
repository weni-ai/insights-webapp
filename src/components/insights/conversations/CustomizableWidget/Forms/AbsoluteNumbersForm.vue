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
    <template
      v-for="(child, index) in absoluteNumbersForm.children"
      :key="`absolute-numbers-form-child-${index}`"
    >
      <section class="absolute-numbers-form__container">
        <p class="absolute-numbers-form__description">
          {{
            $t(
              'conversations_dashboard.customize_your_dashboard.absolute_numbers.drawer.child_description',
            )
          }}
        </p>
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
    </template>
    <UnnnicButton
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
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useProject } from '@/store/modules/project';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';

import i18n from '@/utils/plugins/i18n';

defineOptions({ name: 'AbsoluteNumbersForm' });

const project = useProject();
const { agentsTeam } = storeToRefs(project);

const customWidgets = useCustomWidgets();
const { absoluteNumbersForm } = storeToRefs(customWidgets);

const { t } = i18n.global;

onMounted(() => {
  if (absoluteNumbersForm.value.children.length === 0) {
    handleAddChild();
  }
});

onUnmounted(() => {
  absoluteNumbersForm.value = {
    widget_uuid: '',
    name: '',
    children: [],
  };
});

const searchAgent = ref<Record<number, string>>({});

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

  &__description {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__divider {
    background: $unnnic-color-neutral-light;
    height: 100%;
    border: 1px solid $unnnic-color-neutral-light;
  }
}
</style>
