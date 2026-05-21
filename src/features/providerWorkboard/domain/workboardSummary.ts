import type { ServiceSite, ServiceVisit, WorkboardContext } from '../types';
import { visitMatchesDateScope } from './workboardFilters';
import {
    visitHasFailedOrQueuedUpload,
    visitMissingRequiredEvidence,
} from './utils/visits';


export type WorkboardSummaryModel = {
    totalMatchingSites: number;
    visitsDueToday: number;
    blockedVisits: number;
    urgentSites: number;
    visitsMissingEvidence: number;
    failedOrQueuedUploads: number;
};

// Helpers
function isVisitDueToday(visit: ServiceVisit, referenceDate: Date): boolean {
    return visitMatchesDateScope(visit, 'today', referenceDate);
}

// Builder
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
        visitsMissingEvidence: allVisits.filter((visit) =>
            visitMissingRequiredEvidence(visit, context),
        ).length,
        failedOrQueuedUploads: allVisits.filter((visit) =>
            visitHasFailedOrQueuedUpload(visit, context),
        ).length,
    };
}
