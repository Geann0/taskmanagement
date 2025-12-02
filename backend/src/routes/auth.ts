import { Router, Response } from 'express';
import { AuthRequest, authenticateJWT } from '../middleware/auth';
import { generateJWT } from '../utils/jwt';
import { User } from '../models/User';
import { google } from 'googleapis';

const router = Router();

// Debug: verificar se as variáveis estão carregadas
console.log('Google OAuth Config:', {
  clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
  hasSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * @swagger
 * /auth/oauth/google:
 *   get:
 *     summary: Inicia fluxo OAuth com Google
 *     tags: [Auth]
 *     description: Redireciona usuário para consentimento do Google
 *     responses:
 *       302:
 *         description: Redirect para Google OAuth
 */
router.get('/oauth/google', (_req, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    prompt: 'consent',
  });
  console.log('Generated OAuth URL:', authUrl.substring(0, 100) + '...');
  res.redirect(authUrl);
});

/**
 * @swagger
 * /auth/oauth/google/callback:
 *   get:
 *     summary: Callback do Google OAuth
 *     tags: [Auth]
 *     description: Recebe código do Google e cria/autentica usuário
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de autorização do Google
 *     responses:
 *       302:
 *         description: Redirect para frontend com token JWT
 *       500:
 *         description: Erro no processo de autenticação
 */
router.get('/oauth/google/callback', async (req, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.name) {
      return res.status(400).json({ error: 'Failed to get user info' });
    }

    // Find or create user
    let user = await User.findOne({ email: data.email });

    if (!user) {
      user = new User({
        email: data.email,
        name: data.name,
        avatarUrl: data.picture,
        providers: [
          {
            provider: 'google',
            providerId: data.id!,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          },
        ],
      });
      await user.save();
    } else {
      // Update existing user with new tokens
      const googleProvider = user.providers.find((p) => p.provider === 'google');
      if (googleProvider) {
        googleProvider.accessToken = tokens.access_token;
        googleProvider.refreshToken = tokens.refresh_token;
      } else {
        user.providers.push({
          provider: 'google',
          providerId: data.id!,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });
      }
      await user.save();
    }

    const token = generateJWT(user._id.toString());

    // Redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user._id, email: user.email, name: user.name }))}`
    );
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
  }
});

// POST /auth/oauth/google - Método antigo (mock) para compatibilidade
router.post('/oauth/google', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Mock user para desenvolvimento
    const mockUser = {
      id: 'mock-user-id-123',
      email: 'user@example.com',
      name: 'Test User',
    };

    try {
      let user = await User.findOne({ email: mockUser.email });

      if (!user) {
        user = new User({
          email: mockUser.email,
          name: mockUser.name,
          providers: [
            {
              provider: 'google',
              providerId: 'mock-id',
            },
          ],
        });
        await user.save();
      }

      const token = generateJWT(user._id.toString());

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (dbError) {
      console.warn('Database not available - using mock authentication');

      const token = generateJWT(mockUser.id);

      res.json({
        token,
        user: mockUser,
      });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}); // POST /auth/logout
router.post('/logout', authenticateJWT, (req: AuthRequest, res: Response) => {
  // JWT-based auth doesn't require server-side logout
  // Client should discard the token
  res.json({ message: 'Logged out' });
});

export default router;
