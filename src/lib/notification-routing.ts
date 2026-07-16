import type { Notification } from "./notification-service";

const CONVERSATION_NOTIFICATION_TYPES = new Set([
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

export function isConversationNotification(type: string): boolean {
  return CONVERSATION_NOTIFICATION_TYPES.has(type);
}

export function getNotificationHref(
  notification: Notification,
  role?: string,
): string | null {
  const meta = getNotificationMeta(notification);
  const type = notification.type;

  if (isConversationNotification(type)) {
    const enquiryId = meta?.enquiryId;
    if (typeof enquiryId !== "string" || !enquiryId) return null;
    if (role === "admin" || role === "super_admin") {
      return `/admin/enquiries/${enquiryId}`;
    }
    return `/messages/${enquiryId}`;
  }

  if (type === "sale_ready_to_mint" || type === "sale_minted") {
    return "/gallery";
  }

  if (
    type === "payment_successful" ||
    type === "payment_failed" ||
    type === "refund_issued" ||
    type === "card_saved" ||
    type === "subscription_charged" ||
    type === "payout_initiated" ||
    type === "payout_completed"
  ) {
    return null;
  }

  if (
    type === "support_ticket_created" ||
    type === "support_reply" ||
    type === "support_assigned" ||
    type === "support_status_changed"
  ) {
    return "/support";
  }

  return null;
}

export function isNotificationNavigable(
  notification: Notification,
  role?: string,
): boolean {
  return getNotificationHref(notification, role) !== null;
}
