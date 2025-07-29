import env from '@/utils/env';
import setupClient from './setupClient';

export default setupClient(env('NEXUS_API_URL'));
