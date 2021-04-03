
import { Hook } from 'hook-events';
import { performance } from 'perf_hooks';
import { createLogger } from '../logger';
import { deleteHookEvents } from './eventDataStore';
import { TypedEntity } from '@krakerxyz/typed-base';
import { awaitAll } from './awaitAll';

const logger = createLogger('hookStore');
logger.debug('Creating mongoose model');

const hookBase = new TypedEntity<Hook>();

export async function getHooks(ownerId: string): Promise<Hook[]> {
   const startTime = performance.now();
   const hooks = await hookBase.findAsync({ ownerId });
   const arr = await awaitAll(hooks);
   logger.debug('Got {count} hooks for owner {ownerId} from db in {elapsed}ms', { count: arr.length, ownerId, elapsed: performance.now() - startTime });
   return arr;
}

export async function getHook(hookId: string): Promise<Hook | null> {
   const startTime = performance.now();
   const hook = await hookBase.findOneAsync({ id: hookId });
   logger.debug('Got hook {hookId} from db in {elapsed}ms', { hookId, elapsed: performance.now() - startTime });
   return hook;
}

export async function addHook(hook: Hook): Promise<void> {

   const startTime = performance.now();
   await hookBase.insertAsync(hook);
   logger.debug('Saved hook {hookId} to db in {elapsed}ms', { hookId: hook.id, elapsed: performance.now() - startTime });

}

export async function updateHook(hookId: string, hook: Hook): Promise<void> {
   const startTime = performance.now();
   await hookBase.replaceOneAsync(hook);
   logger.debug('Updated hook {hookId} to db in {elapsed}ms', { hookId: hookId, elapsed: performance.now() - startTime });

}

export async function deleteHook(hookId: string): Promise<void> {
   const startTime = performance.now();
   await deleteHookEvents(hookId);
   await hookBase.deleteOneAsync(hookId);
   logger.debug('Deleted hook {hookId} and all data from db in {elapsed}ms', { hookId: hookId, elapsed: performance.now() - startTime });

}
