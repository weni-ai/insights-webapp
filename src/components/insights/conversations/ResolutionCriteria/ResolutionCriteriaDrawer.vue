<template>
  <UnnnicDrawer
    v-if="isDrawerOpen"
    :modelValue="isDrawerOpen"
    :withoutOverlay="isRemoveModalOpen"
    :title="drawerTitle"
    :description="drawerDescription"
    class="resolution-criteria-drawer"
    closeIcon="close"
    size="lg"
    data-testid="resolution-criteria-drawer"
    :primaryButtonText="primaryButtonText"
    :disabledPrimaryButton="isPrimaryButtonDisabled"
    :loadingPrimaryButton="isPrimaryButtonLoading"
    @close="handleClose"
    @primary-button-click="handlePrimaryClick"
  >
    <template
      v-if="view === 'form'"
      #title
    >
      <div class="resolution-criteria-drawer__form-header">
        <UnnnicButton
          type="tertiary"
          size="large"
          iconCenter="arrow_left_alt"
          data-testid="resolution-criteria-back-button"
          @click="goToList"
        />
        <p class="resolution-criteria-drawer__form-title">
          {{ formTitle }}
        </p>
      </div>
    </template>

    <template #content>
      <CriteriaList
        v-if="view === 'list'"
        data-testid="resolution-criteria-list"
      />
      <CriterionForm
        v-else
        data-testid="resolution-criteria-form"
      />
    </template>
  </UnnnicDrawer>

  <RemoveCriterionModal />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import CriteriaList from './CriteriaList.vue';
import CriterionForm from './CriterionForm.vue';
import RemoveCriterionModal from './RemoveCriterionModal.vue';
import { useResolutionCriteria } from '@/store/modules/conversational/resolutionCriteria';

const { t } = useI18n();
const store = useResolutionCriteria();

const {
  isDrawerOpen,
  view,
  isLoadingList,
  isCreateMode,
  canAddCriterion,
  canSave,
  isSaving,
  isRemoveModalOpen,
} = storeToRefs(store);

const { goToList, goToCreate, closeDrawer, save } = store;

const drawerTitle = computed(() =>
  view.value === 'list'
    ? t('conversations_dashboard.resolution_criteria.list_title')
    : '',
);

const drawerDescription = computed(() =>
  view.value === 'list'
    ? t('conversations_dashboard.resolution_criteria.list_description')
    : '',
);

const formTitle = computed(() =>
  isCreateMode.value
    ? t('conversations_dashboard.resolution_criteria.form.create_title')
    : t('conversations_dashboard.resolution_criteria.form.edit_title'),
);

const primaryButtonText = computed(() => {
  if (view.value === 'list') {
    return t('conversations_dashboard.resolution_criteria.add_criterion');
  }

  return t('conversations_dashboard.resolution_criteria.form.save');
});

const isPrimaryButtonDisabled = computed(() =>
  view.value === 'list' ? !canAddCriterion.value : !canSave.value,
);

const isPrimaryButtonLoading = computed(() =>
  view.value === 'list' ? isLoadingList.value : isSaving.value,
);

const handleClose = () => {
  closeDrawer();
};

const handlePrimaryClick = () => {
  if (view.value === 'list') {
    goToCreate();
    return;
  }

  save();
};
</script>

<style lang="scss" scoped>
.resolution-criteria-drawer {
  :deep(.unnnic-drawer__container) {
    width: 662px;
    max-width: 100%;
  }

  &__form-header {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    width: 100%;
  }

  &__form-title {
    margin: 0;
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-2;
    font-weight: 600;
  }
}
</style>
