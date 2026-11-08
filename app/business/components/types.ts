import type { DashboardData } from "@/lib/dashboard-data";

export type BusinessRole = "admin" | "staff";

export type DashboardTab =
  | "overview"
  | "devices"
  | "firmware"
  | "mobile-updates"
  | "staff"
  | "customers"
  | "inventory"
  | "sales-customers"
  | "delivery-map"
  | "concerns"
  | "maintenance"
  | "notifications";

export type DashboardProps = {
  activeTab: DashboardTab;
  data: DashboardData;
  email: string;
  fullName: string;
  profile: {
    firstname: string;
    middlename: string | null;
    lastname: string | null;
    contactNo: string | null;
    avatar_url: string | null;
  };
  role: BusinessRole;
  notifications: DashboardData["notifications"];
};
