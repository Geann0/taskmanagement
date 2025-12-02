import jwt, { SignOptions } from 'jsonwebtoken';

export const generateJWT = (userId: string, expiresIn?: string): string => {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiry = expiresIn || process.env.JWT_EXPIRES_IN || '7d';

  const options: SignOptions = { expiresIn: expiry as any };
  return jwt.sign({ userId }, secret, options);
};

export const verifyJWT = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {
    return null;
  }
};
