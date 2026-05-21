import type { ServiceSite, ServiceVisit, WorkboardContext, WorkStatus } from '../types';
import { ACTIVE_VISIT_STATUSES } from '../types';
import { formatFullAddress, formatVisitStartTime } from './utils/formatters';
import {
    getNextActiveVisit,
    isVisitLate,
    visitMissingRequiredEvidence,
} from './utils/visits';

export type SiteDetailVisitItem = {
    visitId: string;
    status: ServiceVisit['status'];
    serviceType: ServiceVisit['serviceType'];
    equipmentLabel: string;
    timeLabel: string;
    assignedTech: string | null;
};

export type SiteDetailModel = {
    siteId: string;
    siteName: string;
    customerName: string;
    priority: ServiceSite['priority'];
    addressLine: string;
    contactName: string;
    contactPhone: string;
    statusSentence: string;
    nextVisitLabel: string | null;
    warnings: string[];
    evidenceSummary: string;
    hardwareWarnings: string[];
    visitTimeline: SiteDetailVisitItem[];
};

const WORK_STATUS_LEADS: Record<WorkStatus, string> = {
    needs_attention: 'This site needs attention today',
    scheduled: 'Visits are scheduled and awaiting action',
    in_progress: 'A technician is active at this site',
    blocked: 'Work at this site is blocked',
    completed: 'All work at this site is completed',
};

// Site-detail copy formatters
export function formatReasons(reasons: string[]): string {
    if (reasons.length === 1) {
        return reasons[0];
    }

    if (reasons.length === 2) {
        return `${reasons[0]} and ${reasons[1]}`;
    }

    return `${reasons.slice(0, -1).join(', ')}, and ${reasons[reasons.length - 1]}`;
}

function visitsBlockedPhrase(count: number): string {
    return count === 1 ? '1 blocked visit' : `${count} blocked visits`;
}

function visitsOverduePhrase(count: number): string {
    return count === 1 ? '1 overdue visit' : `${count} overdue visits`;
}

function visitsNeedProofPhrase(count: number): string {
    return count === 1 ? '1 visit needs proof' : `${count} visits need proof`;
}

function visitsRequirePhrase(count: number, requirement: string): string {
    return count === 1
        ? `1 visit requires ${requirement}`
        : `${count} visits require ${requirement}`;
}

// Getters
type SiteVisitCounts = {
    blockedVisits: number;
    overdueVisits: number;
    missingProofVisits: number;
};

function getSiteVisitCounts(
    site: ServiceSite,
    context: WorkboardContext,
    referenceDate: Date,
): SiteVisitCounts {
    return {
        blockedVisits: site.visits.filter((visit) => visit.status === 'blocked').length,
        overdueVisits: site.visits.filter((visit) => isVisitLate(visit, referenceDate)).length,
        missingProofVisits: site.visits.filter((visit) =>
            visitMissingRequiredEvidence(visit, context),
        ).length,
    };
}

function collectStatusReasons(
    site: ServiceSite,
    context: WorkboardContext,
    referenceDate: Date,
): string[] {
    const counts = getSiteVisitCounts(site, context, referenceDate);
    const reasons: string[] = [];

    if (site.priority === 'urgent') {
        reasons.push('it is marked urgent');
    }

    if (counts.blockedVisits > 0) {
        reasons.push(visitsBlockedPhrase(counts.blockedVisits));
    }

    if (counts.overdueVisits > 0) {
        reasons.push(visitsOverduePhrase(counts.overdueVisits));
    }

    if (counts.missingProofVisits > 0) {
        reasons.push(visitsNeedProofPhrase(counts.missingProofVisits));
    }

    return reasons;
}

// Section builders
function buildStatusSentence(
    site: ServiceSite,
    context: WorkboardContext,
    referenceDate: Date,
): string {
    const reasons = collectStatusReasons(site, context, referenceDate);
    const lead = WORK_STATUS_LEADS[site.workStatus];

    if (reasons.length === 0) {
        return `${lead}.`;
    }

    return `${lead} because ${formatReasons(reasons)}.`;
}

function buildWarnings(
    site: ServiceSite,
    context: WorkboardContext,
    referenceDate: Date,
): string[] {
    const counts = getSiteVisitCounts(site, context, referenceDate);
    const warnings: string[] = [];

    if (site.workStatus === 'blocked') {
        warnings.push('Site work is blocked');
    }

    if (counts.blockedVisits > 0) {
        warnings.push(visitsBlockedPhrase(counts.blockedVisits));
    }

    if (counts.overdueVisits > 0) {
        warnings.push(visitsOverduePhrase(counts.overdueVisits));
    }

    if (counts.missingProofVisits > 0) {
        warnings.push(visitsNeedProofPhrase(counts.missingProofVisits));
    }

    return warnings;
}

function buildEvidenceSummary(site: ServiceSite, context: WorkboardContext): string {
    const openVisits = site.visits.filter(
        (visit) => visit.evidenceRequired && ACTIVE_VISIT_STATUSES.includes(visit.status),
    );

    if (openVisits.length === 0) {
        return 'No open visits require photo evidence';
    }

    const missing = openVisits.filter((visit) =>
        visitMissingRequiredEvidence(visit, context),
    ).length;
    const captured = openVisits.length - missing;

    const visitProofCopy =
        openVisits.length === 1
            ? '1 visit requires proof'
            : `${openVisits.length} visits require proof`;

    return `${visitProofCopy} · ${captured} captured · ${missing} still needed`;
}

function buildHardwareWarnings(site: ServiceSite): string[] {
    const openVisits = site.visits.filter((visit) =>
        ACTIVE_VISIT_STATUSES.includes(visit.status),
    );

    const warnings: string[] = [];

    const cameraCount = openVisits.filter((visit) => visit.evidenceRequired).length;
    if (cameraCount > 0) {
        warnings.push(visitsRequirePhrase(cameraCount, 'camera evidence'));
    }

    const motionCount = openVisits.filter((visit) => visit.motionCheckRequired).length;
    if (motionCount > 0) {
        warnings.push(visitsRequirePhrase(motionCount, 'a motion check'));
    }

    const locationCount = openVisits.filter((visit) => visit.locationRequired).length;
    if (locationCount > 0) {
        warnings.push(visitsRequirePhrase(locationCount, 'location capture'));
    }

    return warnings;
}

function buildVisitTimeline(site: ServiceSite): SiteDetailVisitItem[] {
    return [...site.visits]
        .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))
        .map((visit) => ({
            visitId: visit.id,
            status: visit.status,
            serviceType: visit.serviceType,
            equipmentLabel: visit.equipmentLabel,
            timeLabel: formatVisitStartTime(visit.scheduledStart),
            assignedTech: visit.assignedTech ?? null,
        }));
}

// Public API
export function buildSiteDetailModel(
    site: ServiceSite,
    context: WorkboardContext,
    referenceDate: Date = new Date(),
): SiteDetailModel {
    const nextVisit = getNextActiveVisit(site.visits);

    return {
        siteId: site.id,
        siteName: site.siteName,
        customerName: site.customerName,
        priority: site.priority,
        addressLine: formatFullAddress(site),
        contactName: site.contactName,
        contactPhone: site.contactPhone,
        statusSentence: buildStatusSentence(site, context, referenceDate),
        nextVisitLabel: nextVisit ? formatVisitStartTime(nextVisit.scheduledStart) : null,
        warnings: buildWarnings(site, context, referenceDate),
        evidenceSummary: buildEvidenceSummary(site, context),
        hardwareWarnings: buildHardwareWarnings(site),
        visitTimeline: buildVisitTimeline(site),
    };
}
