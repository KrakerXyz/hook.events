import { ApiClient } from 'hook-events';
import { v4 } from 'uuid';
import { useApiToken } from './loginService';

let client: ApiClient;
export function useApiClient(): ApiClient {
   if (!client) {
      const apiToken = useApiToken();
      const clientId = `hook.events-${v4()}`;
      client = new ApiClient({
         scheme: process.env.VUE_APP_RECEIVER_SCHEME as 'http' | 'https',
         host: process.env.VUE_APP_RECEIVER_HOST,
         clientId,
         apiToken: () => apiToken.value
      });
   }
   return client;
}