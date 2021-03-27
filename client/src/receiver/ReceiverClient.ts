
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client/build/socket';
import { EventData } from '.';
import { Subscription } from './subscription';
import { Connection } from './types';

export { Subscription };

export type EventListener = (event: EventData) => Promise<void> | void;
export type ConnectionListener = (connection: Connection) => Promise<void> | void;

/** A client for connecting to and receiving inbound events from a hook */
export class ReceiverClient {

   private readonly _hookId: string;
   private readonly _scheme: 'http' | 'https';
   private readonly _host: string;
   private readonly _options: Readonly<ReceiverOptions>;

   /**
    * Create a new client
    * @param hookUrl - The url for your hook. Normally in the form of https://[hookId].hook.events
    * @param options - Additional options for the client
    */
   public constructor(hookUrl: string, options?: Readonly<Partial<ReceiverOptions>>) {

      const rx = new RegExp(/^(https?):\/\/(.+?)\.((?:hook\.events)|(?:localhost)(?::\d+)?)$/);
      const mxs = rx.exec(hookUrl);
      if (!mxs) { throw new Error('hookUrl format is invalid'); }

      this._hookId = mxs[2];
      this._host = mxs[3];
      this._scheme = mxs[1] as 'http' | 'https';

      this._options = {
         alwaysOn: options?.alwaysOn ?? false,
         apiToken: options?.apiToken,
         clientId: options?.clientId
      };

      if (this._options.alwaysOn) {
         this.checkConnection();
      }
   }

   private readonly _eventListeners: EventListener[] = [];
   private readonly _connectionListeners: ConnectionListener[] = [];

   private _disposed = false;

   /** Returns whether dispose has been called on this instance of the ReceiverClient. */
   public get isDisposed() { return this._disposed; }

   private _socket: Socket | undefined | null;

   private resolveValueProvider(valueProvider?: ValueProvider | null): Promise<string | null> {
      if (!valueProvider) { return Promise.resolve(null); }
      const value = (typeof valueProvider === 'function' ? valueProvider() : valueProvider);
      return Promise.resolve(value);
   }

   private async checkConnection(): Promise<void> {

      if (this._disposed) { throw new Error('Client has been disposed'); }

      //If we have a socket already but there are no listeners and not set to alwaysOn, close it down and return
      if (!this._options.alwaysOn && !this._eventListeners.length) {

         if (this._socket) {
            this._socket.disconnect();
            this._socket = null;
         }
         return;
      }

      //At this point, we know we need a socket so check if one exists and is connected
      if (this._socket?.connected) { return; }

      //If we don't have a socket, create one
      if (!this._socket) {

         const query: Record<string, string> = {
            hookId: this._hookId,
         };

         const clientId = await this.resolveValueProvider(this._options.clientId);
         if (clientId) { query['he-client-id'] = clientId; }

         this._socket = io(`${this._scheme}://${this._host}`, {
            transports: ['websocket'],
            query,
            path: '/b1cb9b4abce54cd8add7e0ad9be94e4b',
            withCredentials: true,
            auth: async (cb) => {
               const authValue = await this.resolveValueProvider(this._options.apiToken);
               if (!authValue) {
                  cb({});
                  return;
               }

               cb({
                  token: authValue
               });
            }
         });

         this._socket.on('event', async (e: EventData) => {
            for (const l of this._eventListeners) {
               await Promise.resolve(l(e));
            }
         });

         this._socket.on('connection', async (e: Connection) => {
            for (const l of this._connectionListeners) {
               await Promise.resolve(l(e));
            }
         });

      }

      //Now wait until a connection is made
      await new Promise<void>(r => {
         this._socket!.once('connect', () => {
            r();
         });
      });

   }

   /**
    * Add a listener to be invoked when events come in. Returns a promise that resolves when the connection is activated. A subscription is returned from the promise that can be used to remove the listener when events are no longer needed.
    * @param listener - The callback to be invoked when a new event comes in.
    */
   public async onEvent(listener: EventListener): Promise<Subscription> {
      this._eventListeners.push(listener);
      await this.checkConnection();
      return {
         unsubscribe: () => {
            const i = this._eventListeners.indexOf(listener);
            console.assert(i !== -1);
            this._eventListeners.splice(i, 1);
         }
      };
   }

   public async onConnection(listener: ConnectionListener): Promise<Subscription> {
      this._connectionListeners.push(listener);
      await this.checkConnection();
      return {
         unsubscribe: () => {
            const i = this._connectionListeners.indexOf(listener);
            console.assert(i !== -1);
            this._connectionListeners.splice(i, 1);
         }
      };
   }

   /** Call when the client is no longer needed to close the connection to the server. Once disposed, it cannot be reactivated. */
   public dispose() {
      if (!this._socket) { return; }
      this._socket.disconnect();
      this._socket = null;
      this._eventListeners.splice(0, this._eventListeners.length);
      this._disposed = true;
   }

}

type ValueProvider = (() => string | null | Promise<string | null>) | string | null;

/** Options for a ReceiverClient */
export interface ReceiverOptions {
   /** Defaults to false which means a connection to the server will only be maintained for as long as there are even listeners. Set to true to maintain a connection even while there are no listeners  */
   alwaysOn: boolean;

   /** An unique identifier for this client */
   clientId?: ValueProvider;

   /** A api token to be used for authorized calls */
   apiToken?: ValueProvider;

}