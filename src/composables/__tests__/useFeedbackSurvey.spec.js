import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFeedbackSurvey } from '../useFeedbackSurvey';

const mockCheckSurvey = vi.fn();

vi.mock('@/services/api/resources/conversational/feedback', () => ({
  default: { checkSurvey: (...args) => mockCheckSurvey(...args) },
}));

const activeSurvey = {
  uuid: 'survey-1',
  is_active: true,
  user_answered: false,
};

describe('useFeedbackSurvey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkSurvey', () => {
    it('should show modal when survey is active and user has not answered', async () => {
      mockCheckSurvey.mockResolvedValue(activeSurvey);

      const { shouldShowModal, surveyUuid, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(true);
      expect(surveyUuid.value).toBe('survey-1');
    });

    it('should not show modal when survey is inactive', async () => {
      mockCheckSurvey.mockResolvedValue({
        ...activeSurvey,
        is_active: false,
      });

      const { shouldShowModal, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(false);
    });

    it('should not show modal when user already answered', async () => {
      mockCheckSurvey.mockResolvedValue({
        ...activeSurvey,
        user_answered: true,
      });

      const { shouldShowModal, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(false);
    });

    it('should not show modal when API call fails', async () => {
      mockCheckSurvey.mockRejectedValue(new Error('fail'));

      const { shouldShowModal, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(false);
    });
  });

  describe('onPostpone', () => {
    it('should hide modal', () => {
      const { shouldShowModal, onPostpone } = useFeedbackSurvey();
      shouldShowModal.value = true;

      onPostpone();

      expect(shouldShowModal.value).toBe(false);
    });
  });

  describe('onSubmitted', () => {
    it('should hide modal', () => {
      const { shouldShowModal, onSubmitted } = useFeedbackSurvey();
      shouldShowModal.value = true;

      onSubmitted();

      expect(shouldShowModal.value).toBe(false);
    });
  });
});
