import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';

export interface AuthRequest extends Request {
  user?: { id: string };
}

/**
 * Validates bearer access tokens and attaches the decoded user id to `req.user`.
 * Returns 401 for invalid tokens and 403 for expired tokens.
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};
