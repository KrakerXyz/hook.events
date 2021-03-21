import { EnvKey, getRequiredConfig } from '@/config';
import { createLogger } from '@/services/logger';
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

   let googleUserId: string | null = null;

   try {
      const ticket = await client.verifyIdToken({
         idToken: googleToken.idToken,
         audience: clientId
      });
      const payload = ticket.getPayload();
      if (!payload) { throw new Error('empty payload'); }

      googleUserId = payload.sub;

   } catch (e) {
      log.warn('Error validating google auth token - {e}', e);
      res.status(401).send('Could not validate google idToken');
      return;
   }

   const apiToken: ApiToken = {
      token: googleUserId
   };

   res.status(200).send(apiToken);
};

const authRouter = Router();
authRouter.post('/google', json(), postGoogleToken);

export default authRouter;