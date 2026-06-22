import { API_ENDPOINTS } from "./api";
import { authedFetch, type ApiResponse } from "./auth-service";

// ─── Types ───

export interface Notification {
  _id: string;
  userId?: string;
  type: string;
  title: string;
  body?: string;
  message?: string;
  isRead: boolean;
  meta?: Record<string, unknown>;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function normalizeNotification(raw: Record<string, unknown>): Notification {
  const body =
    typeof raw.body === "string"
      ? raw.body
      : typeof raw.message === "string"
        ? raw.message
        : "";
  const meta =
    (raw.meta as Record<string, unknown> | undefined) ??
    (raw.data as Record<string, unknown> | undefined);

  return {
    _id: String(raw._id ?? ""),
    userId: raw.userId ? String(raw.userId) : undefined,
    type: String(raw.type ?? ""),
    title: String(raw.title ?? ""),
    body,
    message: body,
    isRead: Boolean(raw.isRead),
    meta,
    data: meta,
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
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
  const res = await authedFetch<unknown>(url, { method: "GET" });

  if (!res.ok) return res as ApiResponse<NotificationListResponse>;

  const payload = (res.data as { data?: NotificationListResponse }).data ?? res.data;
  const list = payload as NotificationListResponse;

  return {
    ...res,
    data: {
      ...list,
      notifications: (list.notifications ?? []).map((item) =>
        normalizeNotification(item as unknown as Record<string, unknown>),
      ),
    },
  };
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
