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

/** Visits still treated as open/active (not completed or cancelled). */
export const ACTIVE_VISIT_STATUSES: VisitStatus[] = [
    'scheduled',
    'confirmed',
    'en_route',
    'on_site',
    'blocked',
];

export type UploadStatus = 'queued' | 'uploading' | 'uploaded' | 'failed';

export type AssetScanResult = 'match' | 'mismatch';

/** Capture, scan, and upload state for a visit (not on the schedule API model yet). */
export type MotionCheckResult = 'stable' | 'rough_motion_detected';

/** Motion + timestamp snapshot attached to evidence at capture */
export type MotionEvidenceMetadata = {
    capturedAt: string;
    motionResult?: MotionCheckResult;
    motionMaxDeviationG?: number;
};

export type VisitFieldState = {
    hasRequiredEvidenceCaptured?: boolean;
    evidencePhotoUri?: string;
    evidenceCapturedAt?: string;
    motionEvidenceMetadata?: MotionEvidenceMetadata;
    assetScanResult?: AssetScanResult;
    scannedAssetCode?: string;
    uploadStatus?: UploadStatus;
    motionResult?: MotionCheckResult;
    motionMaxDeviationG?: number;
    motionCheckCompletedAt?: string;
};

export type WorkboardContext = {
    visits: Record<string, VisitFieldState>;
};

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

export type VisitEvidence = {
    id: string;
    visitId: string;
    type: "arrival_photo" | "completion_photo" | "damage_photo";
    localUri: string;
    capturedAt: string; // ISO timestamp
    latitude?: number;
    longitude?: number;
    uploadStatus: UploadStatus;
};

export type AssetScan = {
    visitId: string;
    expectedAssetCode: string;
    scannedAssetCode: string;
    result: AssetScanResult;
    scannedAt: string; // ISO timestamp
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
export type DateScopeFilter = 'today' | 'next_7_days' | 'all';

export type EvidenceFilter =
    | 'missing_proof'
    | 'scan_mismatch'
    | 'ready_to_complete'
    | null;

export type WorkboardFilters = {
    searchQuery: string;
    workStatus: WorkStatus | 'all';
    dateScope: DateScopeFilter;
    evidenceFilter: EvidenceFilter;
};

export const DEFAULT_WORKBOARD_FILTERS: WorkboardFilters = {
    searchQuery: '',
    workStatus: 'all',
    dateScope: 'all',
    evidenceFilter: null,
};

// API types
export type FetchSitesResponse = {
    sites: ServiceSite[];
    fetchedAt: string;
};
