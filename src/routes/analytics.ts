import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
const router = Router();

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  const [gameAgg, courseAgg] = await Promise.all([
    prisma.gameSession.aggregate({
      where: { userId },
      _sum: { timeSpentSeconds: true, correctCount: true, totalCount: true },
      _count: { _all: true },
    }),
    prisma.courseProgress.aggregate({
      where: { userId },
      _sum: { timeSpentSeconds: true, score: true, attempts: true },
      _count: { _all: true },
    }),
  ]);

  res.json({
    games: {
      sessions: gameAgg._count._all ?? 0,
      correct: gameAgg._sum.correctCount ?? 0,
      total: gameAgg._sum.totalCount ?? 0,
      timeSeconds: gameAgg._sum.timeSpentSeconds ?? 0,
    },
    course: {
      modules: courseAgg._count._all ?? 0,
      score: courseAgg._sum.score ?? 0,
      attempts: courseAgg._sum.attempts ?? 0,
      timeSeconds: courseAgg._sum.timeSpentSeconds ?? 0,
    },
  });
});

export default router;

