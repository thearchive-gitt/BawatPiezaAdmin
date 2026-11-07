import { Suspense } from "react";
import { connection } from "next/server";
import {
  AdminDashboard,
  StaffDashboard,
} from "@/app/business/dashboard-ui";
import {
  getAdminDashboardData,
  getStaffDashboardData,
} from "@/lib/dashboard-data";
import { getActiveBusinessAccount } from "@/lib/business-auth";
import type { DashboardTab } from "@/app/business/components/types";

type BusinessPageProps = {
  searchParams: Promise<{ tab?: string | string[] }>;
};

function getAdminTab(tab: string | string[] | undefined): DashboardTab {
  if (typeof tab !== "string") return "overview";

  switch (tab) {
    case "devices":
    case "firmware":
    case "staff":
    case "customers":
    case "inventory":
    case "sales-customers":
    case "concerns":
    case "maintenance":
    case "overview":
      return tab;
    default:
      return "overview";
  }
}

function getStaffTab(
  tab: string | string[] | undefined,
): Extract<DashboardTab, "overview" | "devices" | "maintenance" | "concerns" | "sales-customers"> {
  if (tab === "devices" || tab === "maintenance" || tab === "overview" || tab === "concerns" || tab === "sales-customers") {
    return tab;
  }

  return "overview";
}

export default function BusinessPage({ searchParams }: BusinessPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f5f6f2] text-sm text-[#718078]">
          Loading your business dashboard...
        </main>
      }
    >
      <BusinessContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BusinessContent({ searchParams }: BusinessPageProps) {
  await connection();
  const { tab: requestedTab } = await searchParams;
  const account = await getActiveBusinessAccount();
  const fullName = [
    account.firstname,
    account.middlename,
    account.lastname,
  ]
    .filter(Boolean)
    .join(" ");
  const dashboardProps = {
    email: account.email,
    fullName,
    profile: {
      firstname: account.firstname,
      middlename: account.middlename,
      lastname: account.lastname,
      contactNo: account.contactNo,
    },
    role: account.role,
  };

  if (account.role === "admin") {
    const activeTab = getAdminTab(requestedTab);
    const data = await getAdminDashboardData();
    return (
      <AdminDashboard
        {...dashboardProps}
        activeTab={activeTab}
        data={data}
        role="admin"
        notifications={data.notifications}
      />
    );
  }

  const activeTab = getStaffTab(requestedTab);
  const data = await getStaffDashboardData(account.id);
  return (
    <StaffDashboard
      {...dashboardProps}
      activeTab={activeTab}
      data={data}
      role="staff"
      notifications={data.notifications}
    />
  );
}
