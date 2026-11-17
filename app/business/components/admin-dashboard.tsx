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
import { SiteAssessmentsTab } from "./site-assessments-tab";
import { GcashSetupTab } from "./gcash-setup-tab";
import { SalesTab } from "./sales-tab";
import { ProjectDeliveryTab } from "./project-delivery-tab";
import type { DashboardProps, DashboardTab } from "./types";

function getAdminTabContent(tab: DashboardTab, data: DashboardData, fullName: string) {
  const unreadNotifications = data.notifications.filter((notification) => !notification.read_at);
  const newAssessmentIds = unreadNotifications.flatMap((notification) =>
    notification.entity_type === "site_assessment" && notification.entity_id
      ? [notification.entity_id]
      : [],
  );
  const newProjectSalesIds = unreadNotifications.flatMap((notification) =>
    notification.type === "site_assessment_downpayment_submitted" && notification.entity_id
      ? [notification.entity_id]
      : [],
  );
  const newOrderIds = unreadNotifications.flatMap((notification) =>
    notification.entity_type === "store_order" && notification.entity_id
      ? [notification.entity_id]
      : [],
  );
  const newConcernIds = unreadNotifications.flatMap((notification) =>
    notification.entity_type === "user_concern" && notification.entity_id
      ? [notification.entity_id]
      : [],
  );
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
    sales: (
      <SalesTab
        sales={data.sales.projectSales}
        orders={data.sales.customers}
        newProjectSalesIds={newProjectSalesIds}
        newOrderIds={newOrderIds}
      />
    ),
    "sales-customers": <SalesCustomersTab customers={data.sales.customers} />,
    "delivery-map": <DeliveryMapPage orders={data.sales.customers} />,
    concerns: <UserConcernsTab concerns={data.concerns} newConcernIds={newConcernIds} />,
    maintenance: (
      <MaintenanceTab
        data={data.health}
        maintenanceCount={data.maintenanceHubCount}
      />
    ),
    notifications: <NotificationsPage notifications={data.notifications} role="admin" />,
    "site-assessments": (
      <SiteAssessmentsTab
        assessments={data.siteAssessments}
        businessAccounts={data.businessAccounts}
        approvedByFallback={fullName}
        newAssessmentIds={newAssessmentIds}
      />
    ),
    "project-delivery": <ProjectDeliveryTab projects={data.siteProjects} />,
    "gcash-setup": <GcashSetupTab paymentQrUrl={data.sitePaymentQrUrl} />,
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
      {getAdminTabContent(activeTab, data, fullName)}
    </DashboardShell>
  );
}
