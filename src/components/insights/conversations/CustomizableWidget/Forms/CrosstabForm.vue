<!-- eslint-disable vue/no-v-html -->
<template>
  <section class="crosstab-form">
    <section class="crosstab-form__container">
      <p class="crosstab-form__description">
        {{
          $t(
            'conversations_dashboard.customize_your_dashboard.crosstab.drawer.description',
          )
        }}
      </p>
      <UnnnicInput
        v-model="crosstabForm.widget_name"
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

    <hr class="crosstab-form__divider" />

    <UnnnicDisclaimer class="crosstab-form__disclaimer">
      <template #description>
        <p
          v-html="
            $t(
              'conversations_dashboard.customize_your_dashboard.crosstab.drawer.disclaimer',
            )
          "
        />
      </template>
    </UnnnicDisclaimer>

    <!-- option1 -->
    <section class="crosstab-form__container">
      <p
        class="crosstab-form__description"
        v-html="
          $t(
            'conversations_dashboard.customize_your_dashboard.crosstab.drawer.first_data_label',
          )
        "
      />
      <UnnnicInput
        v-model="crosstabForm.key_a"
        :label="$t('key')"
        :placeholder="
          $t('conversations_dashboard.customize_your_dashboard.select_key')
        "
      />
      <UnnnicInput
        v-model="crosstabForm.field_name_a"
        :label="`${$t('field_name')} (${$t('optional').toLowerCase()})`"
        :placeholder="
          $t(
            'conversations_dashboard.customize_your_dashboard.enter_field_name',
          )
        "
      />
    </section>
    <!-- option2 -->
    <section class="crosstab-form__container">
      <p
        class="crosstab-form__description"
        v-html="
          $t(
            'conversations_dashboard.customize_your_dashboard.crosstab.drawer.second_data_label',
          )
        "
      />
      <UnnnicInput
        v-model="crosstabForm.key_b"
        :label="$t('key')"
        :placeholder="
          $t('conversations_dashboard.customize_your_dashboard.select_key')
        "
      />
      <UnnnicInput
        v-model="crosstabForm.field_name_b"
        :label="`${$t('field_name')} (${$t('optional').toLowerCase()})`"
        :placeholder="
          $t(
            'conversations_dashboard.customize_your_dashboard.enter_field_name',
          )
        "
      />
    </section>
  </section>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { onUnmounted } from 'vue';

const customWidgets = useCustomWidgets();
const { crosstabForm } = storeToRefs(customWidgets);

onUnmounted(() => {
  crosstabForm.value = {
    widget_uuid: '',
    widget_name: '',
    key_a: '',
    field_name_a: '',
    key_b: '',
    field_name_b: '',
  };
});
</script>

<style lang="scss" scoped>
:deep(.unnnic-form__label) {
  margin-top: 0;
  margin-bottom: $unnnic-space-1;
}
.crosstab-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-5;

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
  :deep(.crosstab-form__disclaimer) {
    .unnnic-disclaimer__icon {
      font-size: 15.17px;
      align-self: flex-start;
      padding: 3px $unnnic-space-05;
    }
  }
}
</style>
