import jwt from 'jsonwebtoken';
import config from '../config';
import { ITokenPayload } from '../types';

// Generate access token
export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
};

// Verify access token
export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, config.jwt.secret) as ITokenPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): ITokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as ITokenPayload;
};

// Generate both tokens
export const generateTokens = (payload: ITokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
