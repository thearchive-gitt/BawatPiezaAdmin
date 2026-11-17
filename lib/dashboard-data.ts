import "server-only";

import { backendFetch } from "@/lib/backend-api";

export type SiteAssessmentProductInterest = {
  id: string;
  name: string;
  quantity: number;
};

export type SiteAssessment = {
  id: string;
  created_at: string;
  updated_at: string;
  customer_user_id: string;
  customer_info: Record<string, string>;
  installation_info: Record<string, string>;
  preferred_assessment_date: string;
  existing_led_lighting: string;
  additional_remarks: string | null;
  site_photos: string[];
  interested_products: SiteAssessmentProductInterest[];
  status: string;
  downpayment_status: "unpaid" | "pending" | "rejected" | "verified" | null;
  downpayment_amount: number | null;
  downpayment_reference: string | null;
  downpayment_proof_url: string | null;
  downpayment_customer_name: string | null;
  downpayment_customer_signature: string | null;
  downpayment_submitted_at: string | null;
  downpayment_reviewed_at: string | null;
  downpayment_review_notes: string | null;
  balance_payment_status: "unpaid" | "pending" | "rejected" | "verified" | null;
  balance_payment_amount: number | null;
  balance_payment_reference: string | null;
  balance_payment_proof_url: string | null;
  balance_payment_submitted_at: string | null;
  balance_payment_reviewed_at: string | null;
  balance_payment_review_notes: string | null;
  delivery_status: ProjectDeliveryStatus;
  delivery_expected_at: string | null;
  delivery_notes: string | null;
  delivery_updated_at: string | null;
  admin_notes: string | null;
  assigned_assessor_id: string | null;
  assessor_assigned_by: string | null;
  site_evaluation: Record<string, unknown> | null;
  quotation: Record<string, unknown> | null;
};

export type ProjectDeliveryStatus =
  | "not_started"
  | "preparing"
  | "fabrication"
  | "ready_for_delivery"
  | "in_transit"
  | "installation"
  | "completed";

export type SiteProject = {
  id: string;
  updated_at: string;
  customer_info: Record<string, string>;
  installation_info: Record<string, string>;
  status: string;
  quotation: Record<string, unknown>;
  downpayment_status: string;
  downpayment_amount: number | null;
  balance_payment_status: string;
  balance_payment_amount: number | null;
  delivery_status: ProjectDeliveryStatus;
  delivery_expected_at: string | null;
  delivery_notes: string | null;
  delivery_updated_at: string | null;
};

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
  siteAssessments: SiteAssessment[];
  siteProjects: SiteProject[];
  sitePaymentQrUrl: string | null;
  businessAccounts: Array<{
    id: string;
    firstname: string;
    middlename: string | null;
    lastname: string;
    email: string;
    role: "admin" | "staff" | "site_assessor";
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
    entity_type: string | null;
    entity_id: string | null;
    read_at: string | null;
    created_at: string;
  }>;
  sales: {
    revenue: number;
    orderCount: number;
    projectPayments: Array<{
      assessmentId: string;
      quotationNo: string;
      organization: string;
      amount: number;
      projectTotal: number;
      paidAt: string;
    }>;
    projectSales: Array<{
      assessmentId: string;
      createdAt: string;
      updatedAt: string;
      quotationNo: string;
      organization: string;
      quotationStatus: "quotation_sent" | "quotation_accepted";
      tiles: number | null;
      projectTotal: number;
      downpaymentAmount: number | null;
      downpaymentStatus: "unpaid" | "pending" | "rejected" | "verified";
      balanceRemaining: number;
      paymentReference: string | null;
      paidAt: string | null;
    }>;
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
    siteAssessments: (body.dashboard.siteAssessments ?? []) as SiteAssessment[],
    siteProjects: (body.dashboard.siteProjects ?? []) as SiteProject[],
    sitePaymentQrUrl: body.dashboard.sitePaymentQrUrl ?? null,
    concerns: body.dashboard.concerns ?? [],
    notifications: body.dashboard.notifications ?? [],
    sales: {
      revenue: sales?.revenue ?? 0,
      orderCount: sales?.orderCount ?? 0,
      projectPayments: sales?.projectPayments ?? [],
      projectSales: sales?.projectSales ?? [],
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
