import { createLogger } from '../logger';
import mongoose from 'mongoose';
import { deMongoose } from './deMongoose';
import { performance } from 'perf_hooks';

const log = createLogger('userStore');

const userModel = mongoose.model('user', new mongoose.Schema({
   id: String,
   created: Number,
   adminApiToken: String
}));

export async function getGoogleUser(googleUserId: string): Promise<User | null> {
   const googleId = `google-${googleUserId}`;

   const startTime = performance.now();

   const user = await userModel.findOne({ id: googleId }).exec();

   log.debug('Got google user {googleId} from db in {elapsed}ms', { googleId, elapsed: performance.now() - startTime });

   return deMongoose<User>(user);
}

export async function addGoogleUser(googleUserId: string, user: NewUser): Promise<User> {
   const newUser: User = {
      ...user,
      id: `google-${googleUserId}`
   };

   const dbUser = new userModel(newUser);
   const startTime = performance.now();
   await dbUser.save();
   log.debug('Saved google user {googleId} to db in {elapsed}ms', { googleId: newUser.id, elapsed: performance.now() - startTime });

   return newUser;
}

/** Find a user by their adminApiToken */
export async function getTokenUser(token: string): Promise<User | null> {

   const startTime = performance.now();

   const user = await userModel.findOne({ adminApiToken: token }).exec();

   log.debug('Got user {userId} by token from db in {elapsed}ms', { userId: user?.id ?? '[404]', elapsed: performance.now() - startTime });

   return deMongoose<User>(user);
}

export interface User {

   id: string;
   created: number;
   adminApiToken: string

}

export type NewUser = Omit<User, 'id'>;