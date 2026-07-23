import { defineStore } from 'pinia';
import i18n from '@/utils/plugins/i18n';
import { UnnnicCallAlert } from '@weni/unnnic-system';
import resolutionCriteriaService, {
  parseCriterionError,
  type Criterion,
  type ValidationRule,
  MAX_CUSTOM_CRITERIA,
} from '@/services/api/resources/conversational/resolutionCriteria';

import { registerStoreHMR } from '@/utils/hmr';

export type ResolutionCriteriaView = 'list' | 'form';
export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface ValidationError {
  code: string;
  message: string;
}

export interface ResolutionCriteriaState {
  isDrawerOpen: boolean;
  view: ResolutionCriteriaView;
  baseCriteria: Criterion[];
  customCriteria: Criterion[];
  isLoadingList: boolean;
  editingCriterion: Criterion | null;
  formText: string;
  validationStatus: ValidationStatus;
  validationError: ValidationError | null;
  validationRules: ValidationRule[];
  lastValidatedText: string | null;
  isSaving: boolean;
  removeTarget: Criterion | null;
  isRemoving: boolean;
}

const initialFormState = () => ({
  editingCriterion: null as Criterion | null,
  formText: '',
  validationStatus: 'idle' as ValidationStatus,
  validationError: null as ValidationError | null,
  validationRules: [] as ValidationRule[],
  lastValidatedText: null as string | null,
  isSaving: false,
});

function showToast(type: 'success' | 'error', text: string) {
  UnnnicCallAlert({
    props: { text, type },
    containerRef: null,
  });
}

export const useResolutionCriteria = defineStore('resolutionCriteria', {
  state: (): ResolutionCriteriaState => ({
    isDrawerOpen: false,
    view: 'list',
    baseCriteria: [],
    customCriteria: [],
    isLoadingList: false,
    ...initialFormState(),
    removeTarget: null,
    isRemoving: false,
  }),

  getters: {
    isCreateMode: (state) => !state.editingCriterion,
    canValidate: (state) =>
      state.formText.trim().length > 0 &&
      state.formText !== state.lastValidatedText,
    canSave: (state) =>
      state.validationStatus === 'valid' &&
      state.formText === state.lastValidatedText,
    isRemoveModalOpen: (state) => state.removeTarget !== null,
    canAddCriterion: (state) =>
      state.customCriteria.length < MAX_CUSTOM_CRITERIA,
    customCriteriaCount: (state) => state.customCriteria.length,
  },

  actions: {
    openDrawer() {
      this.isDrawerOpen = true;
      this.view = 'list';
      this.resetFormState();
      this.loadCriteria();
    },

    closeDrawer() {
      this.isDrawerOpen = false;
      this.view = 'list';
      this.resetFormState();
      this.removeTarget = null;
    },

    resetFormState() {
      Object.assign(this, initialFormState());
    },

    goToList() {
      this.view = 'list';
      this.resetFormState();
    },

    goToCreate() {
      if (!this.canAddCriterion) return;
      this.view = 'form';
      this.resetFormState();
    },

    goToEdit(criterion: Criterion) {
      this.view = 'form';
      this.editingCriterion = criterion;
      this.formText = criterion.text;
      this.validationStatus = 'idle';
      this.validationError = null;
      this.validationRules = [];
      this.lastValidatedText = null;
    },

    setFormText(text: string) {
      this.formText = text;
      if (text !== this.lastValidatedText) {
        this.validationStatus = 'idle';
        this.validationError = null;
        this.validationRules = [];
      }
    },

    async loadCriteria() {
      this.isLoadingList = true;
      try {
        const response =
          await resolutionCriteriaService.getResolutionCriteria();
        this.baseCriteria = response.base_criteria ?? [];
        this.customCriteria = response.custom_criteria ?? [];
      } catch (error) {
        console.error('Error loading resolution criteria:', error);
        showToast(
          'error',
          i18n.global.t(
            'conversations_dashboard.resolution_criteria.toast.load_error',
          ),
        );
      } finally {
        this.isLoadingList = false;
      }
    },

    async validate() {
      if (!this.canValidate) return;

      this.validationStatus = 'validating';
      this.validationError = null;
      this.validationRules = [];

      try {
        const response = await resolutionCriteriaService.validateCriterion({
          text: this.formText.trim(),
          criterionId: this.editingCriterion?.id ?? null,
        });
        this.validationStatus = 'valid';
        this.lastValidatedText = this.formText;
        this.validationError = null;
        this.validationRules = response.validation.rules ?? [];
      } catch (error) {
        const parsed = parseCriterionError(error);

        if (parsed.status === 400) {
          this.lastValidatedText = this.formText;
          this.validationStatus = 'invalid';
          this.validationError = {
            code: parsed.code,
            message: parsed.message,
          };
          this.validationRules = parsed.rules;
        } else {
          this.validationStatus = 'idle';
          showToast(
            'error',
            i18n.global.t(
              'conversations_dashboard.resolution_criteria.errors.technical',
            ),
          );
        }
      }
    },

    async save() {
      if (!this.canSave || this.isSaving) return;

      this.isSaving = true;
      const trimmedText = this.formText.trim();

      try {
        if (this.isCreateMode) {
          await resolutionCriteriaService.createCriterion({
            text: trimmedText,
          });
          showToast(
            'success',
            i18n.global.t(
              'conversations_dashboard.resolution_criteria.toast.added',
            ),
          );
        } else if (this.editingCriterion) {
          await resolutionCriteriaService.updateCriterion(
            this.editingCriterion.id,
            { text: trimmedText },
          );
          showToast(
            'success',
            i18n.global.t(
              'conversations_dashboard.resolution_criteria.toast.updated',
            ),
          );
        }

        await this.loadCriteria();
        this.goToList();
      } catch (error) {
        const parsed = parseCriterionError(error);
        const errorTitleKey = this.getErrorTitleKey(parsed.code);
        const translated = i18n.global.t(errorTitleKey);
        const text = translated !== errorTitleKey ? translated : parsed.message;

        showToast('error', text);
      } finally {
        this.isSaving = false;
      }
    },

    openRemoveModal(criterion: Criterion) {
      this.removeTarget = criterion;
    },

    closeRemoveModal() {
      this.removeTarget = null;
    },

    getErrorTitleKey(code: string): string {
      if (code === 'INVALID_CRITERION') {
        return 'conversations_dashboard.resolution_criteria.errors.invalid_title';
      }

      return 'conversations_dashboard.resolution_criteria.errors.technical';
    },

    async confirmRemove() {
      if (!this.removeTarget || this.isRemoving) return;

      this.isRemoving = true;
      const criterionId = this.removeTarget.id;

      try {
        await resolutionCriteriaService.deleteCriterion(criterionId);
        showToast(
          'success',
          i18n.global.t(
            'conversations_dashboard.resolution_criteria.toast.deleted',
          ),
        );
        this.closeRemoveModal();
        await this.loadCriteria();
      } catch (error) {
        console.error('Error deleting criterion:', error);
        showToast(
          'error',
          i18n.global.t(
            'conversations_dashboard.resolution_criteria.toast.delete_error',
          ),
        );
      } finally {
        this.isRemoving = false;
      }
    },
  },
});

registerStoreHMR(useResolutionCriteria, import.meta.webpackHot);
