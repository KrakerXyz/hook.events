
import { Router } from 'express';
import hookRouter from './hookRouter';
import eventRouter from './eventRouter';
import authRouter from './authRouter';
import { getTokenUser } from '@/services/persistence/userStore';
import { HeRequest } from './HeRequest';
import { createLogger } from '@/services/logger';

const router = Router();

const log = createLogger('rootRouter');

/** Authorize the user if given */
router.use(async (req: HeRequest, res, next) => {

   const auth = req.headers.authorization;
   if (!auth) {
      next();
      return;
   }

   const parts = auth.split(' ');
   if (parts.length !== 2) {
      res.status(401).send('Malformed authorization header');
      return;
   }

   if (parts[0].toLocaleLowerCase() !== 'bearer') {
      res.send(401).send('Invalid authorization schema');
      return;
   }

   const user = await getTokenUser(parts[1]);

   if (!user) {
      res.send(401).send('Invalid authorization');
      return;
   }

   log.debug('Authenticated user {userId}', { userId: user.id });

   req.user = user;

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