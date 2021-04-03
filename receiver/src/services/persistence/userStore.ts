import { createLogger } from '../logger';
import { performance } from 'perf_hooks';
import { TypedEntity } from '@krakerxyz/typed-base';

const log = createLogger('userStore');

const userBase = new TypedEntity<User>();

export async function getGoogleUser(googleUserId: string): Promise<User | null> {
   const googleId = `google-${googleUserId}`;

   const startTime = performance.now();

   const user = await userBase.findOneAsync({ id: googleId });

   log.debug('Got google user {googleId} from db in {elapsed}ms', { googleId, elapsed: performance.now() - startTime });

   return user;
}

export async function addGoogleUser(googleUserId: string, user: NewUser): Promise<User> {
   const newUser: User = {
      ...user,
      id: `google-${googleUserId}`
   };

   const startTime = performance.now();
   await userBase.insertAsync(newUser);
   log.debug('Saved google user {googleId} to db in {elapsed}ms', { googleId: newUser.id, elapsed: performance.now() - startTime });

   return newUser;
}

/** Find a user by their adminApiToken */
export async function getTokenUser(token: string): Promise<User | null> {

   const startTime = performance.now();

   const user = await userBase.findOneAsync({ adminApiToken: token });

   log.debug('Got user {userId} by token from db in {elapsed}ms', { userId: user?.id ?? '[404]', elapsed: performance.now() - startTime });

   return user;
}

export interface User {

   id: string;
   created: number;
   adminApiToken: string

}

export type NewUser = Omit<User, 'id'>;