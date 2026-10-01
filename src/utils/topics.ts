import { Topic } from '@/store/modules/conversational/topics';
import { UnnnicCallAlert } from '@weni/unnnic-system';

export function checkIsEmptyValuesAndNewTopics(t: Topic) {
  return t.isNew === true && (t.context.trim() !== '' || t.name.trim() !== '');
}

export function defaultAlert(
  type: 'success' | 'error',
  text: string,
  seconds: number = 5,
) {
  (UnnnicCallAlert as any)({
    props: {
      text,
      type,
    },
    seconds,
  });
}
