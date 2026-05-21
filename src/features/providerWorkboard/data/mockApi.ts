import { applyVisitActionToVisit, isVisitActionEnabled } from '../domain/visitActionMutations';
import type { VisitActionId } from '../domain/visitActions';
import { delay } from './delay';
import { MOCK_SITES } from './mockSites';
import type {
    FetchSitesResponse,
    ServiceSite,
    ServiceVisit,
    WorkboardContext,
    WorkStatus,
} from '../types';

const DEFAULT_LATENCY_MS = 450;

export class WorkboardApiError extends Error {
    readonly code: string;

    constructor(message: string, code = 'WORKBOARD_API_ERROR') {
        super(message);
        this.name = 'WorkboardApiError';
        this.code = code;
    }
}

// In-memory store so reads and future mutations behave like server state.
let sitesStore: ServiceSite[] = structuredClone(MOCK_SITES);

export type FetchSitesOptions = {
    simulateFailure?: boolean;
    latencyMs?: number;
};

export async function fetchSites(
    options: FetchSitesOptions = {},
): Promise<FetchSitesResponse> {
    const { simulateFailure = false, latencyMs = DEFAULT_LATENCY_MS } = options;

    await delay(latencyMs);

    if (simulateFailure) {
        throw new WorkboardApiError(
            'Unable to load workboard sites. Check your connection and try again.',
            'FETCH_SITES_FAILED',
        );
    }

    return {
        sites: structuredClone(sitesStore),
        fetchedAt: new Date().toISOString(),
    };
}

export async function fetchSiteById(siteId: string): Promise<ServiceSite | null> {
    await delay(200);

    const site = sitesStore.find((entry) => entry.id === siteId);
    return site ? structuredClone(site) : null;
}

function deriveSiteWorkStatus(visits: ServiceVisit[]): WorkStatus {
    if (visits.length === 0) {
        return 'scheduled';
    }

    if (visits.every((visit) => visit.status === 'completed' || visit.status === 'cancelled')) {
        return 'completed';
    }

    if (visits.some((visit) => visit.status === 'blocked')) {
        return 'blocked';
    }

    if (
        visits.some((visit) =>
            ['on_site', 'en_route', 'confirmed'].includes(visit.status),
        )
    ) {
        return 'in_progress';
    }

    return 'scheduled';
}

export type PerformVisitActionParams = {
    siteId: string;
    visitId: string;
    actionId: VisitActionId;
    /** Field state the UI used for eligibility (evidence, scan, motion). */
    context: WorkboardContext;
    /** Pass `true` to exercise the error/retry UI (deterministic; no random failures). */
    simulateFailure?: boolean;
    latencyMs?: number;
};

export type PerformVisitActionResult = {
    sites: ServiceSite[];
};

export async function performVisitAction(
    params: PerformVisitActionParams,
): Promise<PerformVisitActionResult> {
    const {
        siteId,
        visitId,
        actionId,
        context,
        simulateFailure = false,
        latencyMs = 650,
    } = params;

    await delay(latencyMs);

    if (simulateFailure) {
        throw new WorkboardApiError(
            'Unable to update the visit right now. Try again in a moment.',
            'VISIT_ACTION_FAILED',
        );
    }

    const siteIndex = sitesStore.findIndex((entry) => entry.id === siteId);
    if (siteIndex < 0) {
        throw new WorkboardApiError('Site not found.', 'SITE_NOT_FOUND');
    }

    const site = sitesStore[siteIndex];
    const visitIndex = site.visits.findIndex((entry) => entry.id === visitId);
    if (visitIndex < 0) {
        throw new WorkboardApiError('Visit not found.', 'VISIT_NOT_FOUND');
    }

    const visit = site.visits[visitIndex];
    if (!isVisitActionEnabled(visit, actionId, context)) {
        throw new WorkboardApiError(
            'This action is not available for the current visit state.',
            'VISIT_ACTION_NOT_ALLOWED',
        );
    }

    const updatedVisit = applyVisitActionToVisit(visit, actionId);
    const updatedVisits = [...site.visits];
    updatedVisits[visitIndex] = updatedVisit;

    sitesStore[siteIndex] = {
        ...site,
        visits: updatedVisits,
        workStatus: deriveSiteWorkStatus(updatedVisits),
    };

    return {
        sites: structuredClone(sitesStore),
    };
}