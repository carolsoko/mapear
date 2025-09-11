import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
const router = Router();

// Create a game session (start)
router.post('/sessions', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { gameKey } = req.body as { gameKey?: string };
  if (!gameKey) return res.status(400).json({ error: 'gameKey is required' });
  const session = await prisma.gameSession.create({
    data: { userId: req.user!.id, gameKey, correctCount: 0, totalCount: 0, timeSpentSeconds: 0 },
  });
  res.status(201).json(session);
});

// Update progress within a session
router.patch('/sessions/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { correctDelta = 0, totalDelta = 0, timeDeltaSeconds = 0, complete = false } = req.body as {
    correctDelta?: number;
    totalDelta?: number;
    timeDeltaSeconds?: number;
    complete?: boolean;
  };
  const session = await prisma.gameSession.update({
    where: { id },
    data: {
      correctCount: { increment: correctDelta },
      totalCount: { increment: totalDelta },
      timeSpentSeconds: { increment: timeDeltaSeconds },
      completedAt: complete ? new Date() : undefined,
    },
  });
  res.json(session);
});

// List user sessions for a game
router.get('/sessions', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { gameKey } = req.query as { gameKey?: string };
  const sessions = await prisma.gameSession.findMany({
    where: { userId: req.user!.id, ...(gameKey ? { gameKey } : {}) },
    orderBy: { startedAt: 'desc' },
  });
  res.json(sessions);
});

export default router;

