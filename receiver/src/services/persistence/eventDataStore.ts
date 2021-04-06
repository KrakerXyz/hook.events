

import { TypedEntity } from '@krakerxyz/typed-base';
import { EventData, EventDataSlim } from 'hook-events';
import { performance } from 'perf_hooks';
import { createLogger } from '../logger';
import { awaitAll } from './awaitAll';
import { deleteBody, storeBody } from './bodyStorageService';

const logger = createLogger('eventDataStore');

logger.debug('Creating mongoose model');

const eventDataBase = new TypedEntity<EventData>();

export async function getEventsForHook(hookId: string): Promise<EventDataSlim[]> {
   const startTime = performance.now();

   const events = eventDataBase.find({ hookId });
   const arr = await awaitAll(events);
   logger.debug('Got {length} events for hook {hookId} from db in {elapsed}ms', { length: arr.length, hookId, elapsed: performance.now() - startTime });

   return arr.sort(i => i.created - Date.now()).map(e => {
      const { body, ...slim } = e;
      return { ...slim, hasBody: !!body };
   });

}

export async function getEvent(eventId: string): Promise<EventData | null> {
   const startTime = performance.now();
   const item = await eventDataBase.findOneAsync({ id: eventId });
   logger.debug('Got event {eventId} from db in {elapsed}ms', { eventId, elapsed: performance.now() - startTime });
   return item;
}

export async function addEvent(event: EventData): Promise<void> {

   let body: string | null | undefined = undefined;

   let bodyStoragePromise = Promise.resolve();

   if (event.body) {
      const bodyResult = storeBody(event.hookId, event.id, event.body);
      bodyStoragePromise = bodyResult.promise;
      body = bodyResult.fileName;
   }

   const eventModel: EventData = {
      ...event,
      body
   };

   logger.debug('Inserting event {id} into table', { id: event.id });
   const timeStart = performance.now();
   await eventDataBase.insertAsync(eventModel);

   logger.debug('Inserted event {id} into table in {elapsed}ms', { id: event.id, elapsed: performance.now() - timeStart });

   try {
      await bodyStoragePromise;
   } catch (e) {
      logger.error('Failed to save body - {errorMessage}', { errorMessage: e.toString() });
   }

}

export async function deleteEvent(event: EventData): Promise<void> {

   logger.debug('Starting db delete task for event {eventId}', { eventId: event.id });

   const startTime = performance.now();

   const dbDelete = eventDataBase.deleteOneAsync(event.id);

   if (event.body) {
      logger.debug('Deleting event {eventId} body', { eventId: event.id });
      await deleteBody(event.body);
   }

   await dbDelete;

   logger.debug('Completed event {eventId} deletion in {elapsed}ms', { eventId: event.id, elapsed: performance.now() - startTime });
}

export async function deleteHookEvents(hookId: string): Promise<void> {
   const startTime = performance.now();

   const iter = eventDataBase.find({ hookId });
   const events = await awaitAll(iter);
   const eventsWithBody = events.filter(e => e.body);

   await Promise.all(eventsWithBody.map(e => deleteBody(e.body!)));
   await eventDataBase.deleteAsync({ hookId });

   logger.debug('Deleted hook {hookId} events from db in {elapsed}ms', { hookId: hookId, elapsed: performance.now() - startTime });
}
