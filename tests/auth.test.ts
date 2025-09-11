import './setupEnv';
import request from 'supertest';
import app from '../src/app';

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: 'user@example.com',
          sub: 'google-sub-123',
          name: 'User',
          picture: 'http://example.com/a.png',
        }),
      }),
    })),
  };
});

jest.mock('generated/prisma', () => {
  const providers: any[] = [];
  let user: any | null = null;
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        upsert: jest.fn(async ({ where, update, create }: any) => {
          if (!user) {
            user = { id: 'u1', email: where.email, name: create.name, avatarUrl: create.avatarUrl };
          } else {
            user = { ...user, ...update };
          }
          return { ...user, providers };
        }),
      },
      provider: {
        upsert: jest.fn(async () => ({ id: 'p1' })),
      },
    })),
  };
});

describe('Auth routes', () => {
  it('issues JWT on Google login', async () => {
    const res = await request(app).post('/auth/google').send({ idToken: 'fake' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('user@example.com');
  });
});

