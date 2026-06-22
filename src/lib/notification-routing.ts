import type { Notification } from "./notification-service";

const ENQUIRY_NOTIFICATION_TYPES = new Set([
  "enquiry_created",
  "enquiry_message_new",
  "enquiry_admin_assigned",
  "enquiry_status_changed",
]);

function getNotificationMeta(
  notification: Notification,
): Record<string, unknown> | undefined {
  return notification.meta ?? notification.data;
}

export function getNotificationHref(
  notification: Notification,
  role?: string,
): string | null {
  if (!ENQUIRY_NOTIFICATION_TYPES.has(notification.type)) {
    return null;
  }

  const meta = getNotificationMeta(notification);
  const enquiryId = meta?.enquiryId;
  if (typeof enquiryId !== "string" || !enquiryId) {
    return null;
  }

  if (role === "admin" || role === "super_admin") {
    return `/admin/enquiries/${enquiryId}`;
  }

  return `/messages/${enquiryId}`;
}

export function isNotificationNavigable(
  notification: Notification,
  role?: string,
): boolean {
  return getNotificationHref(notification, role) !== null;
}
