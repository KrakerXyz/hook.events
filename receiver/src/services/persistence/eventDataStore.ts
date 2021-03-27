

import { EventData, EventDataSlim } from 'hook-events';
import { performance } from 'perf_hooks';
import { createLogger } from '../logger';
import { deleteBody, storeBody } from './bodyStorageService';
import mongoose from 'mongoose';
import { deMongoose } from './deMongoose';

const logger = createLogger('eventDataStore');

logger.debug('Creating mongoose model');

const EventDataModel = mongoose.model('event-data', new mongoose.Schema({
   id: String,
   created: Number,
   hookId: String,
   method: String,
   path: String,
   ip: String,
   query: Object,
   headers: Object,
   body: String,
   bodyError: new mongoose.Schema({
      errorCode: String,
      contentLength: Number,
      maxLength: Number
   })
}));

export async function getEventsForHook(hookId: string): Promise<EventDataSlim[]> {
   const startTime = performance.now();

   const events = await EventDataModel.find({ hookId }).sort({ created: -1 }).exec();

   logger.debug('Got {length} events for hook {hookId} from db in {elapsed}ms', { length: events.length, hookId, elapsed: performance.now() - startTime });

   return deMongoose<EventData>(events).map(e => {
      const { body, ...slim } = e;
      return { ...slim, hasBody: !!body };
   });

}

export async function getEvent(eventId: string): Promise<EventData | null> {
   const startTime = performance.now();
   const item = await EventDataModel.findOne({ id: eventId }).exec();
   logger.debug('Got event {eventId} from db in {elapsed}ms', { eventId, elapsed: performance.now() - startTime });
   return deMongoose<EventData>(item);
}

export async function addEvent(event: EventData): Promise<void> {

   let body: string | null | undefined = undefined;

   let bodyStoragePromise = Promise.resolve();

   if (event.body) {
      const bodyResult = storeBody(event.hookId, event.id, event.body);
      bodyStoragePromise = bodyResult.promise;
      body = bodyResult.fileName;
   }

   const eventModel = new EventDataModel({
      ...event,
      body
   });

   logger.debug('Inserting event {id} into table', { id: event.id });
   const timeStart = performance.now();
   await eventModel.save();

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

   const dbDelete = EventDataModel.deleteOne({ id: event.id }).exec();

   if (event.body) {
      logger.debug('Deleting event {eventId} body', { eventId: event.id });
      await deleteBody(event.body);
   }

   await dbDelete;

   logger.debug('Completed event {eventId} deletion in {elapsed}ms', { eventId: event.id, elapsed: performance.now() - startTime });
}

export async function deleteHookEvents(hookId: string): Promise<void> {
   const startTime = performance.now();

   const events = await EventDataModel.find({ hookId }).exec();
   const eventsWithBody = events.map(e => e.toObject() as EventData).filter(e => e.body);

   await Promise.all(eventsWithBody.map(e => deleteBody(e.body!)));
   await EventDataModel.deleteMany({ hookId });

   logger.debug('Deleted hook {hookId} events from db in {elapsed}ms', { hookId: hookId, elapsed: performance.now() - startTime });
}
