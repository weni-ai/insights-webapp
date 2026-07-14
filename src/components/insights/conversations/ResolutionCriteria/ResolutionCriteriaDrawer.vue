<template>
  <UnnnicDrawerNext
    v-if="isDrawerOpen"
    :open="isDrawerOpen"
    @update:open="handleOpenChange"
  >
    <UnnnicDrawerContent
      class="resolution-criteria-drawer"
      size="large"
      :showOverlay="!isRemoveModalOpen"
      data-testid="resolution-criteria-drawer"
    >
      <UnnnicDrawerHeader>
        <template v-if="view === 'form'">
          <div class="resolution-criteria-drawer__form-header">
            <UnnnicButton
              type="tertiary"
              size="large"
              iconCenter="arrow-left-1-1"
              data-testid="resolution-criteria-back-button"
              @click="goToList"
            />
            <p class="resolution-criteria-drawer__form-title">
              {{ formTitle }}
            </p>
          </div>
        </template>
        <template v-else>
          <UnnnicDrawerTitle>
            {{ drawerTitle }}
          </UnnnicDrawerTitle>
          <UnnnicDrawerDescription v-if="drawerDescription">
            {{ drawerDescription }}
          </UnnnicDrawerDescription>
        </template>
      </UnnnicDrawerHeader>

      <section class="resolution-criteria-drawer__body">
        <CriteriaList
          v-if="view === 'list'"
          data-testid="resolution-criteria-list"
        />
        <CriterionForm
          v-else
          data-testid="resolution-criteria-form"
        />
      </section>

      <UnnnicDrawerFooter>
        <UnnnicButton
          type="primary"
          size="large"
          :text="primaryButtonText"
          :disabled="isPrimaryButtonDisabled"
          :loading="isPrimaryButtonLoading"
          data-testid="drawer-primary-button"
          @click="handlePrimaryClick"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>

  <RemoveCriterionModal />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import {
  UnnnicDrawerNext,
  UnnnicDrawerContent,
  UnnnicDrawerHeader,
  UnnnicDrawerTitle,
  UnnnicDrawerDescription,
  UnnnicDrawerFooter,
} from '@weni/unnnic-system';

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

const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeDrawer();
  }
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
  &__body {
    overflow-y: auto;
    flex: 1 0 0;
    padding: $unnnic-space-6 $unnnic-space-6 0;
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
  }
}
.resolution-criteria-drawer.unnnic-drawer__content {
  .unnnic-drawer__footer {
    justify-content: flex-end;

    > * {
      flex-grow: 0;
      width: auto;
    }
  }
}
</style>
