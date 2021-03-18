import Axios, { AxiosInstance } from 'axios';
import { EventDataSlim, Hook } from '../types';

/** A client for interacting the the hook.events REST API */
export class ApiClient {

   private readonly _axios: AxiosInstance;

   public constructor(readonly options?: Partial<ApiOptions>) {
      this._axios = Axios.create({
         baseURL: `${options?.scheme ?? 'https'}://${options?.host ?? 'hook.events'}/api`
      });
   }

   public async getHook(hookId: string): Promise<Hook> {
      const url = `hooks/${hookId}`;
      return this._axios.get(url).then(r => {
         return r.data;
      });
   }

   /** Create a new hook */
   public async postHook(): Promise<Hook> {
      return this._axios.post<Hook>('hooks').then(r => {
         return r.data;
      });
   }

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

}

/** Options for the api client */
export interface ApiOptions {

   scheme: 'http' | 'https';

   /** The host of the api server */
   host: string;

}