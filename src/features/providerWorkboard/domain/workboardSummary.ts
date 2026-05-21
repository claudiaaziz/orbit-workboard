import type { ServiceSite, ServiceVisit, WorkboardContext } from '../types';
import { getVisitFieldState } from './workboardContext';
import { visitMatchesDateScope } from './workboardFilters';

export type WorkboardSummaryModel = {
    totalMatchingSites: number;
    visitsDueToday: number;
    blockedVisits: number;
    urgentSites: number;
    visitsMissingEvidence: number;
    failedOrQueuedUploads: number;
};

function isVisitDueToday(visit: ServiceVisit, referenceDate: Date): boolean {
    return visitMatchesDateScope(visit, 'today', referenceDate);
}

function countVisitsMissingEvidenceWithContext(
    visits: ServiceVisit[],
    context: WorkboardContext,
): number {
    return visits.filter((visit) => {
        if (!visit.evidenceRequired) {
            return false;
        }

        if (visit.status === 'completed' || visit.status === 'cancelled') {
            return false;
        }

        const fieldState = getVisitFieldState(context, visit.id);
        return !fieldState.hasRequiredEvidenceCaptured;
    }).length;
}

function countFailedOrQueuedUploads(
    visits: ServiceVisit[],
    context: WorkboardContext,
): number {
    return visits.filter((visit) => {
        const status = getVisitFieldState(context, visit.id).uploadStatus;
        return status === 'failed' || status === 'queued';
    }).length;
}

export function buildWorkboardSummary(
    sites: ServiceSite[],
    context: WorkboardContext,
    referenceDate: Date = new Date(),
): WorkboardSummaryModel {
    const allVisits = sites.flatMap((site) => site.visits);

    return {
        totalMatchingSites: sites.length,
        visitsDueToday: allVisits.filter((visit) => isVisitDueToday(visit, referenceDate)).length,
        blockedVisits: allVisits.filter((visit) => visit.status === 'blocked').length,
        urgentSites: sites.filter((site) => site.priority === 'urgent').length,
        visitsMissingEvidence: sites.reduce(
            (total, site) => total + countVisitsMissingEvidenceWithContext(site.visits, context),
            0,
        ),
        failedOrQueuedUploads: countFailedOrQueuedUploads(allVisits, context),
    };
}
