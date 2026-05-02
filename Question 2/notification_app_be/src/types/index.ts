/**
 * Notification as returned by the evaluation server.
 */
export interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
  Category: string;
  Read: boolean;
}

/**
 * Raw API response from /evaluation-service/notifications.
 */
export interface NotificationsResponse {
  notifications: Notification[];
}

/**
 * Payload for the notify-all broadcast endpoint.
 */
export interface NotifyAllPayload {
  message: string;
  category: string;
  type: string;
}

/**
 * Response shape for the schedule endpoint.
 */
export interface NotifyAllResult {
  success: boolean;
  message: string;
  notifiedCount: number;
}
