import "server-only";

import { backendFetch } from "@/lib/backend-api";

export type DashboardData = {
  hubs: Array<{
    id: string;
    pairing_key: string;
    name: string | null;
    status: string;
    installed_tiles: number | null;
    owner_user_id: string | null;
    owner_email: string | null;
  }>;
  hubCount: number | null;
  pairedDeviceCount: number | null;
  onlineHubCount: number | null;
  maintenanceHubCount: number | null;
  firmware: Array<{
    hub_id: string;
    user_id: string | null;
    fw_version: string | null;
    last_connected: string | null;
  }>;
  mobileAppUpdates: Array<{
    id: string;
    version: string;
    platform: "android" | "ios" | "both";
    download_url: string;
    release_notes: string | null;
    status: "draft" | "active" | "paused";
    created_at: string;
  }>;
  businessAccounts: Array<{
    id: string;
    firstname: string;
    middlename: string | null;
    lastname: string;
    email: string;
    role: "admin" | "staff";
    status: string;
    is_active: boolean;
    avatar_url: string | null;
  }>;
  businessAccountCount: number | null;
  userAccounts: Array<{
    id: string;
    firstname: string;
    middlename: string | null;
    lastname: string;
    email: string;
    contactNo: string | null;
    status: string;
    is_active: boolean;
    avatar_url: string | null;
    created_at: string;
  }>;
  userAccountCount: number | null;
  health: Array<{
    log_id: string;
    log_timestamp: string;
    log_level: string;
    description: string;
    hub_id: string;
  }>;
  concerns: Array<{
    id: string;
    created_at: string;
    name: string;
    email: string;
    message: string;
    status: "unread" | "in_progress" | "resolved";
    avatar_url: string | null;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
  }>;
  sales: {
    revenue: number;
    orderCount: number;
    trend: Array<{
      date: string;
      label: string;
      revenue: number;
      orders: number;
    }>;
    customers: Array<{
      id: string;
      created_at: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
      landmark: string;
      region: string;
      regionCode: string | null;
      province: string;
      provinceCode: string | null;
      cityCode: string | null;
      barangay: string;
      barangayCode: string | null;
      latitude: number | null;
      longitude: number | null;
      distanceKm: number | null;
      locationSource: "device" | "address" | null;
      locationAccuracyMeters: number | null;
      avatar_url: string | null;
      items: Array<{ name: string; quantity: number }>;
      total: number;
      paymentMethod: "Cash on delivery" | "GCash";
      orderStatus: string;
      deliveryStatus: "received" | "preparing" | "pickup" | "delivered" | "cancelled";
      paymentStatus: "Pending" | "Paid" | "Failed";
    }>;
    recentOrders: Array<{
      id: string;
      created_at: string;
      total: number;
      status: string;
    }>;
  };
  storeProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
  }>;
  issues: string[];
};

type DashboardResponse = {
  dashboard: Omit<DashboardData, "sales" | "concerns"> & {
    concerns?: DashboardData["concerns"];
    sales?: Partial<DashboardData["sales"]>;
  };
};

function normalizeDashboard(body: DashboardResponse): DashboardData {
  const sales = body.dashboard.sales;
  return {
    ...body.dashboard,
    mobileAppUpdates: body.dashboard.mobileAppUpdates ?? [],
    concerns: body.dashboard.concerns ?? [],
    notifications: body.dashboard.notifications ?? [],
    sales: {
      revenue: sales?.revenue ?? 0,
      orderCount: sales?.orderCount ?? 0,
      trend: sales?.trend ?? [],
      recentOrders: sales?.recentOrders ?? [],
      customers: sales?.customers ?? [],
    },
  };
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  const response = await backendFetch("/api/v1/admin/dashboard");
  const body = (await response.json()) as DashboardResponse;
  return normalizeDashboard(body);
}

export async function getStaffDashboardData(
  userId: string,
): Promise<DashboardData> {
  void userId;
  const response = await backendFetch("/api/v1/admin/dashboard");
  const body = (await response.json()) as DashboardResponse;
  return normalizeDashboard(body);
}
