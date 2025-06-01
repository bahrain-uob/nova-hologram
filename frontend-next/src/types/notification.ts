// Notification-related interfaces

// Basic notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  link?: string;
  data?: Record<string, any>;
}

// Notification types
export type NotificationType = 
  | 'system' 
  | 'achievement' 
  | 'reminder' 
  | 'recommendation' 
  | 'social' 
  | 'update';

// Notification preferences
export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    system: boolean;
    achievement: boolean;
    reminder: boolean;
    recommendation: boolean;
    social: boolean;
    update: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

// Notification batch for bulk operations
export interface NotificationBatch {
  notifications: Omit<Notification, 'id' | 'createdAt'>[];
  sendImmediately?: boolean;
}

// Notification statistics
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}
