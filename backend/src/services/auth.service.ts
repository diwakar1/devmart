import bcrypt from 'bcrypt';
import db from '../config/database';
import { IUser, IRefreshToken, ITokenPayload, RegisterRequest, UpdateProfileRequest, User } from '../types';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { sanitizeUser } from '../utils/helpers';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/ApiError';

class AuthService {
  // Register a new user
  async register(data: RegisterRequest) {
    // Check if user already exists
    const existing = await db.queryOne<IUser>(
      'SELECT id FROM users WHERE email = ?',
      [data.email]
    );

    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 12);

    // Create user
    const result = await db.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [data.email, password_hash, data.first_name, data.last_name, data.phone || null]
    );

    // Get the created user
    const user = await db.queryOne<IUser>(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate tokens
    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    // Store refresh token in DB (same as login, but no IP/userAgent at registration)
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);
    await db.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [user.id, tokens.refreshToken, refreshTokenExpiry]
    );

    return {
      user: sanitizeUser(user as User),
      tokens,
    };
  }

  // Login
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Find user by email
    const user = await db.queryOne<IUser>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    // Store refresh token in DB
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await db.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id, tokens.refreshToken, refreshTokenExpiry, ipAddress || null, userAgent || null]
    );

    // Update last login
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    return {
      user: sanitizeUser(user as User),
      tokens,
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    // Verify the refresh token JWT
    let decoded: ITokenPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if token exists in DB and is not revoked
    const storedToken = await db.queryOne<IRefreshToken>(
      'SELECT * FROM refresh_tokens WHERE token = ? AND is_revoked = FALSE AND expires_at > NOW()',
      [refreshToken]
    );

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token is invalid or expired');
    }

    // Get the user
    const user = await db.queryOne<IUser>(
      'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (!user) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    // Revoke old refresh token
    await db.execute(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = ?',
      [storedToken.id]
    );

    // Generate new tokens
    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    // Store new refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await db.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, tokens.refreshToken, refreshTokenExpiry]
    );

    return { tokens };
  }

  // Logout - revoke refresh token
  async logout(refreshToken: string) {
    await db.execute(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = ?',
      [refreshToken]
    );
  }

  // Logout from all devices
  async logoutAll(userId: number) {
    await db.execute(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?',
      [userId]
    );
  }

  // Get profile
  async getProfile(userId: number) {
    const user = await db.queryOne<IUser>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return sanitizeUser(user as User);
  }

  // Update profile
  async updateProfile(userId: number, data: UpdateProfileRequest) {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.first_name) {
      fields.push('first_name = ?');
      values.push(data.first_name);
    }
    if (data.last_name) {
      fields.push('last_name = ?');
      values.push(data.last_name);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }

    if (fields.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    values.push(userId);
    await db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.getProfile(userId);
  }

  // Change password
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await db.queryOne<IUser>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

    // Revoke all refresh tokens for security
    await this.logoutAll(userId);
  }
}

export default new AuthService();
