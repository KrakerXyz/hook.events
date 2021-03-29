import { EnvKey, getRequiredConfig } from '@/config';
import { createLogger } from '@/services/logger';
import { newHookId } from '@/services/newHookId';
import { addGoogleUser, getGoogleUser, NewUser, User } from '@/services/persistence/userStore';
import { json, RequestHandler, Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import type { ApiToken, GoogleToken } from 'hook-events';

const log = createLogger('authRouter');

const postGoogleToken: RequestHandler = async (req, res): Promise<void> => {
   const googleToken: GoogleToken = req.body;

   if (!googleToken?.idToken) {
      res.status(400).send('Missing google token');
      return;
   }

   const clientId = getRequiredConfig(EnvKey.GOOGLE_CLIENT_ID);

   const client = new OAuth2Client(clientId);

   let user: User | null = null;

   try {
      const ticket = await client.verifyIdToken({
         idToken: googleToken.idToken,
         audience: clientId
      });
      const payload = ticket.getPayload();
      if (!payload) { throw new Error('empty payload'); }

      const googleUserId = payload.sub;

      log.info('Verified google token for {googleUserId}', { googleUserId });

      user = await getGoogleUser(googleUserId);

      if (!user) {
         const newUser: NewUser = {
            created: Date.now(),
            adminApiToken: newHookId()
         };
         user = await addGoogleUser(googleUserId, newUser);
         log.info('Created new google user {userId}', { userId: user.id });
      }

   } catch (e) {
      log.warn('Error validating google auth token - {errorMessage}', { errorMessage: e.toString() });
      res.status(401).send('Could not validate google idToken');
      return;
   }

   const apiToken: ApiToken = {
      token: `Bearer ${user!.adminApiToken}`
   };

   res.status(200).send(apiToken);
};

const authRouter = Router();
authRouter.post('/google', json(), postGoogleToken);

export default authRouter;