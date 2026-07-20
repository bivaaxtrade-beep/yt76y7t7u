import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/auth-server.ts';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  req.user = decoded;
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
