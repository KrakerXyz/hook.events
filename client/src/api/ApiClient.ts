import Axios, { AxiosInstance } from 'axios';
import type { EventDataSlim, Hook, GoogleToken, ApiToken } from '../types';

/** A client for interacting the the hook.events REST API */
export class ApiClient {

   private readonly _axios: AxiosInstance;

   public constructor(readonly options?: ApiOptions) {

      this._axios = Axios.create({
         baseURL: `${options?.scheme ?? 'https'}://${options?.host ?? 'hook.events'}/api`,
      });

      this._axios.interceptors.request.use(async c => {

         if (this.options?.apiToken) {
            const token = await Promise.resolve(this.options.apiToken);
            if (token) { c.headers.Authorization = token; }
         }

         if (this.options?.clientId) {
            const clientId = await Promise.resolve(options?.clientId);
            if (clientId) { c.headers['he-client-id'] = clientId; }
         }

         return c;
      });

   }

   public async getHook(hookId: string): Promise<Hook> {
      const url = `hooks/${hookId}`;
      return this._axios.get(url).then(r => {
         return r.data;
      });
   }

   /** Create a new hook */
   public async createHook(): Promise<Hook> {
      return this._axios.post<Hook>('hooks').then(r => {
         return r.data;
      });
   }

   /** Get a list of events received by a given hook id */
   public async getHookEvents(hookId: string): Promise<EventDataSlim[]> {
      return this._axios.get<EventDataSlim[]>(`hooks/${hookId}/events`).then(r => {
         return r.data;
      });
   }

   /** Retrieves the body for the event, encoded as a base64 string  */
   public async getEventBody(eventId: string): Promise<string | null> {
      return this._axios.get<string>(`events/${eventId}/body`, { responseType: 'text' }).then(r => {
         return r.data;
      });
   }

   /** Deletes the event */
   public async deleteEvent(eventId: string): Promise<void> {
      await this._axios.delete<void>(`events/${eventId}`);
   }

   /** Exchange a google sign-in token for a ApiToken */
   public getTokenFromGoogle(googleToken: GoogleToken): Promise<ApiToken> {
      return this._axios.post<ApiToken>('auth/google', googleToken).then(r => r.data);
   }

}

/** Options for the api client */
export interface ApiOptions {

   scheme?: 'http' | 'https';

   /** The host of the api server */
   host?: string;

   /** An arbitrary name for this client to include in logs */
   clientId?: (() => string | Promise<string>) | string;

   /** A api token to be used for authorized calls */
   apiToken?: (() => string | Promise<string>) | string;

}