import type { DashboardData } from "@/lib/dashboard-data";

export type BusinessRole = "admin" | "staff";

export type DashboardTab =
  | "overview"
  | "devices"
  | "firmware"
  | "staff"
  | "customers"
  | "maintenance";

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
  };
  role: BusinessRole;
};
