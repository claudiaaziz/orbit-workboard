import type { ServiceVisit, WorkboardContext } from '../types';
import { getVisitFieldState } from './workboardContext';
import { getAvailableVisitActions, type VisitActionItem } from './visitActions';
import {
    formatLastUpdated,
    formatVisitTimeWindow,
} from './utils/formatters';

export type VisitChecklistItem = {
    label: string;
    status: 'complete' | 'pending' | 'not_required';
    detail: string;
};

export type VisitDetailModel = {
    visitId: string;
    equipmentLabel: string;
    statusLabel: string;
    serviceTypeLabel: string;
    scheduledWindowLabel: string;
    assignedTechLabel: string | null;
    issueOrBlockedLabel: string | null;
    lastUpdatedLabel: string;
    evidenceRequired: boolean;
    evidencePhotoUri: string | null;
    evidenceCapturedAtLabel: string | null;
    evidenceChecklist: VisitChecklistItem[];
    assetScanLabel: string;
    motionCheckLabel: string;
    uploadStatusLabel: string;
    availableActions: VisitActionItem[];
};

// Checklist builders
function buildEvidenceChecklist(
    visit: ServiceVisit,
    context: WorkboardContext,
): VisitChecklistItem[] {
    if (!visit.evidenceRequired) {
        return [
            {
                label: 'Photo evidence',
                status: 'not_required',
                detail: 'Not required for this visit',
            },
        ];
    }

    const captured = getVisitFieldState(context, visit.id).hasRequiredEvidenceCaptured === true;

    return [
        {
            label: 'Photo evidence',
            status: captured ? 'complete' : 'pending',
            detail: captured ? 'Required photo captured' : 'Arrival or completion photo still needed',
        },
    ];
}

function buildAssetScanLabel(visit: ServiceVisit, context: WorkboardContext): string {
    const scanResult = getVisitFieldState(context, visit.id).assetScanResult;

    if (scanResult === 'match') {
        return `Asset verified — matches ${visit.expectedAssetCode}`;
    }

    if (scanResult === 'mismatch') {
        return 'Scan mismatch — scanned asset does not match expected code';
    }

    return `Not scanned yet — expected ${visit.expectedAssetCode}`;
}

function buildMotionCheckLabel(visit: ServiceVisit, context: WorkboardContext): string {
    if (!visit.motionCheckRequired) {
        return 'Not required for this visit';
    }

    const motionResult = getVisitFieldState(context, visit.id).motionResult;

    if (motionResult === 'stable') {
        return 'Motion check complete — handling stable';
    }

    if (motionResult === 'rough_motion_detected') {
        return 'Motion check complete — rough handling detected';
    }

    return 'Motion check not completed yet';
}

function buildUploadStatusLabel(visit: ServiceVisit, context: WorkboardContext): string {
    const uploadStatus = getVisitFieldState(context, visit.id).uploadStatus;

    if (!uploadStatus) {
        return 'No evidence uploads yet';
    }

    if (uploadStatus === 'queued') {
        return 'Evidence upload queued';
    }

    if (uploadStatus === 'uploading') {
        return 'Evidence upload in progress';
    }

    if (uploadStatus === 'uploaded') {
        return 'Evidence uploaded successfully';
    }

    return 'Evidence upload failed — retry when back online';
}

function buildIssueOrBlockedLabel(visit: ServiceVisit): string | null {
    if (visit.blockedReason) {
        return visit.blockedReason;
    }

    if (visit.issueSummary) {
        return visit.issueSummary;
    }

    return null;
}

// Public API
export function buildVisitDetailModel(
    visit: ServiceVisit,
    context: WorkboardContext,
): VisitDetailModel {
    const fieldState = getVisitFieldState(context, visit.id);
    const evidencePhotoUri = fieldState.evidencePhotoUri ?? null;

    return {
        visitId: visit.id,
        equipmentLabel: visit.equipmentLabel,
        statusLabel: visit.status.replaceAll('_', ' '),
        serviceTypeLabel: visit.serviceType.replace('_', ' '),
        scheduledWindowLabel: formatVisitTimeWindow(
            visit.scheduledStart,
            visit.scheduledEnd,
        ),
        assignedTechLabel: visit.assignedTech ?? null,
        issueOrBlockedLabel: buildIssueOrBlockedLabel(visit),
        lastUpdatedLabel: formatLastUpdated(visit.lastUpdatedAt),
        evidenceRequired: visit.evidenceRequired,
        evidencePhotoUri,
        evidenceCapturedAtLabel: fieldState.evidenceCapturedAt
            ? formatLastUpdated(fieldState.evidenceCapturedAt)
            : null,
        evidenceChecklist: buildEvidenceChecklist(visit, context),
        assetScanLabel: buildAssetScanLabel(visit, context),
        motionCheckLabel: buildMotionCheckLabel(visit, context),
        uploadStatusLabel: buildUploadStatusLabel(visit, context),
        availableActions: getAvailableVisitActions(visit, context),
    };
}
