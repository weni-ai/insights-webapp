import axios from 'axios';
import env from '@/utils/env';

const http = axios.create({
  headers: {
    Authorization: env('VITE_GPT_AUTH'),
  },
});

export default {
  async getInsights(prompt) {
    const URL = env('VITE_GPT_URL');

    if (!URL) {
      throw new Error(`The VITE_GPT_URL environment variable is empty: ${URL}`);
    }

    const response = await http.post(URL, {
      input: {
        prompt: `<s>[INST] ${prompt} [/INST]`,
        sampling_params: {
          max_tokens: 1024,
          n: 1,
          top_p: 0.95,
          tok_k: 10,
          temperature: 0.1,
          do_sample: false,
        },
      },
    });
    return response.data;
  },
};
