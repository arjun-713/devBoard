import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens';

const buildAuthResponse = (user: { id: string; email: string; name: string }, accessToken: string, refreshToken: string) => ({
  user: { id: user.id, email: user.email, name: user.name },
  accessToken,
  refreshToken,
});

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ email, passwordHash, name });
    
    const refreshToken = generateRefreshToken(user.id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    const accessToken = generateAccessToken(user.id);

    res.status(201).json(buildAuthResponse(user, accessToken, refreshToken));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json(buildAuthResponse(user, accessToken, refreshToken));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const demoLogin = async (_req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: 'demo@devboard.app' });
    if (!user) {
      return res.status(404).json({ message: 'Demo user not found. Run npm run seed:demo on the server.' });
    }

    const isMatch = await bcrypt.compare('demo1234', user.passwordHash);
    if (!isMatch) {
      return res.status(500).json({ message: 'Demo account credentials are invalid. Re-run npm run seed:demo.' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json(buildAuthResponse(user, accessToken, refreshToken));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
