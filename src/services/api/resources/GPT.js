import axios from 'axios';
import env from '@/utils/env';

const http = axios.create({
  headers: {
    Authorization: env('VITE_GPT_AUTH'),
  },
});

export default {
  async getInsights(prompt) {
    const response = await http.post(env('VITE_GPT_URL'), {
      messages: [
        {
          role: 'user',
          content: `${prompt}`,
        },
      ],
      model: 'llama3-8b-8192',
    });

    return response.data?.choices?.[0].message?.content;
  },
};
