import { buildMockSites, MOCK_SITES } from '../data/mockSites';
import { DEFAULT_WORKBOARD_FILTERS, type ServiceSite, type WorkboardContext } from '../types';
import { buildWorkboardSummary } from './workboardSummary';
import {
    filterSites,
    hasActiveFilters,
    visitMatchesDateScope,
} from './workboardFilters';
import { EMPTY_WORKBOARD_CONTEXT } from './workboardContext';
import {
    TEST_CONTEXT_SCAN_MISMATCH,
    TEST_CONTEXT_UPLOAD_QUEUE,
} from './testWorkboardContext';
import { visitHasFailedOrQueuedUpload, visitMissingRequiredEvidence } from './utils/visits';

const REFERENCE_DATE = new Date('2030-06-15T12:00:00.000Z');

function sitesForReferenceDate(): ServiceSite[] {
    return buildMockSites(REFERENCE_DATE);
}

function countVisitsMissingEvidence(sites: ServiceSite[], context: WorkboardContext): number {
    return sites
        .flatMap((site) => site.visits)
        .filter((visit) => visitMissingRequiredEvidence(visit, context)).length;
}

function countFailedOrQueuedUploads(sites: ServiceSite[], context: WorkboardContext): number {
    return sites
        .flatMap((site) => site.visits)
        .filter((visit) => visitHasFailedOrQueuedUpload(visit, context)).length;
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
            EMPTY_WORKBOARD_CONTEXT,
        );

        expect(result.some((site) => site.id === 'site-edge-001')).toBe(true);
    });

    it('filters sites with scan mismatch', () => {
        const result = filterSites(
            MOCK_SITES,
            { ...DEFAULT_WORKBOARD_FILTERS, evidenceFilter: 'scan_mismatch' },
            TEST_CONTEXT_SCAN_MISMATCH,
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
            TEST_CONTEXT_UPLOAD_QUEUE,
            REFERENCE_DATE,
        );
        const summary = buildWorkboardSummary(filtered, TEST_CONTEXT_UPLOAD_QUEUE, REFERENCE_DATE);
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
            countVisitsMissingEvidence(filtered, TEST_CONTEXT_UPLOAD_QUEUE),
        );
        expect(summary.failedOrQueuedUploads).toBe(
            countFailedOrQueuedUploads(filtered, TEST_CONTEXT_UPLOAD_QUEUE),
        );
        expect(summary.failedOrQueuedUploads).toBeGreaterThan(0);
    });
});
