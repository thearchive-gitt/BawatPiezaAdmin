import type { ReactNode } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import { DashboardShell } from "./dashboard-shell";
import { DataIssues } from "./dashboard-primitives";
import { DevicesTab } from "./devices-tab";
import { MaintenanceTab } from "./maintenance-tab";
import { OverviewTab } from "./overview-tab";
import { SalesCustomersTab } from "./sales-customers-tab";
import { UserConcernsTab } from "./user-concerns-tab";
import { NotificationsPage } from "./notifications-page";
import type { DashboardProps, DashboardTab } from "./types";

type StaffDashboardTab = Extract<
  DashboardTab,
  "overview" | "devices" | "maintenance" | "concerns" | "sales-customers"
  | "notifications"
>;

function getStaffTabContent(
  tab: StaffDashboardTab,
  data: DashboardData,
) {
  const content: Record<StaffDashboardTab, ReactNode> = {
    overview: <OverviewTab data={data} role="staff" />,
    devices: (
      <DevicesTab
        hubs={data.hubs}
        firmware={data.firmware}
        total={data.pairedDeviceCount}
        staffView
      />
    ),
    maintenance: <MaintenanceTab data={data.health} staffView />,
    concerns: <UserConcernsTab concerns={data.concerns} />,
    "sales-customers": <SalesCustomersTab customers={data.sales.customers} />,
    notifications: <NotificationsPage notifications={data.notifications} />,
  };

  return content[tab];
}

export function StaffDashboard({
  activeTab,
  data,
  email,
  fullName,
  profile,
  notifications,
}: DashboardProps) {
  const staffTab: StaffDashboardTab =
    activeTab === "devices" || activeTab === "maintenance"
      ? activeTab
      : activeTab === "sales-customers"
        ? activeTab
      : activeTab === "concerns"
        ? activeTab
        : activeTab === "notifications"
          ? activeTab
        : "overview";

  return (
    <DashboardShell
      activeTab={staffTab}
      email={email}
      fullName={fullName}
      profile={profile}
      role="staff"
      notifications={notifications}
    >
      <DataIssues issues={data.issues} />
      {getStaffTabContent(staffTab, data)}
    </DashboardShell>
  );
}
