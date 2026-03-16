import { NotificationType } from '../enums';

// ============================================
// Notification Model
// ============================================

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
