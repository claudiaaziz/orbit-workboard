import {
    type ServiceSite,
    type ServiceVisit,
    type ServicePriority,
    type VisitStatus,
    type WorkStatus,
    type WorkboardContext,
} from '../types';
import { formatCompactAddress, formatVisitStartTime } from './utils/formatters';
import {
    countMissingRequiredEvidence,
    getNextActiveVisit,
    isVisitLate,
} from './utils/visits';

export type SiteListItemModel = {
    siteId: string;
    siteName: string;
    customerName: string;
    locationLabel: string;
    priority: ServicePriority;
    workStatus: WorkStatus;
    nextVisitStart: string | null;
    nextVisitTimeLabel: string | null;
    visitStatusSummary: string;
    missingEvidenceCount: number;
    flags: {
        isUrgent: boolean;
        isBlocked: boolean;
        isLate: boolean;
        needsProof: boolean;
    };
};

function countVisitsByStatus(
    visits: ServiceVisit[],
): Partial<Record<VisitStatus, number>> {
    return visits.reduce<Partial<Record<VisitStatus, number>>>((counts, visit) => {
        counts[visit.status] = (counts[visit.status] ?? 0) + 1;
        return counts;
    }, {});
}

function formatVisitStatusSummary(visits: ServiceVisit[]): string {
    const counts = countVisitsByStatus(visits);
    const parts: string[] = [];

    const ordered: VisitStatus[] = [
        'on_site',
        'en_route',
        'confirmed',
        'scheduled',
        'blocked',
        'completed',
        'cancelled',
    ];

    for (const status of ordered) {
        const count = counts[status];
        if (count) {
            parts.push(`${count} ${status.replace('_', ' ')}`);
        }
    }

    return parts.join(' · ');
}

function siteHasLateVisit(site: ServiceSite, referenceDate: Date): boolean {
    return site.visits.some((visit) => isVisitLate(visit, referenceDate));
}

export function buildSiteListItem(
    site: ServiceSite,
    context: WorkboardContext,
    referenceDate: Date = new Date(),
): SiteListItemModel {
    const nextVisit = getNextActiveVisit(site.visits);
    const missingEvidenceCount = countMissingRequiredEvidence(site.visits, context);
    const isBlocked =
        site.workStatus === 'blocked' ||
        site.visits.some((visit) => visit.status === 'blocked');
    const isLate = siteHasLateVisit(site, referenceDate);

    return {
        siteId: site.id,
        siteName: site.siteName,
        customerName: site.customerName,
        locationLabel: formatCompactAddress(site),
        priority: site.priority,
        workStatus: site.workStatus,
        nextVisitStart: nextVisit?.scheduledStart ?? null,
        nextVisitTimeLabel: nextVisit
            ? formatVisitStartTime(nextVisit.scheduledStart)
            : null,
        visitStatusSummary: formatVisitStatusSummary(site.visits),
        missingEvidenceCount,
        flags: {
            isUrgent: site.priority === 'urgent',
            isBlocked,
            isLate,
            needsProof: missingEvidenceCount > 0,
        },
    };
}
