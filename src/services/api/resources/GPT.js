import { db as firebaseDB } from '@/utils/plugins/Firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import http from '@/services/api/http';
import Config from '@/store/modules/config';

export default {
  async getInsights(prompt) {
    const { project } = Config.state;
    const response = await http.post(
      `/projects/${project.uuid}/sources/chat_completion/search/`,
      {
        prompt,
      },
    );

    return response;
  },

  async createReview({ user, helpful, comment }) {
    try {
      return await addDoc(collection(firebaseDB, 'AI Reviews'), {
        user,
        helpful,
        comment,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error writing AI Reviews document: ', error);
    }
  },
};
