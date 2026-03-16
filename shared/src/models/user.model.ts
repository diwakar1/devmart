import { UserRole } from '../enums';

// ============================================
// User Models
// ============================================

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  email_verification_token: string | null;
  password_reset_token: string | null;
  password_reset_expires: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

/** Safe user object without sensitive fields — returned to clients */
export interface UserPublic {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
}
