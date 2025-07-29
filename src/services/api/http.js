import env from '@/utils/env';
import setupClient from './setupClient';

export default setupClient(`${env('INSIGHTS_API_URL')}/v1`);
