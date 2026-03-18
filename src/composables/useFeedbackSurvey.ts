import { ref } from 'vue';
import feedbackApi from '@/services/api/resources/conversational/feedback';
import { UnnnicToastManager } from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';

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
      shouldShowModal.value = true;
    } catch {
      shouldShowModal.value = false;
    }
  }

  const t = (key: string) => i18n.global.t(key);

  function onPostpone(): void {
    shouldShowModal.value = false;

    UnnnicToastManager.info(t('data_feedback.toast_postponed'), '', {
      button: {
        text: t('data_feedback.toast_postponed_respond'),
        action: () => {
          shouldShowModal.value = true;
        },
      },
    });
  }

  function onSubmitted(): void {
    shouldShowModal.value = false;

    UnnnicToastManager.success(t('data_feedback.toast_success'));
  }

  function onSubmitError(): void {
    UnnnicToastManager.error(t('data_feedback.toast_error'), '', {
      button: {
        text: t('data_feedback.toast_error_retry'),
        action: () => {
          shouldShowModal.value = true;
        },
      },
    });
  }

  return {
    shouldShowModal,
    surveyUuid,
    checkSurvey,
    onPostpone,
    onSubmitted,
    onSubmitError,
  };
}
