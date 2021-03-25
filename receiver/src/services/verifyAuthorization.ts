import { getTokenUser, User } from './persistence/userStore';

/** Validates a authorization http header. Throws an error if invalid or returns a user instance if valid */
export async function verifyAuthorizationHeader(headerValue?: string | null): Promise<User> {

   if (!headerValue) {
      throw new Error('Authorization required for hook');
   }

   const parts = headerValue.split(' ');
   if (parts.length !== 2) {
      throw new Error('Malformed authorization header');
   }

   if (parts[0].toLocaleLowerCase() !== 'bearer') {
      throw new Error('Invalid authorization schema');
   }

   const user = await getTokenUser(parts[1]);

   if (!user) {
      throw new Error('Invalid authorization');
   }

   return user;

}