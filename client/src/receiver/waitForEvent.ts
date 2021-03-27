import type { EventData } from './types/EventData';
import { ReceiverClient } from './ReceiverClient';

/** Options for the waitForEvent function */
export interface WaitForEventOptions {

   /** Time to wait, in milliseconds, for an event before an exception is thrown. Defaults to 30 seconds. */
   timeout: number;

}

/** 
 * Wait for and return the first emitted event 
 * @param hookUrlOrClient - The url for your hook. Normally in the form of https://[hookId].hook.events
 * @param options Options for the wait
 */
export function waitForEvent(hookUrlOrClient: string | ReceiverClient, options?: Partial<WaitForEventOptions>): Promise<EventData> {

   if (options?.timeout !== undefined && options.timeout < 1) { throw new Error('When given, options.timeout must be greater-than one (1)'); }

   const client = (typeof hookUrlOrClient === 'string' ? new ReceiverClient(hookUrlOrClient) : hookUrlOrClient);

   const timeout = options?.timeout ?? 30000;

   return new Promise<EventData>((res, rej) => {

      let isRejected = false;

      client.onEvent(d => {
         if (isRejected) { return; }
         clearTimeout(timeoutTimer);
         client.dispose();
         res(d);
      });

      const timeoutTimer = setTimeout(() => {
         isRejected = true;
         rej(`Failed to receive an event in the given timeout of ${timeout}ms`);
         client.dispose();

      }, timeout);

   });
}