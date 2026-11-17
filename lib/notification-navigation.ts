import type { BusinessRole, DashboardTab } from "@/app/business/components/types";

type NotificationTarget = {
  type: string;
  entity_type: string | null;
};

export function getNotificationTab(
  notification: NotificationTarget,
  role: BusinessRole,
): DashboardTab {
  if (notification.entity_type === "site_assessment") return "site-assessments";
  if (notification.entity_type === "user_concern") return "concerns";
  if (notification.entity_type === "store_order") {
    if (role === "admin") return "sales";
    if (role === "staff") return "sales-customers";
  }
  return "notifications";
}
