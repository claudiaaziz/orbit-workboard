import { buildMockSites, MOCK_SITES } from '../data/mockSites';
import { MOCK_WORKBOARD_CONTEXT } from '../data/mockWorkboardContext';
import { DEFAULT_WORKBOARD_FILTERS, type ServiceSite, type WorkboardContext } from '../types';
import { buildWorkboardSummary } from './workboardSummary';
import {
    filterSites,
    hasActiveFilters,
    visitMatchesDateScope,
} from './workboardFilters';
import { EMPTY_WORKBOARD_CONTEXT, getVisitFieldState } from './workboardContext';

const REFERENCE_DATE = new Date('2030-06-15T12:00:00.000Z');

function sitesForReferenceDate(): ServiceSite[] {
    return buildMockSites(REFERENCE_DATE);
}

function countVisitsMissingEvidence(sites: ServiceSite[], context: WorkboardContext): number {
    return sites.reduce((total, site) => {
        const missingOnSite = site.visits.filter((visit) => {
            if (!visit.evidenceRequired) {
                return false;
            }

            if (visit.status === 'completed' || visit.status === 'cancelled') {
                return false;
            }

            const fieldState = getVisitFieldState(context, visit.id);
            return !fieldState.hasRequiredEvidenceCaptured;
        }).length;

        return total + missingOnSite;
    }, 0);
}

function countFailedOrQueuedUploads(sites: ServiceSite[], context: WorkboardContext): number {
    return sites
        .flatMap((site) => site.visits)
        .filter((visit) => {
            const status = getVisitFieldState(context, visit.id).uploadStatus;
            return status === 'failed' || status === 'queued';
        }).length;
}

describe('workboardFilters', () => {
    it('returns all sites with default filters', () => {
        const result = filterSites(MOCK_SITES, DEFAULT_WORKBOARD_FILTERS, EMPTY_WORKBOARD_CONTEXT);
        expect(result.length).toBe(MOCK_SITES.length);
    });

    it('filters sites by work status', () => {
        const result = filterSites(
            MOCK_SITES,
            { ...DEFAULT_WORKBOARD_FILTERS, workStatus: 'blocked' },
            EMPTY_WORKBOARD_CONTEXT,
        );

        expect(result.length).toBeGreaterThan(0);
        expect(result.every((site) => site.workStatus === 'blocked')).toBe(true);
    });

    it('filters sites by search across equipment labels', () => {
        const result = filterSites(
            MOCK_SITES,
            { ...DEFAULT_WORKBOARD_FILTERS, searchQuery: 'Dock Leveler' },
            EMPTY_WORKBOARD_CONTEXT,
        );

        expect(result.some((site) => site.id === 'site-edge-001')).toBe(true);
    });

    it('filters sites by today date scope', () => {
        const sites = sitesForReferenceDate();
        const result = filterSites(
            sites,
            { ...DEFAULT_WORKBOARD_FILTERS, dateScope: 'today' },
            EMPTY_WORKBOARD_CONTEXT,
            REFERENCE_DATE,
        );

        expect(result.length).toBeGreaterThan(0);
        expect(
            result.every((site) =>
                site.visits.some((visit) =>
                    visitMatchesDateScope(visit, 'today', REFERENCE_DATE),
                ),
            ),
        ).toBe(true);
    });

    it('filters sites by next 7 days date scope', () => {
        const sites = sitesForReferenceDate();
        const result = filterSites(
            sites,
            { ...DEFAULT_WORKBOARD_FILTERS, dateScope: 'next_7_days' },
            EMPTY_WORKBOARD_CONTEXT,
            REFERENCE_DATE,
        );

        expect(result.length).toBeGreaterThan(0);
        expect(
            result.every((site) =>
                site.visits.some((visit) =>
                    visitMatchesDateScope(visit, 'next_7_days', REFERENCE_DATE),
                ),
            ),
        ).toBe(true);
    });

    it('filters sites missing proof using visit context', () => {
        const result = filterSites(
            MOCK_SITES,
            { ...DEFAULT_WORKBOARD_FILTERS, evidenceFilter: 'missing_proof' },
            MOCK_WORKBOARD_CONTEXT,
        );

        expect(result.some((site) => site.id === 'site-edge-001')).toBe(true);
    });

    it('filters sites with scan mismatch', () => {
        const result = filterSites(
            MOCK_SITES,
            { ...DEFAULT_WORKBOARD_FILTERS, evidenceFilter: 'scan_mismatch' },
            MOCK_WORKBOARD_CONTEXT,
        );

        expect(result.some((site) => site.id === 'site-edge-001')).toBe(true);
    });

    it('detects active filters', () => {
        expect(hasActiveFilters(DEFAULT_WORKBOARD_FILTERS)).toBe(false);
        expect(
            hasActiveFilters({
                ...DEFAULT_WORKBOARD_FILTERS,
                searchQuery: 'northwind',
            }),
        ).toBe(true);
    });
});

describe('workboardSummary', () => {
    it('builds summary counts from filtered sites', () => {
        const sites = sitesForReferenceDate();
        const filtered = filterSites(
            sites,
            DEFAULT_WORKBOARD_FILTERS,
            MOCK_WORKBOARD_CONTEXT,
            REFERENCE_DATE,
        );
        const summary = buildWorkboardSummary(filtered, MOCK_WORKBOARD_CONTEXT, REFERENCE_DATE);
        const allVisits = filtered.flatMap((site) => site.visits);

        expect(summary.totalMatchingSites).toBe(filtered.length);
        expect(summary.urgentSites).toBe(
            filtered.filter((site) => site.priority === 'urgent').length,
        );
        expect(summary.blockedVisits).toBe(
            allVisits.filter((visit) => visit.status === 'blocked').length,
        );
        expect(summary.visitsDueToday).toBe(
            allVisits.filter((visit) =>
                visitMatchesDateScope(visit, 'today', REFERENCE_DATE),
            ).length,
        );
        expect(summary.visitsMissingEvidence).toBe(
            countVisitsMissingEvidence(filtered, MOCK_WORKBOARD_CONTEXT),
        );
        expect(summary.failedOrQueuedUploads).toBe(
            countFailedOrQueuedUploads(filtered, MOCK_WORKBOARD_CONTEXT),
        );
        expect(summary.failedOrQueuedUploads).toBeGreaterThan(0);
    });
});
