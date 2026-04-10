<template>
  <section
    class="vtex-conversions-form"
    data-testid="vtex-conversions-form"
  >
    <UnnnicInput
      v-model="widgetData.name"
      :label="
        $t(
          'drawers.config_gallery.options.vtex_conversions.form.input.name.label',
        )
      "
      :placeholder="
        $t(
          'drawers.config_gallery.options.vtex_conversions.form.input.name.placeholder',
        )
      "
    />
    <FormAccordion
      :title="
        $t(
          'drawers.config_gallery.options.vtex_conversions.form.define_meta_data',
        )
      "
      :active="activeAccordion.meta"
      :validConfig="validWabaConfig"
      @update:active="activeAccordion.meta = $event"
    >
      <template #content>
        <section class="vtex-conversions-form__meta">
          <fieldset>
            <UnnnicLabel
              :label="
                $t(
                  'drawers.config_gallery.options.vtex_conversions.form.input.waba.label',
                )
              "
            />
            <UnnnicSelect
              v-model="selectedWaba"
              :options="wabasOptions"
              itemLabel="label"
              itemValue="value"
            />
          </fieldset>
          <fieldset>
            <UnnnicLabel
              :label="
                $t(
                  'drawers.config_gallery.options.vtex_conversions.form.input.template.label',
                )
              "
            />
            <UnnnicSelect
              v-model="selectedTemplate"
              :options="templatesOptions"
              :disabled="!selectedWaba"
              enableSearch
              :search="templateSearchText"
              itemLabel="label"
              itemValue="value"
              @update:search="handleTemplateSearch"
            />
          </fieldset>
          <UnnnicButton
            class="clear-fields-btn"
            :text="$t('clear_fields')"
            type="tertiary"
            data-testid="reset-meta-fields-button"
            @click="resetMetaFields()"
          />
        </section>
      </template>
    </FormAccordion>
    <FormAccordion
      :title="
        $t(
          'drawers.config_gallery.options.vtex_conversions.form.define_vtex_data',
        )
      "
      :active="activeAccordion.vtex"
      :validConfig="!!widgetData.config.filter.utm_source.trim().length"
      @update:active="activeAccordion.vtex = $event"
    >
      <template #content>
        <section class="vtex-conversions-form__vtex">
          <UnnnicInput
            v-model="widgetData.config.filter.utm_source"
            :label="
              $t(
                'drawers.config_gallery.options.vtex_conversions.form.input.utm.label',
              )
            "
            :placeholder="
              $t(
                'drawers.config_gallery.options.vtex_conversions.form.input.utm.placeholder',
              )
            "
          />
          <UnnnicButton
            class="clear-fields-btn"
            :text="$t('clear_fields')"
            type="tertiary"
            data-testid="reset-vtex-fields-button"
            @click="widgetData.config.filter.utm_source = ''"
          />
        </section>
      </template>
    </FormAccordion>
    <UnnnicButton
      v-if="isEditing"
      class="clear-widget-btn"
      :text="$t('drawers.reset_widget')"
      type="tertiary"
      data-testid="reset-widget"
      @click="$emit('reset-widget')"
    />
  </section>
</template>

<script setup>
import { onMounted, ref, computed, nextTick, watch } from 'vue';

import { useConfig } from '@/store/modules/config';

import FormAccordion from '@/components/FormAccordion.vue';

import MetaTemplateMessageService from '@/services/api/resources/template/metaTemplateMessage';

import { removeDuplicatedItems } from '@/utils/array';
import i18n from '@/utils/plugins/i18n';

const configStore = useConfig();

const project_uuid = computed(() => configStore.project?.uuid);

const props = defineProps({ modelValue: { type: Object, required: true } });

const isEditing = computed(() => {
  return props.modelValue.type === 'vtex_conversions';
});

const emit = defineEmits([
  'update:modelValue',
  'update-disable-primary-button',
  'reset-widget',
]);

const activeAccordion = ref({
  meta: false,
  vtex: false,
});

const widgetData = ref({
  name: '',
  config: {
    filter: { waba_id: '', template_id: '', utm_source: '' },
    template_name: '',
  },
});

watch(
  widgetData,
  () => {
    const validConfig =
      !!widgetData.value.name &&
      !!widgetData.value.config.template_name.trim().length &&
      Object.values(widgetData.value.config.filter).every(
        (value) => !!value?.trim().length,
      );
    emit('update-disable-primary-button', !validConfig);
    emit('update:modelValue', widgetData.value);
  },
  { deep: true, immediate: true },
);

const resetMetaFields = () => {
  selectedWaba.value = '';
  selectedTemplate.value = '';
  templateSearchText.value = '';
  widgetData.value.config.filter.template_id = '';
  widgetData.value.config.filter.waba_id = '';
};

const wabas = ref([]);
const wabasOptions = computed(() => {
  const options = [
    {
      value: '',
      label: i18n.global.t(
        'drawers.config_gallery.options.vtex_conversions.form.input.waba.label',
      ),
    },
  ];

  wabas.value.forEach((waba) => {
    options.push({ label: waba.phone_number, value: waba.id });
  });

  return options;
});

const selectedWaba = ref('');

const getMetaWabas = async () => {
  const params = { project_uuid: project_uuid.value };
  const results = await MetaTemplateMessageService.listWabasId(params);

  wabas.value = results;

  if (results.length === 1) {
    selectedWaba.value = results[0].id;
  }
};
const isLoadingtemplates = ref(false);
const searchTextTemplate = ref('');
const templateSearchText = ref('');
const handleTemplateSearch = (value) => {
  templateSearchText.value = value;
  searchTextTemplate.value = value?.trim() || '';
};
const templates = ref([]);
const templatesOptions = computed(() => {
  const options = [
    {
      label: i18n.global.t(
        'drawers.config_gallery.options.vtex_conversions.form.input.template.label',
      ),
      value: '',
    },
  ];

  templates.value.forEach((template) => {
    options.push({ label: template.name, value: template.id });
  });

  return options;
});

const selectedTemplate = ref('');

watch(selectedTemplate, () => {
  const selectedTemplateId = selectedTemplate.value;
  if (!selectedTemplateId) return;
  const option = templatesOptions.value.find(
    (t) => t.value === selectedTemplateId,
  );
  widgetData.value.config.filter.template_id = selectedTemplateId;
  widgetData.value.config.template_name = option?.label || '';
});

const searchTemplate = async () => {
  try {
    isLoadingtemplates.value = true;
    const params = {
      limit: 20,
      waba_id: selectedWaba.value,
      project_uuid: project_uuid.value,
      fields: 'name,id',
      search: searchTextTemplate.value,
    };

    const response = await MetaTemplateMessageService.listTemplates(params);

    templates.value = removeDuplicatedItems(
      templates.value.concat(response.results),
      'id',
    );
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingtemplates.value = false;
  }
};

const validWabaConfig = computed(() => {
  return !!selectedTemplate.value && !!selectedWaba.value;
});

const searchTimeout = ref(0);

watch(searchTextTemplate, () => {
  if (!searchTextTemplate.value) return;
  if (searchTimeout.value !== 0) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => searchTemplate(), 500);
});

watch(selectedWaba, (newWaba, oldWaba) => {
  templates.value = [];
  if (newWaba) {
    widgetData.value.config.filter.waba_id = newWaba;

    if (oldWaba && newWaba !== oldWaba) {
      selectedTemplate.value = '';
      templateSearchText.value = '';
    }

    nextTick(() => {
      searchTemplate();
    });
  }
});

const handlerIsEditingWidgetData = () => {
  widgetData.value.name = props.modelValue.name;
  widgetData.value.config = {
    ...props.modelValue.config,
  };

  selectedWaba.value = props.modelValue.config.filter.waba_id || '';

  templates.value.push({
    name: props.modelValue.config.template_name,
    id: props.modelValue.config.filter.template_id,
  });

  selectedTemplate.value = props.modelValue.config.filter.template_id || '';
};

onMounted(async () => {
  await getMetaWabas();

  nextTick().then(() => {
    activeAccordion.value.meta = true;

    if (isEditing.value) handlerIsEditingWidgetData();
  });
});
</script>

<style lang="scss" scoped>
fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.vtex-conversions-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__meta {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__vtex {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }
}
</style>
