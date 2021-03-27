
import { createLogger } from '@/services/logger';
import { newHookId } from '@/services/newHookId';
import { getEventsForHook } from '@/services/persistence/eventDataStore';
import { addHook, getHook, getHooks, updateHook } from '@/services/persistence/hookStore';
import { json, RequestHandler } from 'express';
import { Router } from 'express';
import { Hook, HookUpdate } from 'hook-events';
import { HeRequest } from './HeRequest';

const hookRouter = Router();

const log = createLogger('hookRouter');

const get: RequestHandler = async (req: HeRequest, res): Promise<void> => {

   if (!req.user) {
      res.status(400).send('Authentication required to list hooks');
      return;
   }

   const hooks = await getHooks(req.user.id);

   res.status(200).send(hooks);

};
hookRouter.get('/', get);

const getById: RequestHandler = async (req: HeRequest, res): Promise<void> => {
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

   if (hook.ownerId && hook.ownerId !== req.user?.id) {
      res.status(403).send('Accedd denied to private hook');
      log.warn('Access to hook {hookId} denied (403) to user {userId}', { hookId, userId: req.user?.id ?? 'anon' });
      return;
   }

   res.status(200).send(hook);
};
hookRouter.get('/:hookId', getById);

const post: RequestHandler = async (req: HeRequest, res): Promise<void> => {

   const hook: Hook = {
      id: newHookId(),
      description: '',
      created: Date.now(),
      ownerId: req.user?.id ?? null
   };

   await addHook(hook);


   res.send(hook);
};
hookRouter.post('/', json(), post);

const put: RequestHandler = async (req: HeRequest, res): Promise<void> => {

   if (!req.user) {
      res.status(400).send('Authorization is required to perform hook updates');
      return;
   }

   const hookId = req.params['hookId'];
   if (!hookId) {
      res.status(400).send('hookId not found');
      return;
   }

   const hook = await getHook(hookId);
   if (!hook) {
      res.status(404).send('Hook does not exist');
      return;
   }

   if (!hook.ownerId) {
      res.send(400).send('Only private hooks can be updated');
      return;
   }

   if (hook.ownerId !== req.user?.id) {
      res.status(403).send('Access denied to private hook');
      log.warn('Access to hook {hookId} events denied (403) to user {userId}', { hookId, userId: req.user?.id ?? 'anon' });
      return;
   }

   const hookUpdate: HookUpdate = req.body;
   const hookUpdateClean: HookUpdate = { description: hookUpdate.description, name: hookUpdate.name };

   await updateHook(hookId, hookUpdateClean);

   const newHook = { ...hook, ...hookUpdateClean };

   res.status(200).send(newHook);

};
hookRouter.put('/:hookId', json(), put);

const getEvents: RequestHandler = async (req: HeRequest, res): Promise<void> => {
   const hookId = req.params['hookId'];
   if (!hookId) {
      res.status(400).send('hookId not found');
      return;
   }

   const hook = await getHook(hookId);
   if (!hook) {
      res.status(404).send('Hook does not exist');
      return;
   }

   if (hook.ownerId && hook.ownerId !== req.user?.id) {
      res.status(403).send('Access denied to private hook');
      log.warn('Access to hook {hookId} events denied (403) to user {userId}', { hookId, userId: req.user?.id ?? 'anon' });
      return;
   }

   const events = await getEventsForHook(hookId);

   res.status(200).send(events);

};
hookRouter.get('/:hookId/events', getEvents);

export default hookRouter;