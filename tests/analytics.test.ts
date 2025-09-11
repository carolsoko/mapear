import './setupEnv';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';

const token = jwt.sign({ email: 'user@example.com' }, process.env.JWT_SECRET!, { subject: 'u1' });

jest.mock('generated/prisma', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      gameSession: {
        aggregate: jest.fn(async () => ({
          _sum: { timeSpentSeconds: 120, correctCount: 3, totalCount: 5 },
          _count: { _all: 1 },
        })),
      },
      courseProgress: {
        aggregate: jest.fn(async () => ({
          _sum: { timeSpentSeconds: 300, score: 80, attempts: 1 },
          _count: { _all: 1 },
        })),
      },
    })),
  };
});

describe('Analytics routes', () => {
  it('summarizes user analytics', async () => {
    const res = await request(app).get('/analytics/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.games.correct).toBe(3);
    expect(res.body.course.score).toBe(80);
  });
});

