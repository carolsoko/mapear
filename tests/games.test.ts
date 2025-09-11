import './setupEnv';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';

const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET!, { subject: 'u1' });

jest.mock('generated/prisma', () => {
  const sessions: any[] = [];
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      gameSession: {
        create: jest.fn(async ({ data }: any) => {
          const s = { id: `s${sessions.length + 1}`, ...data, startedAt: new Date(), completedAt: null };
          sessions.push(s);
          return s;
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const s = sessions.find((x) => x.id === where.id);
          s.correctCount += data.correctCount?.increment ?? 0;
          s.totalCount += data.totalCount?.increment ?? 0;
          s.timeSpentSeconds += data.timeSpentSeconds?.increment ?? 0;
          if (data.completedAt) s.completedAt = new Date();
          return s;
        }),
        findMany: jest.fn(async ({ where }: any) => sessions.filter((s) => s.userId === where.userId)),
      },
    })),
  };
});

describe('Games routes', () => {
  it('creates and updates a game session', async () => {
    const created = await request(app)
      .post('/games/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameKey: 'mapear:quiz1' });
    expect(created.status).toBe(201);
    const id = created.body.id;

    const updated = await request(app)
      .patch(`/games/sessions/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ correctDelta: 3, totalDelta: 5, timeDeltaSeconds: 120, complete: true });
    expect(updated.status).toBe(200);
    expect(updated.body.correctCount).toBe(3);
    expect(updated.body.totalCount).toBe(5);
    expect(updated.body.timeSpentSeconds).toBe(120);
  });
});

