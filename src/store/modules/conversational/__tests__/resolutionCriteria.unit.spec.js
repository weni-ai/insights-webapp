import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/services/api/resources/conversational/resolutionCriteria', () => ({
  default: {
    getResolutionCriteria: vi.fn(),
    validateCriterion: vi.fn(),
    createCriterion: vi.fn(),
    updateCriterion: vi.fn(),
    deleteCriterion: vi.fn(),
  },
  parseCriterionError: vi.fn((error) => ({
    status: error?.status ?? 500,
    code: error?.data?.error?.code ?? 'LAMBDA_VALIDATION_FAILED',
    message:
      error?.data?.error?.message ??
      'The criterion could not be validated due to a technical issue',
    rules: error?.data?.error?.rules ?? [],
  })),
  MAX_CUSTOM_CRITERIA: 10,
}));

vi.mock('@weni/unnnic-system', () => ({
  UnnnicCallAlert: vi.fn(),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => key),
    },
  },
}));

import { useResolutionCriteria } from '../resolutionCriteria';
import resolutionCriteriaService from '@/services/api/resources/conversational/resolutionCriteria';
import { UnnnicCallAlert } from '@weni/unnnic-system';

describe('useResolutionCriteria store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useResolutionCriteria();
    vi.clearAllMocks();
  });

  it('has correct initial state', () => {
    expect(store.isDrawerOpen).toBe(false);
    expect(store.view).toBe('list');
    expect(store.baseCriteria).toEqual([]);
    expect(store.customCriteria).toEqual([]);
    expect(store.validationStatus).toBe('idle');
  });

  describe('validation state machine', () => {
    it('enables validate when text is non-empty and not yet validated', () => {
      store.formText = 'New criterion';
      expect(store.canValidate).toBe(true);
      expect(store.canSave).toBe(false);
    });

    it('disables validate after text was submitted for validation', () => {
      store.formText = 'New criterion';
      store.lastValidatedText = 'New criterion';
      expect(store.canValidate).toBe(false);
    });

    it('enables save only after successful validation with matching text', () => {
      store.formText = 'New criterion';
      store.validationStatus = 'valid';
      store.lastValidatedText = 'New criterion';
      expect(store.canSave).toBe(true);
    });

    it('resets validation when text changes after validation', () => {
      store.formText = 'Validated text';
      store.validationStatus = 'valid';
      store.lastValidatedText = 'Validated text';
      store.setFormText('Changed text');

      expect(store.validationStatus).toBe('idle');
      expect(store.canSave).toBe(false);
      expect(store.canValidate).toBe(true);
    });
  });

  describe('validate', () => {
    it('sets valid state on success', async () => {
      store.formText = 'Criterion text';
      resolutionCriteriaService.validateCriterion.mockResolvedValueOnce({
        validation: {
          status: true,
          message: 'Criterion validated successfully',
          rules: [
            {
              rule: 'Mark as resolved when...',
              valid: true,
              reason: 'Valid domain-specific rule.',
            },
          ],
        },
      });

      await store.validate();

      expect(store.validationStatus).toBe('valid');
      expect(store.lastValidatedText).toBe('Criterion text');
      expect(store.validationRules).toEqual([
        {
          rule: 'Mark as resolved when...',
          valid: true,
          reason: 'Valid domain-specific rule.',
        },
      ]);
      expect(store.canSave).toBe(true);
    });

    it('sets invalid state on 400 response', async () => {
      store.formText = 'Invalid text';
      resolutionCriteriaService.validateCriterion.mockRejectedValueOnce({
        status: 400,
        data: {
          error: {
            code: 'INVALID_CRITERION',
            message: 'Directly overrides the base criteria...',
            rules: [
              {
                rule: 'Always mark as resolved...',
                valid: false,
                reason: 'Directly overrides the base criteria...',
              },
            ],
          },
        },
      });

      await store.validate();

      expect(store.validationStatus).toBe('invalid');
      expect(store.validationError).toEqual({
        code: 'INVALID_CRITERION',
        message: 'Directly overrides the base criteria...',
      });
      expect(store.validationRules).toEqual([
        {
          rule: 'Always mark as resolved...',
          valid: false,
          reason: 'Directly overrides the base criteria...',
        },
      ]);
      expect(store.canSave).toBe(false);
    });

    it('shows technical toast on 502 response', async () => {
      store.formText = 'Criterion text';
      resolutionCriteriaService.validateCriterion.mockRejectedValueOnce({
        status: 502,
        data: {
          error: {
            code: 'LAMBDA_VALIDATION_FAILED',
            message: 'Technical issue',
          },
        },
      });

      await store.validate();

      expect(store.validationStatus).toBe('idle');
      expect(store.lastValidatedText).toBeNull();
      expect(store.canValidate).toBe(true);
      expect(UnnnicCallAlert).toHaveBeenCalled();
      expect(store.canSave).toBe(false);
    });
  });

  describe('save', () => {
    it('creates criterion and returns to list on success', async () => {
      store.formText = 'New criterion';
      store.validationStatus = 'valid';
      store.lastValidatedText = 'New criterion';
      resolutionCriteriaService.createCriterion.mockResolvedValueOnce({
        id: 'new-id',
        text: 'New criterion',
      });
      resolutionCriteriaService.getResolutionCriteria.mockResolvedValueOnce({
        base_criteria: [],
        custom_criteria: [{ id: 'new-id', text: 'New criterion' }],
      });

      await store.save();

      expect(resolutionCriteriaService.createCriterion).toHaveBeenCalledWith({
        text: 'New criterion',
      });
      expect(store.view).toBe('list');
      expect(UnnnicCallAlert).toHaveBeenCalled();
    });
  });

  describe('confirmRemove', () => {
    it('deletes criterion and reloads list', async () => {
      store.removeTarget = { id: 'criterion-id', text: 'To delete' };
      resolutionCriteriaService.deleteCriterion.mockResolvedValueOnce({
        success: true,
      });
      resolutionCriteriaService.getResolutionCriteria.mockResolvedValueOnce({
        base_criteria: [],
        custom_criteria: [],
      });

      await store.confirmRemove();

      expect(resolutionCriteriaService.deleteCriterion).toHaveBeenCalledWith(
        'criterion-id',
      );
      expect(store.removeTarget).toBeNull();
      expect(UnnnicCallAlert).toHaveBeenCalled();
    });
  });
});
