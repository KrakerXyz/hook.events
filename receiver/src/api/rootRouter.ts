
import { Router } from 'express';
import hookRouter from './hookRouter';
import eventRouter from './eventRouter';
import authRouter from './authRouter';
import { getTokenUser } from '@/services/persistence/userStore';
import { HeRequest } from './HeRequest';
import { createLogger } from '@/services/logger';
import { verifyAuthorizationHeader } from '@/services/verifyAuthorization';

const router = Router();

const log = createLogger('rootRouter');

/** Authorize the user if given */
router.use(async (req: HeRequest, res, next) => {

   const auth = req.headers.authorization;
   if (!auth) {
      next();
      return;
   }

   try {
      const user = await verifyAuthorizationHeader(auth);

      log.debug('Authenticated user {userId}', { userId: user.id });

      req.user = user;

   } catch (e) {
      log.warn('Failed authorization verification - {errorMessage}', { errorMessage: e });
      res.status(401).send(e);
      return;
   }

   next();

});

/** Setup the client id */
router.use((req: HeRequest, res, next) => {

   const clientId = req.headers['he-client-id'];

   if (Array.isArray(clientId)) {
      res.status(400).send('Malformed he-client-id header. Multiple values not supported');
      return;
   }

   req.clientId = clientId;
   next();

});

router.use('/api/hooks', hookRouter);
router.use('/api/events', eventRouter);
router.use('/api/auth', authRouter);

router.all('/api*', (req, res) => {
   res.status(404).send('Api route not found');
});

export default router;