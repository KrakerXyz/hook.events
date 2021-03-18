
import { Router } from 'express';
import hookRouter from './hookRouter';
import eventRouter from './eventRouter';

const router = Router();
router.use('/api/hooks', hookRouter);
router.use('/api/events', eventRouter);
router.all('/api*', (req, res) => {
   res.status(404).send('Api route not found');
});

export default router;