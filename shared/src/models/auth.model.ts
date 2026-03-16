import { UserRole } from '../enums';

// ============================================
// Auth Models
// ============================================

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
  is_revoked: boolean;
  ip_address: string | null;
  user_agent: string | null;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
