
import { newHookId } from '@/services/newHookId';
import { getEventsForHook } from '@/services/persistence/eventDataStore';
import { addHook, getHook } from '@/services/persistence/hookStore';
import { json, RequestHandler } from 'express';
import { Router } from 'express';
import { Hook } from 'hook-events';

const getById: RequestHandler = async (req, res) => {
   const hookId = req.params['hookId'];
   if (!hookId) {
      res.status(404).send('hookId not found');
      return;
   }

   const hook = await getHook(hookId);
   if (!hook) {
      res.status(404).send('Hook does not exist');
      return;
   }

   res.status(200).send(hook);
};

const post: RequestHandler = async (req, res) => {

   const hook: Hook = {
      id: newHookId(),
      description: '',
      created: Date.now()
   };

   await addHook(hook);

   res.send(hook);
};

const getEvents: RequestHandler = async (req, res) => {
   const hookId = req.params['hookId'];
   if (!hookId) {
      res.status(400).send('hookId not found');
      return;
   }

   const events = await getEventsForHook(hookId);

   res.status(200).send(events);

};

const hookRouter = Router();

hookRouter.post('/', json(), post);
hookRouter.get('/:hookId', getById);
hookRouter.get('/:hookId/events', getEvents);

export default hookRouter;