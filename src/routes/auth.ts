import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env';
import { prisma } from '../db/prisma';
const router = Router();
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) return res.status(400).json({ error: 'idToken is required' });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) return res.status(401).json({ error: 'Invalid token' });

    const email = payload.email;
    const name = payload.name ?? null;
    const avatarUrl = payload.picture ?? null;
    const providerId = payload.sub;

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, avatarUrl },
      create: {
        email,
        name,
        avatarUrl,
        providers: {
          create: { providerType: 'google', providerId },
        },
      },
      include: { providers: true },
    });

    await prisma.provider.upsert({
      where: { providerType_providerId: { providerType: 'google', providerId } },
      update: { userId: user.id },
      create: { providerType: 'google', providerId, userId: user.id },
    });

    const token = jwt.sign({ email: user.email }, env.JWT_SECRET, { subject: user.id, expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl } });
  } catch (err) {
    return res.status(401).json({ error: 'Google authentication failed' });
  }
});

export default router;

