import { ApiClient } from 'hook-events';
import { v4 } from 'uuid';
import { getApiToken } from './apiToken';

let client: ApiClient;
export function useApiClient(): ApiClient {
   if (!client) {
      const clientId = `hook.events-${v4()}`;
      client = new ApiClient({
         scheme: process.env.VUE_APP_RECEIVER_SCHEME as 'http' | 'https',
         host: process.env.VUE_APP_RECEIVER_HOST,
         clientId,
         apiToken: getApiToken
      });
   }
   return client;
}