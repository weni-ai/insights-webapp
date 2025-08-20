import env from '@/utils/env';
import setupClient from './setupClient';

export default setupClient(`${env('CHATS_API_URL')}/v1`);
