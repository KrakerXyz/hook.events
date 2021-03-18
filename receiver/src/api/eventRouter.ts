import { getBody } from '@/services/persistence/bodyStorageService';
import { getEvent } from '@/services/persistence/eventDataStore';
import { RequestHandler, Router } from 'express';
import { deleteEvent as persistanceDeleteEvent } from '@/services/persistence/eventDataStore';


const getEventBody: RequestHandler = async (req, res) => {
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

   if (!event.body) {
      res.status(204).send();
      return;
   }

   const buffer = await getBody(event.body);

   res.status(200).send(buffer);

};

const deleteEvent: RequestHandler = async (req, res) => {
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

   await persistanceDeleteEvent(event);

   res.status(200).send();
};

const eventRouter = Router();

eventRouter.get('/:eventId/body', getEventBody);
eventRouter.delete('/:eventId', deleteEvent);

export default eventRouter;