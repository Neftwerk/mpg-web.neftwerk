import { API_ENDPOINTS } from "./api";
import { authedFetch, type ApiResponse } from "./auth-service";

// ─── Types ───

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  unreadCount: number;
}

// ─── Endpoints ───

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export async function getNotifications(
  params: ListNotificationsParams = {}
): Promise<ApiResponse<NotificationListResponse>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.unreadOnly !== undefined) query.set("unreadOnly", String(params.unreadOnly));

  const qs = query.toString();
  const url = `${API_ENDPOINTS.NOTIFICATIONS.LIST}${qs ? `?${qs}` : ""}`;
  return authedFetch<NotificationListResponse>(url, { method: "GET" });
}

export async function markNotificationAsRead(id: string): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.NOTIFICATIONS.READ(id), { method: "PATCH" });
}

export async function markAllNotificationsAsRead(): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, { method: "PATCH" });
}

export async function deleteNotification(id: string): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.NOTIFICATIONS.DELETE(id), { method: "DELETE" });
}

export async function deleteAllNotifications(): Promise<ApiResponse<unknown>> {
  return authedFetch(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL, { method: "DELETE" });
}
