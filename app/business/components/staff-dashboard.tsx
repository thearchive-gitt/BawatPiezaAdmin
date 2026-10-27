import type { ReactNode } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import { DashboardShell } from "./dashboard-shell";
import { DataIssues } from "./dashboard-primitives";
import { DevicesTab } from "./devices-tab";
import { MaintenanceTab } from "./maintenance-tab";
import { OverviewTab } from "./overview-tab";
import type { DashboardProps, DashboardTab } from "./types";

type StaffDashboardTab = Extract<
  DashboardTab,
  "overview" | "devices" | "maintenance"
>;

function getStaffTabContent(
  tab: StaffDashboardTab,
  data: DashboardData,
  fullName: string,
) {
  const content: Record<StaffDashboardTab, ReactNode> = {
    overview: <OverviewTab data={data} fullName={fullName} role="staff" />,
    devices: (
      <DevicesTab
        hubs={data.hubs}
        firmware={data.firmware}
        total={data.pairedDeviceCount}
        staffView
      />
    ),
    maintenance: <MaintenanceTab data={data.health} staffView />,
  };

  return content[tab];
}

export function StaffDashboard({
  activeTab,
  data,
  email,
  fullName,
  profile,
}: DashboardProps) {
  const staffTab: StaffDashboardTab =
    activeTab === "devices" || activeTab === "maintenance"
      ? activeTab
      : "overview";

  return (
    <DashboardShell
      activeTab={staffTab}
      email={email}
      fullName={fullName}
      profile={profile}
      role="staff"
    >
      <DataIssues issues={data.issues} />
      {getStaffTabContent(staffTab, data, fullName)}
    </DashboardShell>
  );
}
