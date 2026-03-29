import { Router } from 'express';
import { signupRouter } from './signup';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

router.use('/signup', signupRouter);

export default router;

