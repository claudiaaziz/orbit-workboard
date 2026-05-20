import type {
    ServiceSite,
    ServiceVisit,
    ServicePriority,
    VisitStatus,
    WorkStatus,
} from '../types';

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

const ACTIVE_VISIT_STATUSES: VisitStatus[] = [
    'scheduled',
    'confirmed',
    'en_route',
    'on_site',
    'blocked',
];

export function formatCompactAddress(site: ServiceSite): string {
    return `${site.address.city}, ${site.address.region}`;
}

function getNextActiveVisit(
    visits: ServiceVisit[],
): ServiceVisit | undefined {
    return [...visits]
        .filter((visit) => ACTIVE_VISIT_STATUSES.includes(visit.status))
        .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))[0];
}

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

// not done - simplified for stage 1
export function countMissingRequiredEvidence(visits: ServiceVisit[]): number {
    return visits.filter(
        (visit) =>
            visit.evidenceRequired &&
            visit.status !== 'completed' &&
            visit.status !== 'cancelled',
    ).length;
}

function isVisitLate(visit: ServiceVisit, referenceDate: Date): boolean {
    if (visit.status === 'completed' || visit.status === 'cancelled') {
        return false;
    }

    return new Date(visit.scheduledEnd).getTime() < referenceDate.getTime();
}

function siteHasLateVisit(
    site: ServiceSite,
    referenceDate: Date,
): boolean {
    return site.visits.some((visit) => isVisitLate(visit, referenceDate));
}

function formatVisitStartTime(isoStart: string): string {
    const start = new Date(isoStart);
    return start.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function buildSiteListItem(
    site: ServiceSite,
    referenceDate: Date = new Date(),
): SiteListItemModel {
    const nextVisit = getNextActiveVisit(site.visits);
    const missingEvidenceCount = countMissingRequiredEvidence(site.visits);
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
