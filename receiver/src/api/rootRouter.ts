
import { Router } from 'express';
import hookRouter from './hookRouter';
import eventRouter from './eventRouter';
import authRouter from './authRouter';

const router = Router();

router.use('/api/hooks', hookRouter);
router.use('/api/events', eventRouter);
router.use('/api/auth', authRouter);

router.all('/api*', (req, res) => {
   res.status(404).send('Api route not found');
});

export default router;