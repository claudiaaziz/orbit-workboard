import { delay } from './delay';
import { MOCK_SITES } from './mockSites';
import type { FetchSitesResponse, ServiceSite } from '../types';

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