<template>
  <section
    class="criteria-list"
    data-testid="criteria-list"
  >
    <UnnnicIconLoading
      v-if="isLoadingList"
      class="criteria-list__loading"
      size="lg"
    />

    <template v-else>
      <section
        class="criteria-list__section"
        data-testid="base-criteria-section"
      >
        <header class="criteria-list__section-header">
          <h3 class="criteria-list__section-title">
            {{
              $t(
                'conversations_dashboard.resolution_criteria.base_section_title',
              )
            }}
          </h3>
          <p class="criteria-list__section-description">
            {{
              $t(
                'conversations_dashboard.resolution_criteria.base_section_description',
              )
            }}
          </p>
        </header>

        <ul class="criteria-list__rows">
          <li
            v-for="criterion in baseCriteria"
            :key="criterion.id"
            class="criteria-list__row criteria-list__row--readonly"
            data-testid="base-criterion-row"
          >
            <p class="criteria-list__row-text">{{ criterion.text }}</p>
          </li>
        </ul>
      </section>

      <section
        class="criteria-list__section"
        data-testid="custom-criteria-section"
      >
        <header class="criteria-list__section-header">
          <h3 class="criteria-list__section-title">
            {{
              $t(
                'conversations_dashboard.resolution_criteria.custom_section_title',
              )
            }}
          </h3>
          <p class="criteria-list__section-description">
            {{
              $t(
                'conversations_dashboard.resolution_criteria.custom_section_description',
                {
                  count: customCriteriaCount,
                  max: maxCustomCriteria,
                },
              )
            }}
          </p>
        </header>

        <p
          v-if="!customCriteria.length"
          class="criteria-list__empty"
          data-testid="custom-criteria-empty"
        >
          {{ $t('conversations_dashboard.resolution_criteria.custom_empty') }}
        </p>

        <ul
          v-else
          class="criteria-list__rows"
        >
          <li
            v-for="criterion in customCriteria"
            :key="criterion.id"
            class="criteria-list__row"
            data-testid="custom-criterion-row"
          >
            <p class="criteria-list__row-text">{{ criterion.text }}</p>

            <UnnnicPopover
              :open="openRowMenuId === criterion.id"
              @update:open="handleRowMenuToggle(criterion.id, $event)"
            >
              <UnnnicPopoverTrigger asChild>
                <UnnnicButton
                  type="tertiary"
                  size="large"
                  iconCenter="more_vert"
                  :pressed="openRowMenuId === criterion.id"
                  data-testid="custom-criterion-menu-button"
                />
              </UnnnicPopoverTrigger>
              <UnnnicPopoverContent size="small">
                <UnnnicPopoverOption
                  :label="
                    $t(
                      'conversations_dashboard.resolution_criteria.row_menu.edit',
                    )
                  "
                  icon="edit_square"
                  data-testid="custom-criterion-edit-option"
                  @click="handleEdit(criterion)"
                />
                <UnnnicPopoverOption
                  :label="
                    $t(
                      'conversations_dashboard.resolution_criteria.row_menu.delete',
                    )
                  "
                  icon="delete"
                  data-testid="custom-criterion-delete-option"
                  @click="handleDelete(criterion)"
                />
              </UnnnicPopoverContent>
            </UnnnicPopover>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import {
  MAX_CUSTOM_CRITERIA,
  type Criterion,
} from '@/services/api/resources/conversational/resolutionCriteria';
import { useResolutionCriteria } from '@/store/modules/conversational/resolutionCriteria';

const store = useResolutionCriteria();
const { baseCriteria, customCriteria, isLoadingList, customCriteriaCount } =
  storeToRefs(store);

const { goToEdit, openRemoveModal } = store;

const maxCustomCriteria = MAX_CUSTOM_CRITERIA;
const openRowMenuId = ref<string | null>(null);

const handleRowMenuToggle = (criterionId: string, isOpen: boolean) => {
  openRowMenuId.value = isOpen ? criterionId : null;
};

const closeRowMenu = () => {
  openRowMenuId.value = null;
};

const handleEdit = (criterion: Criterion) => {
  closeRowMenu();
  goToEdit(criterion);
};

const handleDelete = (criterion: Criterion) => {
  closeRowMenu();
  openRemoveModal(criterion);
};
</script>

<style lang="scss" scoped>
.criteria-list {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  &__loading {
    display: flex;
    justify-content: center;
    padding: $unnnic-space-8 0;
  }

  &__section {
    border-bottom: 1px solid $unnnic-color-gray-2;
  }

  &__section-header {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
    padding-bottom: $unnnic-space-4;
    border-bottom: 1px solid $unnnic-color-gray-2;
  }

  &__section-title {
    margin: 0;
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-3;
    font-weight: 600;
  }

  &__section-description {
    margin: 0;
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-caption-2;
  }

  &__rows {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    padding: $unnnic-space-3 0;
    border-bottom: 1px solid $unnnic-color-gray-2;

    &--readonly {
      min-height: 61px;
      padding: $unnnic-space-4 0;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  &__row-text {
    flex: 1;
    margin: 0;
    color: $unnnic-color-gray-12;
    font: $unnnic-font-body;
    word-break: break-word;
  }

  &__empty {
    margin: 0;
    padding: $unnnic-space-4 0;
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-body;
  }
}
</style>
