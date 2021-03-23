import { getBody } from '@/services/persistence/bodyStorageService';
import { getEvent } from '@/services/persistence/eventDataStore';
import { RequestHandler, Router } from 'express';
import { deleteEvent as persistanceDeleteEvent } from '@/services/persistence/eventDataStore';
import { AuthenticatedRequest } from './AuthenticatedRequest';
import { getHook } from '@/services/persistence/hookStore';
import { createLogger } from '@/services/logger';

const log = createLogger('eventRouter');

const getEventBody: RequestHandler = async (req: AuthenticatedRequest, res) => {
   const eventId = req.params['eventId'];
   if (!eventId) {
      res.status(400).send('eventId missing');
      return;
   }

   const event = await getEvent(eventId);
   if (!event) {
      res.status(404).send('eventId does not exist');
      return;
   }

   const hook = await getHook(event.hookId);

   if (!hook) {
      res.status(500).send('Missing hook for event');
      log.error('Hook {hookId} for event {eventId} not found', { hookId: event.hookId, eventId });
      return;
   }

   if (hook.ownerId && hook.ownerId !== req.user?.id) {
      res.status(403).send('Accedd denied to private hook');
      log.warn('Access to event {eventId} body denied (403) to user {userId}', { eventId, userId: req.user?.id ?? 'anon' });
      return;
   }

   if (!event.body) {
      res.status(204).send();
      return;
   }

   const buffer = await getBody(event.body);

   res.status(200).send(buffer);

};

const deleteEvent: RequestHandler = async (req: AuthenticatedRequest, res) => {
   const eventId = req.params['eventId'];
   if (!eventId) {
      res.status(400).send('eventId not found');
      return;
   }

   const event = await getEvent(eventId);
   if (!event) {
      res.status(404).send('eventId does not exist');
      return;
   }

   const hook = await getHook(event.hookId);

   if (!hook) {
      res.status(500).send('Missing hook for event');
      log.error('Hook {hookId} for event {eventId} not found', { hookId: event.hookId, eventId });
      return;
   }

   if (hook.ownerId && hook.ownerId !== req.user?.id) {
      res.status(403).send('Accedd denied to private hook');
      log.warn('Access to event {eventId} body denied (403) to user {userId}', { eventId, userId: req.user?.id ?? 'anon' });
      return;
   }

   await persistanceDeleteEvent(event);

   res.status(200).send();
};

const eventRouter = Router();

eventRouter.get('/:eventId/body', getEventBody);
eventRouter.delete('/:eventId', deleteEvent);

export default eventRouter;