import { ACTIVE_VISIT_STATUSES, type ServiceVisit, type WorkboardContext } from '../../types';
import { getVisitFieldState } from '../workboardContext';

// Getters
export function getNextActiveVisit(
    visits: ServiceVisit[],
): ServiceVisit | undefined {
    return [...visits]
        .filter((visit) => ACTIVE_VISIT_STATUSES.includes(visit.status))
        .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))[0];
}

// Predicates
export function isVisitLate(visit: ServiceVisit, referenceDate: Date): boolean {
    if (visit.status === 'completed' || visit.status === 'cancelled') {
        return false;
    }

    return new Date(visit.scheduledEnd).getTime() < referenceDate.getTime();
}

export function visitMissingRequiredEvidence(
    visit: ServiceVisit,
    context: WorkboardContext,
): boolean {
    if (!visit.evidenceRequired) {
        return false;
    }

    if (visit.status === 'completed' || visit.status === 'cancelled') {
        return false;
    }

    const fieldState = getVisitFieldState(context, visit.id);
    return !fieldState.hasRequiredEvidenceCaptured;
}

export function visitHasScanMismatch(visit: ServiceVisit, context: WorkboardContext): boolean {
    return getVisitFieldState(context, visit.id).assetScanResult === 'mismatch';
}

export function visitReadyToComplete(visit: ServiceVisit, context: WorkboardContext): boolean {
    if (!ACTIVE_VISIT_STATUSES.includes(visit.status) || visit.status === 'blocked') {
        return false;
    }

    if (visitMissingRequiredEvidence(visit, context)) {
        return false;
    }

    if (visitHasScanMismatch(visit, context)) {
        return false;
    }

    return visit.status === 'on_site' || visit.status === 'confirmed';
}

export function visitHasFailedOrQueuedUpload(
    visit: ServiceVisit,
    context: WorkboardContext,
): boolean {
    const status = getVisitFieldState(context, visit.id).uploadStatus;
    return status === 'failed' || status === 'queued';
}

// Counts
export function countMissingRequiredEvidence(
    visits: ServiceVisit[],
    context: WorkboardContext,
): number {
    return visits.filter((visit) => visitMissingRequiredEvidence(visit, context)).length;
}
