<template>
  <section
    class="criterion-form"
    data-testid="criterion-form"
  >
    <div class="criterion-form__body">
      <UnnnicTextArea
        :modelValue="formText"
        :placeholder="
          $t(
            'conversations_dashboard.resolution_criteria.form.field_placeholder',
          )
        "
        class="criterion-form__textarea"
        data-testid="criterion-form-textarea"
        @update:model-value="setFormText"
      />

      <UnnnicButton
        type="secondary"
        size="large"
        class="criterion-form__validate-button"
        :text="$t('conversations_dashboard.resolution_criteria.form.validate')"
        :disabled="!canValidate"
        :loading="validationStatus === 'validating'"
        data-testid="criterion-form-validate-button"
        @click="validate"
      />

      <section
        v-if="showValidationResults"
        class="criterion-form__results"
        data-testid="criterion-form-validation-results"
      >
        <h3 class="criterion-form__results-title">
          {{
            $t('conversations_dashboard.resolution_criteria.form.results_title')
          }}
        </h3>

        <div
          v-if="validationStatus === 'validating'"
          class="criterion-form__validating"
          data-testid="criterion-form-validating"
        >
          <UnnnicIconLoading size="sm" />
          <p class="criterion-form__validating-text">
            {{
              $t('conversations_dashboard.resolution_criteria.form.validating')
            }}
          </p>
        </div>

        <template v-else-if="validationStatus === 'valid'">
          <UnnnicDisclaimer
            type="success"
            :title="
              $t(
                'conversations_dashboard.resolution_criteria.form.success_title',
              )
            "
            :description="
              $t(
                'conversations_dashboard.resolution_criteria.form.success_description',
              )
            "
            showTitle
            showDescription
            data-testid="criterion-form-success-disclaimer"
          />

          <ul
            v-if="validationRules.length > 0"
            class="criterion-form__rules"
            data-testid="criterion-form-success-rules"
          >
            <li
              v-for="(item, index) in validationRules"
              :key="`success-rule-${index}`"
              class="criterion-form__rule"
              :class="{
                'criterion-form__rule--valid': item.valid,
                'criterion-form__rule--invalid': !item.valid,
              }"
            >
              <p class="criterion-form__rule-text">{{ item.rule }}</p>
              <p class="criterion-form__rule-reason">{{ item.reason }}</p>
            </li>
          </ul>
        </template>

        <template v-else-if="validationStatus === 'invalid' && validationError">
          <UnnnicDisclaimer
            type="attention"
            :title="validationErrorTitle"
            :description="validationErrorDescription"
            showTitle
            showDescription
            data-testid="criterion-form-error-disclaimer"
          />

          <ul
            v-if="validationRules.length > 0"
            class="criterion-form__rules"
            data-testid="criterion-form-error-rules"
          >
            <li
              v-for="(item, index) in validationRules"
              :key="`error-rule-${index}`"
              class="criterion-form__rule"
              :class="{
                'criterion-form__rule--valid': item.valid,
                'criterion-form__rule--invalid': !item.valid,
              }"
            >
              <p class="criterion-form__rule-text">{{ item.rule }}</p>
              <p class="criterion-form__rule-reason">{{ item.reason }}</p>
            </li>
          </ul>
        </template>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { UnnnicDisclaimer } from '@weni/unnnic-system';

import { useResolutionCriteria } from '@/store/modules/conversational/resolutionCriteria';

const { t } = useI18n();
const store = useResolutionCriteria();

const {
  formText,
  validationStatus,
  validationError,
  validationRules,
  canValidate,
} = storeToRefs(store);

const { setFormText, validate } = store;

const showValidationResults = computed(
  () =>
    validationStatus.value === 'validating' ||
    validationStatus.value === 'valid' ||
    validationStatus.value === 'invalid',
);

const validationErrorTitle = computed(() =>
  t('conversations_dashboard.resolution_criteria.errors.invalid_title'),
);

const validationErrorDescription = computed(
  () => validationError.value?.message ?? '',
);
</script>

<style lang="scss" scoped>
.criterion-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  &__body {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__textarea {
    :deep(textarea) {
      min-height: 90px;
    }
  }

  &__validate-button {
    align-self: flex-start;
    width: fit-content;
  }

  &__results {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
    margin-top: $unnnic-space-4;
  }

  &__results-title {
    margin: 0;
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-3;
  }

  &__validating {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
  }

  &__validating-text {
    margin: 0;
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-body;
  }

  &__rules {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__rule {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
    padding: $unnnic-space-3;
    border-radius: $unnnic-radius-1;
    border: 1px solid $unnnic-color-gray-2;

    &--valid {
      border-color: $unnnic-color-border-success;
    }

    &--invalid {
      border-color: $unnnic-color-border-warning;
    }
  }

  &__rule-text {
    margin: 0;
    color: $unnnic-color-gray-12;
    font: $unnnic-font-emphasis;
  }

  &__rule-reason {
    margin: 0;
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-body;
  }
}
</style>
