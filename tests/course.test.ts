import './setupEnv';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';

const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET!, { subject: 'u1' });

jest.mock('generated/prisma', () => {
  const progresses: any[] = [];
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      courseProgress: {
        findUnique: jest.fn(async ({ where }: any) =>
          progresses.find(
            (p) => p.userId === where.userId_courseKey_moduleKey.userId && p.courseKey === where.userId_courseKey_moduleKey.courseKey && p.moduleKey === where.userId_courseKey_moduleKey.moduleKey,
          ),
        ),
        upsert: jest.fn(async ({ where, update, create }: any) => {
          const idx = progresses.findIndex(
            (p) => p.userId === where.userId_courseKey_moduleKey.userId && p.courseKey === where.userId_courseKey_moduleKey.courseKey && p.moduleKey === where.userId_courseKey_moduleKey.moduleKey,
          );
          if (idx >= 0) {
            const existing = progresses[idx];
            const updated = {
              ...existing,
              score: update.score,
              timeSpentSeconds: update.timeSpentSeconds,
              attempts: update.attempts,
              completed: update.completed,
            };
            progresses[idx] = updated;
            return updated;
          } else {
            const created = { id: `cp${progresses.length + 1}`, updatedAt: new Date(), ...create };
            progresses.push(created);
            return created;
          }
        }),
        findMany: jest.fn(async ({ where }: any) =>
          progresses.filter((p) => p.userId === where.userId && (!where.courseKey || p.courseKey === where.courseKey)),
        ),
      },
    })),
  };
});

describe('Course routes', () => {
  it('upserts and lists course progress', async () => {
    const up = await request(app)
      .put('/course/progress')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseKey: 'mapear:curso', moduleKey: 'mod1', score: 80, timeSpentSeconds: 300, completed: false });
    expect(up.status).toBe(200);
    expect(up.body.score).toBe(80);

    const list = await request(app)
      .get('/course/progress')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThan(0);
  });
});

