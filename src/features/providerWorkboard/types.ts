// Domain types
export type WorkStatus =
    | "needs_attention"
    | "scheduled"
    | "in_progress"
    | "blocked"
    | "completed";

export type VisitStatus =
    | "scheduled"
    | "confirmed"
    | "en_route"
    | "on_site"
    | "blocked"
    | "completed"
    | "cancelled";

export type ServiceType =
    | "inspection"
    | "repair"
    | "swap"
    | "pickup"
    | "delivery";

export type ServiceVisit = {
    id: string;
    siteId: string;
    status: VisitStatus;
    serviceType: ServiceType;
    scheduledStart: string; // ISO timestamp
    scheduledEnd: string; // ISO timestamp
    assignedTech?: string;
    equipmentLabel: string;
    expectedAssetCode: string;
    evidenceRequired: boolean;
    motionCheckRequired: boolean;
    locationRequired: boolean;
    issueSummary?: string;
    blockedReason?: string;
    lastUpdatedAt: string; // ISO timestamp
};

type VisitEvidence = {
    id: string;
    visitId: string;
    type: "arrival_photo" | "completion_photo" | "damage_photo";
    localUri: string;
    capturedAt: string; // ISO timestamp
    latitude?: number;
    longitude?: number;
    uploadStatus: "queued" | "uploading" | "uploaded" | "failed";
};

type AssetScan = {
    visitId: string;
    expectedAssetCode: string;
    scannedAssetCode: string;
    result: "match" | "mismatch";
    scannedAt: string; // ISO timestamp
};

type MotionSample = {
    visitId: string;
    startedAt: string; // ISO timestamp
    completedAt: string; // ISO timestamp
    maxAccelerationG: number;
    result: "stable" | "rough_motion_detected";
};

type ServiceAddress = {
    line1: string;
    city: string;
    region: string;
    postalCode: string;
};

export type ServicePriority = 'normal' | 'high' | 'urgent';

export type ServiceSite = {
    id: string;
    customerName: string;
    siteName: string;
    address: ServiceAddress;
    workStatus: WorkStatus;
    priority: ServicePriority;
    visits: ServiceVisit[];
    contactName: string;
    contactPhone: string;
};

// Filter types
type DateScopeFilter = 'today' | 'next_7_days' | 'all';

type EvidenceFilter =
    | 'missing_proof'
    | 'scan_mismatch'
    | 'ready_to_complete'
    | null;

type WorkboardFilters = {
    searchQuery: string;
    workStatus: WorkStatus | 'all';
    dateScope: DateScopeFilter;
    evidenceFilter: EvidenceFilter;
};

// API types
export type FetchSitesResponse = {
    sites: ServiceSite[];
    fetchedAt: string;
};
