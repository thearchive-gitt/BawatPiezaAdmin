import "server-only";

import { createClient } from "@/lib/supabase/server";

type HubRow = {
  id: string;
  pairing_key: string;
  name: string | null;
  status: string;
  installed_tiles: number | null;
  owner_user_id: string | null;
  owner_email: string | null;
};

type FirmwareRow = {
  hub_id: string;
  user_id: string | null;
  fw_version: string | null;
  last_connected: string | null;
};

type HealthRow = {
  log_id: string;
  log_timestamp: string;
  log_level: string;
  description: string;
  hub_id: string;
};

type BusinessAccountRow = {
  id: string;
  firstname: string;
  middlename: string | null;
  lastname: string | null;
  email: string;
  role: "admin" | "staff";
  status: string;
  is_active: boolean;
};

type UserAccountRow = {
  id: string;
  firstname: string;
  middlename: string | null;
  lastname: string | null;
  email: string;
  contactNo: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
};

export type DashboardData = {
  hubs: HubRow[];
  hubCount: number | null;
  pairedDeviceCount: number | null;
  onlineHubCount: number | null;
  maintenanceHubCount: number | null;
  firmware: FirmwareRow[];
  businessAccounts: BusinessAccountRow[];
  businessAccountCount: number | null;
  userAccounts: UserAccountRow[];
  userAccountCount: number | null;
  health: HealthRow[];
  issues: string[];
};

function logQueryIssue(issues: string[], label: string, error: unknown) {
  console.error(`Dashboard could not load ${label}.`, error);
  issues.push(
    `${label} could not be loaded. Check that the table exists and this account has permission to read it.`,
  );
}

async function getAllDevicePairings(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const pairings: FirmwareRow[] = [];
  const pageSize = 1000;
  let count: number | null = null;
  let offset = 0;

  while (count === null || pairings.length < count) {
    const result = await supabase
      .from("device_pairings")
      .select("hub_id, user_id, fw_version, last_connected", {
        count: offset === 0 ? "exact" : undefined,
      })
      .order("last_connected", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (result.error) {
      return { data: null, count: null, error: result.error };
    }

    const page = (result.data ?? []) as FirmwareRow[];
    if (offset === 0) count = result.count;
    pairings.push(...page);

    if (page.length < pageSize || page.length === 0) break;
    offset += pageSize;
  }

  return {
    data: pairings,
    count: count ?? pairings.length,
    error: null,
  };
}

async function getHubsForPairings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  hubIds: string[],
) {
  const uniqueHubIds = [...new Set(hubIds)];
  const idBatches: string[][] = [];

  for (let index = 0; index < uniqueHubIds.length; index += 500) {
    idBatches.push(uniqueHubIds.slice(index, index + 500));
  }

  const results = await Promise.all(
    idBatches.map((ids) =>
      supabase
        .from("hubs")
        .select("id, name, status, installed_tiles")
        .in("id", ids),
    ),
  );
  const failedResult = results.find((result) => result.error);

  if (failedResult?.error) {
    return { data: null, error: failedResult.error };
  }

  return {
    data: results.flatMap((result) => result.data ?? []) as Array<
      Omit<HubRow, "owner_user_id" | "owner_email" | "pairing_key">
    >,
    error: null,
  };
}

async function getOwnerEmails(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerIds: string[],
) {
  const uniqueOwnerIds = [...new Set(ownerIds.filter(Boolean))];
  if (uniqueOwnerIds.length === 0) {
    return { data: new Map<string, string>(), error: null };
  }

  const result = await supabase
    .from("user_accounts")
    .select("id, email")
    .in("id", uniqueOwnerIds);

  if (result.error) {
    return { data: null, error: result.error };
  }

  return {
    data: new Map(
      (result.data ?? []).map((account) => [account.id, account.email]),
    ),
    error: null,
  };
}

function makePairedDeviceRows(
  pairings: FirmwareRow[],
  hubs: Array<
    Omit<HubRow, "owner_user_id" | "owner_email" | "pairing_key">
  >,
  ownerEmails: Map<string, string>,
): HubRow[] {
  const hubsById = new Map(hubs.map((hub) => [hub.id, hub]));

  return pairings.map((pairing) => {
    const hub = hubsById.get(pairing.hub_id);
    return {
      id: pairing.hub_id,
      pairing_key: [
        pairing.hub_id,
        pairing.user_id ?? "unowned",
        pairing.last_connected ?? "unknown",
        pairing.fw_version ?? "unknown",
      ].join(":"),
      name: hub?.name ?? null,
      status: hub?.status ?? "paired",
      installed_tiles: hub?.installed_tiles ?? null,
      owner_user_id: pairing.user_id,
      owner_email: pairing.user_id
        ? ownerEmails.get(pairing.user_id) ?? null
        : null,
    };
  });
}

function makeDashboardData(): DashboardData {
  return {
    hubs: [],
    hubCount: null,
    pairedDeviceCount: null,
    onlineHubCount: null,
    maintenanceHubCount: null,
    firmware: [],
    businessAccounts: [],
    businessAccountCount: null,
    userAccounts: [],
    userAccountCount: null,
    health: [],
    issues: [],
  };
}

async function getAllUserAccounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const userAccounts: UserAccountRow[] = [];
  const pageSize = 1000;
  let count: number | null = null;
  let offset = 0;

  while (count === null || userAccounts.length < count) {
    const result = await supabase
      .from("user_accounts")
      .select(
        "id, firstname, middlename, lastname, email, contactNo, status, is_active, created_at",
        { count: offset === 0 ? "exact" : undefined },
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (result.error) {
      return { data: null, count: null, error: result.error };
    }

    const page = (result.data ?? []) as UserAccountRow[];
    if (offset === 0) count = result.count;
    userAccounts.push(...page);

    if (page.length < pageSize || page.length === 0) break;
    offset += pageSize;
  }

  return {
    data: userAccounts,
    count: count ?? userAccounts.length,
    error: null,
  };
}

async function getAllBusinessAccounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const businessAccounts: BusinessAccountRow[] = [];
  const pageSize = 1000;
  let count: number | null = null;
  let offset = 0;

  while (count === null || businessAccounts.length < count) {
    const result = await supabase
      .from("business_accounts")
      .select(
        "id, firstname, middlename, lastname, email, role, status, is_active",
        { count: offset === 0 ? "exact" : undefined },
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (result.error) {
      return { data: null, count: null, error: result.error };
    }

    const page = (result.data ?? []) as BusinessAccountRow[];
    if (offset === 0) count = result.count;
    businessAccounts.push(...page);

    if (page.length < pageSize || page.length === 0) break;
    offset += pageSize;
  }

  return {
    data: businessAccounts,
    count: count ?? businessAccounts.length,
    error: null,
  };
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const [
    hubResult,
    onlineHubResult,
    maintenanceHubResult,
    staffResult,
    userAccountsResult,
    firmwareResult,
    healthResult,
  ] = await Promise.all([
    supabase
      .from("hubs")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("hubs")
      .select("id", { count: "exact", head: true })
      .eq("status", "online"),
    supabase
      .from("hubs")
      .select("id", { count: "exact", head: true })
      .eq("status", "maintenance"),
    getAllBusinessAccounts(supabase),
    getAllUserAccounts(supabase),
    getAllDevicePairings(supabase),
    supabase
      .from("system_health_logs")
      .select("log_id, log_timestamp, log_level, description, hub_id")
      .order("log_timestamp", { ascending: false })
      .limit(5),
  ]);

  const dashboard = makeDashboardData();

  if (hubResult.error) {
    logQueryIssue(dashboard.issues, "the device register", hubResult.error);
  } else {
    dashboard.hubCount = hubResult.count ?? 0;
  }

  if (onlineHubResult.error) {
    logQueryIssue(dashboard.issues, "online device totals", onlineHubResult.error);
  } else {
    dashboard.onlineHubCount = onlineHubResult.count ?? 0;
  }

  if (maintenanceHubResult.error) {
    logQueryIssue(
      dashboard.issues,
      "maintenance device totals",
      maintenanceHubResult.error,
    );
  } else {
    dashboard.maintenanceHubCount = maintenanceHubResult.count ?? 0;
  }

  if (staffResult.error) {
    logQueryIssue(dashboard.issues, "the staff directory", staffResult.error);
  } else {
    dashboard.businessAccounts =
      (staffResult.data ?? []) as BusinessAccountRow[];
    dashboard.businessAccountCount = staffResult.count ?? 0;
  }

  if (userAccountsResult.error) {
    logQueryIssue(
      dashboard.issues,
      "the customer directory",
      userAccountsResult.error,
    );
  } else {
    dashboard.userAccounts = userAccountsResult.data;
    dashboard.userAccountCount = userAccountsResult.count;
  }

  if (firmwareResult.error) {
    logQueryIssue(
      dashboard.issues,
      "the device pairings",
      firmwareResult.error,
    );
    dashboard.firmware = [];
  } else {
    dashboard.pairedDeviceCount = firmwareResult.count;
    dashboard.firmware = firmwareResult.data;
    const hubsResult = await getHubsForPairings(
      supabase,
      firmwareResult.data.map((pairing) => pairing.hub_id),
    );
    const ownerEmailsResult = await getOwnerEmails(
      supabase,
      firmwareResult.data.flatMap((pairing) =>
        pairing.user_id ? [pairing.user_id] : [],
      ),
    );

    if (ownerEmailsResult.error) {
      logQueryIssue(
        dashboard.issues,
        "device owner emails",
        ownerEmailsResult.error,
      );
    }

    if (hubsResult.error) {
      logQueryIssue(dashboard.issues, "the paired device records", hubsResult.error);
      dashboard.hubs = makePairedDeviceRows(
        firmwareResult.data,
        [],
        ownerEmailsResult.data ?? new Map(),
      );
    } else {
      dashboard.hubs = makePairedDeviceRows(
        firmwareResult.data,
        hubsResult.data,
        ownerEmailsResult.data ?? new Map(),
      );
    }
  }

  if (healthResult.error) {
    logQueryIssue(dashboard.issues, "system health alerts", healthResult.error);
  } else {
    dashboard.health = (healthResult.data ?? []) as HealthRow[];
  }

  return dashboard;
}

export async function getStaffDashboardData(
  userId: string,
): Promise<DashboardData> {
  const supabase = await createClient();
  const dashboard = makeDashboardData();

  const [ownedResult, sharedResult] = await Promise.all([
    supabase.from("device_pairings").select("hub_id").eq("user_id", userId),
    supabase.from("device_access").select("hub_id").eq("user_id", userId),
  ]);

  const hubIds = new Set<string>();

  if (ownedResult.error) {
    logQueryIssue(dashboard.issues, "your assigned devices", ownedResult.error);
  } else {
    for (const row of ownedResult.data ?? []) hubIds.add(row.hub_id);
  }

  if (sharedResult.error) {
    logQueryIssue(dashboard.issues, "your authorized devices", sharedResult.error);
  } else {
    for (const row of sharedResult.data ?? []) hubIds.add(row.hub_id);
  }

  const assignedHubIds = [...hubIds];
  if (assignedHubIds.length === 0) {
    dashboard.hubCount = 0;
    dashboard.pairedDeviceCount = 0;
    dashboard.onlineHubCount = 0;
    return dashboard;
  }

  const [
    hubResult,
    onlineHubResult,
    pairingResult,
    healthResult,
  ] = await Promise.all([
    supabase
      .from("hubs")
      .select("id, name, status, installed_tiles", { count: "exact" })
      .in("id", assignedHubIds)
      .limit(100),
    supabase
      .from("hubs")
      .select("id", { count: "exact", head: true })
      .in("id", assignedHubIds)
      .eq("status", "online"),
    supabase
      .from("device_pairings")
      .select("hub_id, user_id, fw_version, last_connected")
      .in("hub_id", assignedHubIds),
    supabase
      .from("system_health_logs")
      .select("log_id, log_timestamp, log_level, description, hub_id")
      .in("hub_id", assignedHubIds)
      .order("log_timestamp", { ascending: false })
      .limit(5),
  ]);

  if (hubResult.error) {
    logQueryIssue(dashboard.issues, "your assigned device status", hubResult.error);
  }

  if (pairingResult.error) {
    logQueryIssue(dashboard.issues, "your device firmware", pairingResult.error);
    dashboard.hubs = ((hubResult.data ?? []) as Array<
      Omit<HubRow, "owner_user_id" | "owner_email" | "pairing_key">
    >).map((hub) => ({
      ...hub,
      pairing_key: `${hub.id}:unavailable`,
      owner_user_id: null,
      owner_email: null,
    }));
  } else {
    dashboard.firmware = pairingResult.data ?? [];
    dashboard.pairedDeviceCount = dashboard.firmware.length;
    const ownerEmailsResult = await getOwnerEmails(
      supabase,
      dashboard.firmware.flatMap((pairing) =>
        pairing.user_id ? [pairing.user_id] : [],
      ),
    );
    if (ownerEmailsResult.error) {
      logQueryIssue(
        dashboard.issues,
        "device owner emails",
        ownerEmailsResult.error,
      );
    }
    dashboard.hubs = makePairedDeviceRows(
      dashboard.firmware,
      (hubResult.data ?? []) as Array<
        Omit<HubRow, "owner_user_id" | "owner_email" | "pairing_key">
      >,
      ownerEmailsResult.data ?? new Map(),
    );
  }
  dashboard.hubCount = dashboard.hubs.length;

  if (onlineHubResult.error) {
    logQueryIssue(dashboard.issues, "your online device total", onlineHubResult.error);
  } else {
    dashboard.onlineHubCount = onlineHubResult.count ?? 0;
  }

  if (healthResult.error) {
    logQueryIssue(dashboard.issues, "your device health logs", healthResult.error);
  } else {
    dashboard.health = (healthResult.data ?? []) as HealthRow[];
  }

  return dashboard;
}
