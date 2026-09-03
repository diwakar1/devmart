import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
} from '../../../utils/jwt';
import config from '../../../config';
import type { ITokenPayload } from '../../../types';

jest.mock('jsonwebtoken');

describe('JWT Utils', () => {
  const mockPayload: ITokenPayload = {
    userId: 1,
    email: 'test@example.com',
    role: 'user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct config', () => {
      const mockToken = 'mock_access_token';
      (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      const token = generateAccessToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        config.jwt.secret,
        expect.objectContaining({
          expiresIn: config.jwt.expiresIn,
        })
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct config', () => {
      const mockToken = 'mock_refresh_token';
      (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      const token = generateRefreshToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        config.jwt.refreshSecret,
        expect.objectContaining({
          expiresIn: config.jwt.refreshExpiresIn,
        })
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode access token', () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockPayload);

      const decoded = verifyAccessToken('mock_token');

      expect(jwt.verify).toHaveBeenCalledWith('mock_token', config.jwt.secret);
      expect(decoded).toEqual(mockPayload);
    });

    it('should throw error if token is invalid', () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyAccessToken('invalid_token')).toThrow('Invalid token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode refresh token', () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockPayload);

      const decoded = verifyRefreshToken('mock_token');

      expect(jwt.verify).toHaveBeenCalledWith('mock_token', config.jwt.refreshSecret);
      expect(decoded).toEqual(mockPayload);
    });

    it('should throw error if token is expired', () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      expect(() => verifyRefreshToken('expired_token')).toThrow('Token expired');
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const mockAccessToken = 'mock_access_token';
      const mockRefreshToken = 'mock_refresh_token';

      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const tokens = generateTokens(mockPayload);

      expect(tokens).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
      expect(jwt.sign).toHaveBeenCalledTimes(2);
    });

    it('should call generateAccessToken and generateRefreshToken', () => {
      const mockAccessToken = 'mock_access_token';
      const mockRefreshToken = 'mock_refresh_token';

      (jwt.sign as jest.Mock)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const tokens = generateTokens(mockPayload);

      expect(tokens.accessToken).toBe(mockAccessToken);
      expect(tokens.refreshToken).toBe(mockRefreshToken);
    });
  });
});
