import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFeedbackSurvey } from '../useFeedbackSurvey';
import { moduleStorage } from '@/utils/storage';

const STORAGE_KEY = 'data_feedback_state';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

const mockCheckSurvey = vi.fn();

vi.mock('@/services/api/resources/conversational/feedback', () => ({
  default: { checkSurvey: (...args) => mockCheckSurvey(...args) },
}));

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn((_key, defaultVal) => defaultVal ?? null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const activeSurvey = {
  uuid: 'survey-1',
  is_active: true,
  user_answered: false,
};

const today = () => new Date().toISOString().slice(0, 10);

describe('useFeedbackSurvey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    moduleStorage.getItem.mockImplementation(
      (_key, defaultVal) => defaultVal ?? null,
    );
  });

  describe('checkSurvey', () => {
    it('should show modal when survey is active and no postpone state', async () => {
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

    it('should not show modal when postponed twice today', async () => {
      mockCheckSurvey.mockResolvedValue(activeSurvey);
      moduleStorage.getItem.mockReturnValue({
        lastPostponedDate: today(),
        postponeCountToday: 2,
        firstShownTodayAt: new Date(
          Date.now() - TWO_HOURS_MS - 1,
        ).toISOString(),
        lastPostponedAt: new Date().toISOString(),
      });

      const { shouldShowModal, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(false);
    });

    it('should not show modal when less than 2h since first shown today', async () => {
      mockCheckSurvey.mockResolvedValue(activeSurvey);
      moduleStorage.getItem.mockReturnValue({
        lastPostponedDate: today(),
        postponeCountToday: 1,
        firstShownTodayAt: new Date().toISOString(),
        lastPostponedAt: new Date().toISOString(),
      });

      const { shouldShowModal, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(false);
    });

    it('should show modal when 2h+ elapsed and postpone count < 2', async () => {
      mockCheckSurvey.mockResolvedValue(activeSurvey);
      moduleStorage.getItem.mockReturnValue({
        lastPostponedDate: today(),
        postponeCountToday: 1,
        firstShownTodayAt: new Date(
          Date.now() - TWO_HOURS_MS - 1,
        ).toISOString(),
        lastPostponedAt: new Date().toISOString(),
      });

      const { shouldShowModal, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(true);
    });

    it('should reset state and show when lastPostponedDate is a different day', async () => {
      mockCheckSurvey.mockResolvedValue(activeSurvey);
      moduleStorage.getItem.mockReturnValue({
        lastPostponedDate: '2020-01-01',
        postponeCountToday: 2,
        firstShownTodayAt: null,
        lastPostponedAt: null,
      });

      const { shouldShowModal, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(true);
      expect(moduleStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.objectContaining({ postponeCountToday: 0 }),
      );
    });

    it('should not show modal when API call fails', async () => {
      mockCheckSurvey.mockRejectedValue(new Error('fail'));

      const { shouldShowModal, checkSurvey } = useFeedbackSurvey();
      await checkSurvey();

      expect(shouldShowModal.value).toBe(false);
    });
  });

  describe('onPostpone', () => {
    it('should hide modal and write postpone state for new day', () => {
      moduleStorage.getItem.mockReturnValue({
        lastPostponedDate: '2020-01-01',
        postponeCountToday: 5,
        firstShownTodayAt: null,
        lastPostponedAt: null,
      });

      const { shouldShowModal, onPostpone } = useFeedbackSurvey();
      shouldShowModal.value = true;

      onPostpone();

      expect(shouldShowModal.value).toBe(false);
      expect(moduleStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.objectContaining({
          postponeCountToday: 1,
          lastPostponedDate: today(),
        }),
      );
    });

    it('should increment postpone count for same day', () => {
      moduleStorage.getItem.mockReturnValue({
        lastPostponedDate: today(),
        postponeCountToday: 1,
        firstShownTodayAt: new Date().toISOString(),
        lastPostponedAt: null,
      });

      const { onPostpone } = useFeedbackSurvey();
      onPostpone();

      expect(moduleStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.objectContaining({ postponeCountToday: 2 }),
      );
    });

    it('should preserve existing firstShownTodayAt', () => {
      const existingTime = '2026-01-01T10:00:00.000Z';
      moduleStorage.getItem.mockReturnValue({
        lastPostponedDate: today(),
        postponeCountToday: 0,
        firstShownTodayAt: existingTime,
        lastPostponedAt: null,
      });

      const { onPostpone } = useFeedbackSurvey();
      onPostpone();

      expect(moduleStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.objectContaining({ firstShownTodayAt: existingTime }),
      );
    });
  });

  describe('onSubmitted', () => {
    it('should hide modal and remove storage', () => {
      const { shouldShowModal, onSubmitted } = useFeedbackSurvey();
      shouldShowModal.value = true;

      onSubmitted();

      expect(shouldShowModal.value).toBe(false);
      expect(moduleStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });
});
