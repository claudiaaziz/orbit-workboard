import {
    type EvidenceFilter,
    type DateScopeFilter,
    type ServiceSite,
    type ServiceVisit,
    type WorkboardContext,
    type WorkboardFilters,
    type WorkStatus,
} from '../types';
import {
    visitHasScanMismatch,
    visitMissingRequiredEvidence,
    visitReadyToComplete,
} from './utils/visits';

// Date matching
function startOfDay(date: Date): Date {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
}

export function visitMatchesDateScope(
    visit: ServiceVisit,
    dateScope: DateScopeFilter,
    referenceDate: Date,
): boolean {
    if (dateScope === 'all') {
        return true;
    }

    const visitStart = new Date(visit.scheduledStart);
    const dayStart = startOfDay(referenceDate);

    if (dateScope === 'today') {
        const visitDay = startOfDay(visitStart);
        return visitDay.getTime() === dayStart.getTime();
    }

    const windowEnd = new Date(dayStart);
    windowEnd.setDate(windowEnd.getDate() + 7);

    return visitStart >= dayStart && visitStart < windowEnd;
}

function siteMatchesDateScope(
    site: ServiceSite,
    dateScope: DateScopeFilter,
    referenceDate: Date,
): boolean {
    return site.visits.some((visit) => visitMatchesDateScope(visit, dateScope, referenceDate));
}

// Search and status matching
function siteMatchesWorkStatus(site: ServiceSite, workStatus: WorkStatus | 'all'): boolean {
    if (workStatus === 'all') {
        return true;
    }

    return site.workStatus === workStatus;
}

function normalizeSearchText(value: string): string {
    return value.trim().toLowerCase();
}

function siteMatchesSearch(site: ServiceSite, searchQuery: string): boolean {
    const query = normalizeSearchText(searchQuery);
    if (!query) {
        return true;
    }

    const haystack = [
        site.siteName,
        site.customerName,
        site.address.line1,
        site.address.city,
        site.address.region,
        site.address.postalCode,
        ...site.visits.map((visit) => visit.equipmentLabel),
    ]
        .join(' ')
        .toLowerCase();

    return haystack.includes(query);
}

function siteMatchesEvidenceFilter(
    site: ServiceSite,
    evidenceFilter: EvidenceFilter,
    context: WorkboardContext,
): boolean {
    if (!evidenceFilter) {
        return true;
    }

    if (evidenceFilter === 'missing_proof') {
        return site.visits.some((visit) => visitMissingRequiredEvidence(visit, context));
    }

    if (evidenceFilter === 'scan_mismatch') {
        return site.visits.some((visit) => visitHasScanMismatch(visit, context));
    }

    return site.visits.some((visit) => visitReadyToComplete(visit, context));
}

// Public API
export function filterSites(
    sites: ServiceSite[],
    filters: WorkboardFilters,
    context: WorkboardContext,
    referenceDate: Date = new Date(),
): ServiceSite[] {
    return sites.filter(
        (site) =>
            siteMatchesWorkStatus(site, filters.workStatus) &&
            siteMatchesSearch(site, filters.searchQuery) &&
            siteMatchesDateScope(site, filters.dateScope, referenceDate) &&
            siteMatchesEvidenceFilter(site, filters.evidenceFilter, context),
    );
}

export function hasActiveFilters(filters: WorkboardFilters): boolean {
    return (
        filters.searchQuery.trim().length > 0 ||
        filters.workStatus !== 'all' ||
        filters.dateScope !== 'all' ||
        filters.evidenceFilter !== null
    );
}

