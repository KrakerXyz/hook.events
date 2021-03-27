
import { Hook, HookUpdate } from 'hook-events';
import { performance } from 'perf_hooks';
import { createLogger } from '../logger';
import mongoose from 'mongoose';
import { deMongoose } from './deMongoose';

const logger = createLogger('hookStore');
logger.debug('Creating mongoose model');

const HookModel = mongoose.model('hook', new mongoose.Schema({
   id: String,
   created: Number,
   description: String,
   ownerId: String
}));

export async function getHooks(ownerId: string): Promise<Hook[]> {
   const startTime = performance.now();
   const hooks = await HookModel.find({ ownerId }).exec();
   logger.debug('Got {count} hooks for owner {ownerId} from db in {elapsed}ms', { count: hooks.length, ownerId, elapsed: performance.now() - startTime });
   return deMongoose<Hook>(hooks);
}

export async function getHook(hookId: string): Promise<Hook | null> {
   const startTime = performance.now();
   const hook = await HookModel.findOne({ id: hookId }).exec();
   logger.debug('Got hook {hookId} from db in {elapsed}ms', { hookId, elapsed: performance.now() - startTime });
   return deMongoose<Hook>(hook);
}

export async function addHook(hook: Hook): Promise<void> {

   const hookModel = new HookModel(hook);

   const startTime = performance.now();
   await hookModel.save();
   logger.debug('Saved hook {hookId} to db in {elapsed}ms', { hookId: hook.id, elapsed: performance.now() - startTime });

}

export async function updateHook(hookId: string, hook: HookUpdate): Promise<void> {

   const startTime = performance.now();
   await HookModel.findOneAndUpdate({ id: hookId }, hook);
   logger.debug('Updated hook {hookId} to db in {elapsed}ms', { hookId: hookId, elapsed: performance.now() - startTime });

}

export async function deleteHook(hookId: string): Promise<void> {
   const startTime = performance.now();
   await HookModel.deleteOne({ id: hookId });
   logger.debug('Deleted hook {hookId} to db in {elapsed}ms', { hookId: hookId, elapsed: performance.now() - startTime });

}
