import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { generateToken, hashPassword, comparePassword } from '../lib/auth-server.ts';
import { get, run } from '../db/mysql-db.ts';
import { createAuditLog, logLogin } from '../lib/audit.ts';
import { requireAuth } from '../middleware/jwtAuth.ts';
import { mapUserForFrontend } from '../lib/user-utils.ts';
import logger from '../lib/logger.ts';

import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const googleClientId = process.env.GOOGLE_CLIENT_ID || '1060740495013-ej6stbt6coeb647f1epqcg2idiv5urg8.apps.googleusercontent.com';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!process.env.GOOGLE_CLIENT_ID || !googleClientSecret) {
  logger.warn('Google OAuth credentials missing or incomplete in environment variables. Google Login may fail during callback.');
}

const googleClient = new OAuth2Client(
  googleClientId,
  googleClientSecret
);

// Helper for generating unique UIDs
const generateUid = () => 'usr_' + Math.random().toString(36).substring(2, 15);

// 1. Local Registration
router.post('/register', 
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  validate,
  async (req, res) => {
    const { email, password, referralCode } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const uid = generateUid();
    const affiliateId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    let referredBy = null;
    if (referralCode) {
      const referrer = await get('SELECT uid FROM users WHERE referral_code = ?', [referralCode]);
      if (referrer) {
        referredBy = (referrer as any).uid;
      }
    }

    await run(
      `INSERT INTO users (uid, email, password, referral_code, referred_by_uid) 
       VALUES (?, ?, ?, ?, ?)`,
      [uid, email, hashedPassword, affiliateId, referredBy]
    );

    if (referredBy) {
      await run('UPDATE users SET referral_count = referral_count + 1 WHERE uid = ?', [referredBy]);
    }

    await createAuditLog(uid, 'register', 'user', uid, { email }, req.ip);
    logger.info(`New user registered: ${email}`);

    const user = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;

    const token = generateToken({ uid: user.uid, email: user.email, isAdmin: !!user.is_admin });

    res.json({ token, user: mapUserForFrontend(user) });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 2. Local Login
router.post('/login', 
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  async (req, res) => {
    const { email, password } = req.body;
  
  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]) as any;
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      await logLogin(user.uid, req.ip, req.headers['user-agent'], 'failed');
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    await logLogin(user.uid, req.ip, req.headers['user-agent'], 'success');
    logger.info(`User logged in: ${email}`);

    const token = generateToken({ uid: user.uid, email: user.email, isAdmin: !!user.is_admin });

    res.json({ token, user: mapUserForFrontend(user) });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3. Google OAuth URL
router.get('/google/url', (req, res) => {
  const host = req.get('host') || 'ais-dev-xze6kl4beokvjabfc2s6fr-883171138138.asia-east1.run.app';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    redirect_uri: redirectUri
  });
  res.json({ url });
});

// 4. Google OAuth Callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  const host = req.get('host') || 'ais-dev-xze6kl4beokvjabfc2s6fr-883171138138.asia-east1.run.app';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    const { tokens } = await googleClient.getToken({
      code: code as string,
      redirect_uri: redirectUri
    });
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) throw new Error('Invalid Google payload');

    let user = await get('SELECT * FROM users WHERE email = ?', [payload.email]) as any;

    if (!user) {
      const uid = generateUid();
      const affiliateId = Math.random().toString(36).substring(2, 8).toUpperCase();
      await run(
        `INSERT INTO users (uid, email, display_name, photo_url, referral_code) 
         VALUES (?, ?, ?, ?, ?)`,
        [uid, payload.email, payload.name, payload.picture, affiliateId]
      );
      user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
    }

    const token = generateToken({ uid: user.uid, email: user.email, isAdmin: !!user.is_admin });

    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'OAUTH_AUTH_SUCCESS',
              token: '${token}',
              user: ${JSON.stringify(mapUserForFrontend(user))}
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Google Callback Error:', err);
    res.status(500).send('Authentication failed');
  }
});

import { sendEmail } from '../lib/email.ts';

// 5. Forgot Password (Mock)
router.post('/forgot-password', 
  body('email').isEmail().normalizeEmail(),
  validate,
  async (req, res) => {
    const { email } = req.body;
    const user = await get('SELECT uid FROM users WHERE email = ?', [email]);
    if (user) {
      logger.info(`Password reset requested for: ${email}`);
      // Send reset email logic here if needed
      await sendEmail(email, 'Password Reset', 'You requested a password reset. Please contact support.');
    }
    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  }
);

// 6. Send OTP
router.post('/send-otp', async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP somewhere (e.g., in user record or cache). For simplicity, we just send it.
  const success = await sendEmail(
    email,
    'Your Verification Code',
    `<div style="font-family: sans-serif; max-w: 500px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
        <p style="color: #666; font-size: 16px;">Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #1a1b1f; letter-spacing: 5px; margin: 20px 0;">${otp}</div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
    </div>`
  );
  
  if (success) {
    res.json({ success: true, message: 'OTP sent successfully' });
  } else {
    res.status(500).json({ error: 'Failed to send OTP email. Please check SMTP configuration.' });
  }
});

// 7. Verify Email (Mock)
router.post('/verify-email', requireAuth, async (req: any, res: any) => {
  await run('UPDATE users SET is_verified = 1 WHERE uid = ?', [req.user.uid]);
  res.json({ success: true, message: 'Email verified successfully' });
});

export default router;
