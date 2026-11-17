"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { getActiveBusinessAccount } from "@/lib/business-auth";
import { backendFetch } from "@/lib/backend-api";
import { createClient } from "@/lib/supabase/server";

export type SiteAssessmentActionState = { error?: string; success?: string } | null;

const PAYMENT_QR_BUCKET = "site-assessment-payment-qr";
const DELIVERY_STATUSES = [
  "not_started",
  "preparing",
  "fabrication",
  "ready_for_delivery",
  "in_transit",
  "installation",
  "completed",
] as const;

function getText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function uploadSiteAssessmentPaymentQr(
  _previousState: SiteAssessmentActionState,
  formData: FormData,
): Promise<SiteAssessmentActionState> {
  const account = await getActiveBusinessAccount();
  if (account.role !== "admin") return { error: "Only an admin can update the customer payment QR code." };
  const file = formData.get("qrImage");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a QR code image to upload." };
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensions[file.type];
  if (!extension || file.size > 5 * 1024 * 1024) {
    return { error: "Choose a JPG, PNG, or WebP QR code image smaller than 5 MB." };
  }

  const objectPath = `qr/${randomUUID()}.${extension}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(PAYMENT_QR_BUCKET)
    .upload(objectPath, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: `The QR code could not be uploaded: ${uploadError.message}` };

  try {
    await backendFetch("/api/v1/admin/site-assessment-payment-qr", {
      method: "PATCH",
      body: JSON.stringify({ objectPath }),
    });
  } catch (error) {
    const { error: cleanupError } = await supabase.storage.from(PAYMENT_QR_BUCKET).remove([objectPath]);
    if (cleanupError) console.error("Could not remove an unconfigured payment QR upload.", cleanupError);
    return { error: error instanceof Error ? error.message : "The payment QR code setting could not be saved." };
  }
  revalidatePath("/business");
  return { success: "The customer payment QR code was updated." };
}

export async function reviewSiteAssessmentDownpayment(
  _previousState: SiteAssessmentActionState,
  formData: FormData,
): Promise<SiteAssessmentActionState> {
  const account = await getActiveBusinessAccount();
  if (account.role !== "admin") return { error: "Only an admin can review downpayments." };
  const id = getText(formData, "assessmentId");
  const decision = getText(formData, "decision");
  const notes = getText(formData, "reviewNotes");
  if (!id || !["verified", "rejected"].includes(decision) || (decision === "rejected" && !notes)) {
    return { error: "Choose whether to verify or reject the payment and provide a reason when rejecting it." };
  }
  try {
    await backendFetch(`/api/v1/admin/site-assessments/${encodeURIComponent(id)}/downpayment-review`, {
      method: "PATCH",
      body: JSON.stringify({ decision, notes }),
    });
    revalidatePath("/business");
    return { success: decision === "verified" ? "Downpayment verified and quotation accepted." : "Payment proof rejected. The customer was notified." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The downpayment review could not be saved." };
  }
}

export async function reviewSiteAssessmentBalancePayment(
  _previousState: SiteAssessmentActionState,
  formData: FormData,
): Promise<SiteAssessmentActionState> {
  const account = await getActiveBusinessAccount();
  if (account.role !== "admin") return { error: "Only an admin can review balance payments." };
  const id = getText(formData, "assessmentId");
  const decision = getText(formData, "decision");
  const notes = getText(formData, "reviewNotes");
  if (!id || !["verified", "rejected"].includes(decision) || (decision === "rejected" && !notes)) {
    return { error: "Choose whether to verify or reject the payment and provide a reason when rejecting it." };
  }
  try {
    await backendFetch(`/api/v1/admin/site-assessments/${encodeURIComponent(id)}/balance-payment-review`, {
      method: "PATCH",
      body: JSON.stringify({ decision, notes }),
    });
    revalidatePath("/business");
    return { success: decision === "verified" ? "Balance payment verified." : "Balance payment proof rejected. The customer was notified." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The balance payment review could not be saved." };
  }
}

export async function updateProjectDeliveryProgress(
  _previousState: SiteAssessmentActionState,
  formData: FormData,
): Promise<SiteAssessmentActionState> {
  const account = await getActiveBusinessAccount();
  if (account.role !== "admin" && account.role !== "staff") {
    return { error: "Only staff or an admin can update project delivery progress." };
  }
  const id = getText(formData, "assessmentId");
  const deliveryStatus = getText(formData, "deliveryStatus");
  const expectedAt = getText(formData, "expectedAt");
  const notes = getText(formData, "deliveryNotes");
  if (!id || !DELIVERY_STATUSES.some((status) => status === deliveryStatus)) {
    return { error: "Choose a valid project delivery status." };
  }
  if (notes.length > 2000) return { error: "Delivery notes must be 2000 characters or fewer." };
  try {
    await backendFetch(`/api/v1/admin/site-assessments/${encodeURIComponent(id)}/delivery-progress`, {
      method: "PATCH",
      body: JSON.stringify({
        deliveryStatus,
        expectedAt: expectedAt || null,
        notes,
      }),
    });
    revalidatePath("/business");
    return { success: "Project progress updated and the customer was notified." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Project delivery progress could not be updated." };
  }
}

export async function reviewSiteAssessment(
  _previousState: SiteAssessmentActionState,
  formData: FormData,
): Promise<SiteAssessmentActionState> {
  const account = await getActiveBusinessAccount();
  if (account.role !== "admin") return { error: "Only an admin can review assessment requests." };
  const id = getText(formData, "assessmentId");
  const status = getText(formData, "status");
  const assessorId = getText(formData, "assessorId");
  if (!id || !["pending", "accepted", "declined"].includes(status)) {
    return { error: "Choose a valid assessment decision." };
  }
  try {
    await backendFetch(`/api/v1/admin/site-assessments/${encodeURIComponent(id)}/review`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        assessorId: assessorId || null,
        adminNotes: getText(formData, "adminNotes"),
      }),
    });
    revalidatePath("/business");
    return { success: "Assessment review saved and the client was notified." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The assessment review could not be saved." };
  }
}

export async function issueProjectQuotation(
  _previousState: SiteAssessmentActionState,
  formData: FormData,
): Promise<SiteAssessmentActionState> {
  const account = await getActiveBusinessAccount();
  if (account.role !== "admin") return { error: "Only an admin can issue project quotations." };
  const id = getText(formData, "assessmentId");
  const amount = (name: string) => {
    const raw = getText(formData, name);
    return raw === "" ? 0 : Number(raw);
  };
  const lineItems = [
    { description: "Tiles", amount: amount("tilesAmount") },
    { description: "Sandbox / tile housing fabrication", amount: amount("housingAmount") },
    { description: "Battery and storage components", amount: amount("batteryAmount") },
    { description: "Electrical and power conditioning components", amount: amount("electricalAmount") },
    { description: "Labor and fabrication", amount: amount("laborAmount") },
    { description: "Installation", amount: amount("installationAmount") },
  ];
  if (lineItems.some((item) => !Number.isFinite(item.amount) || item.amount < 0)) {
    return { error: "Enter valid non-negative amounts for every quotation item." };
  }
  const quotation = {
    quotationNo: getText(formData, "quotationNo"),
    dateIssued: getText(formData, "dateIssued"),
    validUntil: getText(formData, "validUntil"),
    preparedBy: [account.firstname, account.lastname].filter(Boolean).join(" "),
    approvedBy: getText(formData, "approvedBy"),
    technicalSpecs: {
      tiles: getText(formData, "tiles"),
      housing: getText(formData, "housing"),
      batteryCapacity: getText(formData, "batteryCapacity"),
      batteryPercentage: getText(formData, "batteryPercentage"),
      batteryManagement: getText(formData, "batteryManagement"),
    },
    lineItems,
    timeline: {
      fabrication: getText(formData, "fabricationDuration"),
      installation: getText(formData, "installationDuration"),
      testing: getText(formData, "testingDuration"),
      total: getText(formData, "totalDuration"),
    },
    warrantyCoverage: getText(formData, "warrantyCoverage"),
    maintenanceSchedule: getText(formData, "maintenanceSchedule"),
    paymentTerms: getText(formData, "paymentTerms"),
  };
  if (!id) return { error: "The assessment reference is missing." };
  try {
    await backendFetch(`/api/v1/admin/site-assessments/${encodeURIComponent(id)}/quotation`, {
      method: "PATCH",
      body: JSON.stringify({ quotation }),
    });
    revalidatePath("/business");
    return { success: "Quotation sent to the client." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The quotation could not be sent." };
  }
}

export async function submitSiteEvaluation(
  _previousState: SiteAssessmentActionState,
  formData: FormData,
): Promise<SiteAssessmentActionState> {
  const account = await getActiveBusinessAccount();
  if (account.role !== "site_assessor") return { error: "Only an assigned site assessor can submit a report." };
  const id = getText(formData, "assessmentId");
  const recommendations = formData.getAll("recommendations").filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  const evaluation = {
    assessorName: [account.firstname, account.middlename, account.lastname].filter(Boolean).join(" "),
    inspectionDate: getText(formData, "inspectionDate"),
    inspectionTime: getText(formData, "inspectionTime"),
    tilesToPurchase: Number(getText(formData, "tilesToPurchase")),
    physicalEnvironment: {
      usableLength: getText(formData, "usableLength"),
      usableWidth: getText(formData, "usableWidth"),
      area: getText(formData, "area"),
      floorMaterial: getText(formData, "floorMaterial"),
      floorCondition: getText(formData, "floorCondition"),
      slope: getText(formData, "slope"),
      rainExposure: getText(formData, "rainExposure"),
      drainage: getText(formData, "drainage"),
      sunExposure: getText(formData, "sunExposure"),
      obstructions: getText(formData, "obstructions"),
    },
    lighting: {
      installed: getText(formData, "lightsInstalled"),
      fixtures: getText(formData, "fixtures"),
      powerPerFixture: getText(formData, "powerPerFixture"),
      powerVerified: formData.get("powerVerified") === "on",
      totalLoad: getText(formData, "totalLoad"),
      operatingHours: getText(formData, "operatingHours"),
      schedule: getText(formData, "operatingSchedule"),
      dailyEnergyDemand: getText(formData, "dailyEnergyDemand"),
      assumptions: getText(formData, "energyAssumptions"),
      observations: getText(formData, "lightingObservations"),
    },
    electrical: {
      gridSupply: getText(formData, "gridSupply"),
      cableRouting: getText(formData, "cableRouting"),
      equipmentLocation: getText(formData, "equipmentLocation"),
      weatherProtection: getText(formData, "weatherProtection"),
      ventilation: getText(formData, "ventilation"),
      maintenanceAccess: getText(formData, "maintenanceAccess"),
      grounding: getText(formData, "grounding"),
      observations: getText(formData, "electricalObservations"),
    },
    feasibility: {
      physicalSpace: getText(formData, "physicalSpace"),
      pedestrianActivity: getText(formData, "pedestrianActivity"),
      exposureDrainage: getText(formData, "exposureDrainage"),
      lightingDemand: getText(formData, "lightingDemand"),
      equipmentLocation: getText(formData, "equipmentFeasibility"),
      safetyAccessibility: getText(formData, "safetyAccessibility"),
      evidence: getText(formData, "feasibilityEvidence"),
    },
    recommendations,
    signOff: {
      operationsRepresentative: [account.firstname, account.middlename, account.lastname].filter(Boolean).join(" "),
      date: getText(formData, "signOffDate"),
    },
  };
  if (!id) return { error: "The assessment reference is missing." };
  try {
    await backendFetch(`/api/v1/admin/site-assessments/${encodeURIComponent(id)}/site-report`, {
      method: "PATCH",
      body: JSON.stringify({ evaluation }),
    });
    revalidatePath("/business");
    return { success: "Technical evaluation submitted to the admin team." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The site evaluation could not be submitted." };
  }
}
