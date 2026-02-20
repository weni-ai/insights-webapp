import { ref } from 'vue';
import feedbackApi from '@/services/api/resources/conversational/feedback';
import { moduleStorage } from '@/utils/storage';

const STORAGE_KEY = 'data_feedback_state';
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

interface FeedbackStorageState {
  lastPostponedAt: string | null;
  postponeCountToday: number;
  firstShownTodayAt: string | null;
  lastPostponedDate: string | null;
}

function getDefaultState(): FeedbackStorageState {
  return {
    lastPostponedAt: null,
    postponeCountToday: 0,
    firstShownTodayAt: null,
    lastPostponedDate: null,
  };
}

function readState(): FeedbackStorageState {
  return moduleStorage.getItem(STORAGE_KEY, getDefaultState());
}

function writeState(state: FeedbackStorageState): void {
  moduleStorage.setItem(STORAGE_KEY, state);
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function canShowBasedOnPostpone(state: FeedbackStorageState): boolean {
  const today = getTodayDate();

  if (state.lastPostponedDate !== today) {
    return true;
  }

  if (state.postponeCountToday >= 2) {
    return false;
  }

  if (state.firstShownTodayAt) {
    const elapsed = Date.now() - new Date(state.firstShownTodayAt).getTime();
    if (elapsed < TWO_HOURS_MS) {
      return false;
    }
  }

  return true;
}

export function useFeedbackSurvey() {
  const shouldShowModal = ref(false);
  const surveyUuid = ref('');

  async function checkSurvey(): Promise<void> {
    try {
      const response = await feedbackApi.checkSurvey();

      if (!response.is_active || response.user_answered) {
        shouldShowModal.value = false;
        return;
      }

      surveyUuid.value = response.uuid;

      const state = readState();

      if (!canShowBasedOnPostpone(state)) {
        shouldShowModal.value = false;
        return;
      }

      const today = getTodayDate();
      if (state.lastPostponedDate !== today) {
        writeState({
          ...getDefaultState(),
          firstShownTodayAt: new Date().toISOString(),
        });
      }

      shouldShowModal.value = true;
    } catch {
      shouldShowModal.value = false;
    }
  }

  function onPostpone(): void {
    shouldShowModal.value = false;

    const state = readState();
    const today = getTodayDate();

    const isNewDay = state.lastPostponedDate !== today;

    writeState({
      lastPostponedAt: new Date().toISOString(),
      postponeCountToday: isNewDay ? 1 : state.postponeCountToday + 1,
      firstShownTodayAt: state.firstShownTodayAt ?? new Date().toISOString(),
      lastPostponedDate: today,
    });
  }

  function onSubmitted(): void {
    shouldShowModal.value = false;
    moduleStorage.removeItem(STORAGE_KEY);
  }

  return {
    shouldShowModal,
    surveyUuid,
    checkSurvey,
    onPostpone,
    onSubmitted,
  };
}
