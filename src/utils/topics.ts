import { Topic } from '@/store/modules/conversational/topics';
import unnnic from '@weni/unnnic-system';

export function checkIsEmptyValuesAndNewTopics(t: Topic) {
  return t.isNew === true && (t.context.trim() !== '' || t.name.trim() !== '');
}

export function defaultAlert(
  type: 'success' | 'error',
  text: string,
  seconds: number = 5,
) {
  (unnnic.unnnicCallAlert as any)({
    props: {
      text,
      type,
    },
    seconds,
  });
}
