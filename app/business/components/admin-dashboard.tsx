import type { ReactNode } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import { StaffAccountsTab, UserAccountsTab } from "./accounts-tab";
import { DashboardShell } from "./dashboard-shell";
import { DataIssues } from "./dashboard-primitives";
import { DevicesTab } from "./devices-tab";
import { FirmwareTab } from "./firmware-tab";
import { InventoryTab } from "./inventory-tab";
import { SalesCustomersTab } from "./sales-customers-tab";
import { UserConcernsTab } from "./user-concerns-tab";
import { MaintenanceTab } from "./maintenance-tab";
import { NotificationsPage } from "./notifications-page";
import { OverviewTab } from "./overview-tab";
import { DeliveryMapPage } from "./delivery-map-page";
import { MobileUpdatesTab } from "./mobile-updates-tab";
import type { DashboardProps, DashboardTab } from "./types";

function getAdminTabContent(tab: DashboardTab, data: DashboardData) {
  const content: Record<DashboardTab, ReactNode> = {
    overview: <OverviewTab data={data} role="admin" />,
    devices: (
      <DevicesTab
        hubs={data.hubs}
        firmware={data.firmware}
        total={data.pairedDeviceCount}
      />
    ),
    firmware: <FirmwareTab firmware={data.firmware} />,
    "mobile-updates": <MobileUpdatesTab updates={data.mobileAppUpdates} />,
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
    inventory: <InventoryTab products={data.storeProducts} sales={data.sales} />,
    "sales-customers": <SalesCustomersTab customers={data.sales.customers} />,
    "delivery-map": <DeliveryMapPage orders={data.sales.customers} />,
    concerns: <UserConcernsTab concerns={data.concerns} />,
    maintenance: (
      <MaintenanceTab
        data={data.health}
        maintenanceCount={data.maintenanceHubCount}
      />
    ),
    notifications: <NotificationsPage notifications={data.notifications} />,
  };

  return content[tab];
}

export function AdminDashboard({
  activeTab,
  data,
  email,
  fullName,
  profile,
  notifications,
}: DashboardProps) {
  return (
    <DashboardShell
      activeTab={activeTab}
      email={email}
      fullName={fullName}
      profile={profile}
      role="admin"
      notifications={notifications}
    >
      <DataIssues issues={data.issues} />
      {getAdminTabContent(activeTab, data)}
    </DashboardShell>
  );
}
