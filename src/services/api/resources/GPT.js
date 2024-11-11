import { db as firebaseDB } from '@/utils/plugins/Firebase.js';
import { collection, addDoc } from 'firebase/firestore';

export default {
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
