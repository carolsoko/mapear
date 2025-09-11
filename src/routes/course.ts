import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
const router = Router();

// Upsert course module progress
router.put('/progress', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { courseKey, moduleKey, score, timeSpentSeconds, completed } = req.body as {
    courseKey?: string;
    moduleKey?: string;
    score?: number;
    timeSpentSeconds?: number;
    completed?: boolean;
  };
  if (!courseKey || !moduleKey) return res.status(400).json({ error: 'courseKey and moduleKey are required' });

  const existing = await prisma.courseProgress.findUnique({
    where: { userId_courseKey_moduleKey: { userId: req.user!.id, courseKey, moduleKey } },
  });

  const result = await prisma.courseProgress.upsert({
    where: { userId_courseKey_moduleKey: { userId: req.user!.id, courseKey, moduleKey } },
    update: {
      score: score ?? existing?.score ?? 0,
      timeSpentSeconds: (existing?.timeSpentSeconds ?? 0) + (timeSpentSeconds ?? 0),
      attempts: (existing?.attempts ?? 0) + 1,
      completed: completed ?? existing?.completed ?? false,
    },
    create: {
      userId: req.user!.id,
      courseKey,
      moduleKey,
      score: score ?? 0,
      timeSpentSeconds: timeSpentSeconds ?? 0,
      attempts: 1,
      completed: completed ?? false,
    },
  });

  res.json(result);
});

// Get progress summary for a course
router.get('/progress', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { courseKey } = req.query as { courseKey?: string };
  const progresses = await prisma.courseProgress.findMany({
    where: { userId: req.user!.id, ...(courseKey ? { courseKey } : {}) },
  });
  res.json(progresses);
});

export default router;

