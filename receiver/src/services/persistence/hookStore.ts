
import { Hook } from 'hook-events';
import { performance } from 'perf_hooks';
import { createLogger } from '../logger';
import mongoose from 'mongoose';
import { deMongoose } from './deMongoose';

const logger = createLogger('hookStore');
logger.debug('Creating mongoose model');

const HookModel = mongoose.model('hook', new mongoose.Schema({
   id: String,
   created: Number,
   description: String
}));

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
