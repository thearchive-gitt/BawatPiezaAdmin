import type { ReactNode } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import { StaffAccountsTab, UserAccountsTab } from "./accounts-tab";
import { DashboardShell } from "./dashboard-shell";
import { DataIssues } from "./dashboard-primitives";
import { DevicesTab } from "./devices-tab";
import { FirmwareTab } from "./firmware-tab";
import { MaintenanceTab } from "./maintenance-tab";
import { OverviewTab } from "./overview-tab";
import type { DashboardProps, DashboardTab } from "./types";

function getAdminTabContent(tab: DashboardTab, data: DashboardData, fullName: string) {
  const content: Record<DashboardTab, ReactNode> = {
    overview: <OverviewTab data={data} fullName={fullName} role="admin" />,
    devices: (
      <DevicesTab
        hubs={data.hubs}
        firmware={data.firmware}
        total={data.pairedDeviceCount}
      />
    ),
    firmware: <FirmwareTab firmware={data.firmware} />,
    staff: (
      <StaffAccountsTab
        accounts={data.businessAccounts}
        count={data.businessAccountCount}
      />
    ),
    customers: (
      <UserAccountsTab
        userAccounts={data.userAccounts}
        count={data.userAccountCount}
      />
    ),
    maintenance: (
      <MaintenanceTab
        data={data.health}
        maintenanceCount={data.maintenanceHubCount}
      />
    ),
  };

  return content[tab];
}

export function AdminDashboard({
  activeTab,
  data,
  email,
  fullName,
  profile,
}: DashboardProps) {
  return (
    <DashboardShell
      activeTab={activeTab}
      email={email}
      fullName={fullName}
      profile={profile}
      role="admin"
    >
      <DataIssues issues={data.issues} />
      {getAdminTabContent(activeTab, data, fullName)}
    </DashboardShell>
  );
}
