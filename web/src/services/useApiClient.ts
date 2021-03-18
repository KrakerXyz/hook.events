import { ApiClient } from 'hook-events/api';

let client: ApiClient;
export function useApiClient(): ApiClient {
   if (!client) {
      client = new ApiClient({
         scheme: process.env.VUE_APP_RECEIVER_SCHEME as 'http' | 'https',
         host: process.env.VUE_APP_RECEIVER_HOST
      });
   }
   return client;
}