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
   const hook = await userModel.findOne({ id: googleId }).exec();
   log.debug('Got google user {googleId} from db in {elapsed}ms', { googleId, elapsed: performance.now() - startTime });
   return deMongoose<User>(hook);
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

export interface User {

   id: string;
   created: number;
   adminApiToken: string

}

export type NewUser = Omit<User, 'id'>;