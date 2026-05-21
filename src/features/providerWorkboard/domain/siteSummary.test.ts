import { MOCK_SITES } from '../data/mockSites';
import type { ServiceSite, ServiceVisit } from '../types';
import {
    buildSiteListItem,
} from './siteSummary';
import { formatCompactAddress } from './utils/formatters';
import { countMissingRequiredEvidence } from './utils/visits';
import { EMPTY_WORKBOARD_CONTEXT } from './workboardContext';

function visit(overrides: Partial<ServiceVisit> & Pick<ServiceVisit, 'id' | 'status'>): ServiceVisit {
    return {
        siteId: 'site-test',
        serviceType: 'inspection',
        scheduledStart: '2030-06-01T14:00:00.000Z',
        scheduledEnd: '2030-06-01T16:00:00.000Z',
        equipmentLabel: 'Unit 1',
        expectedAssetCode: 'AST-1',
        evidenceRequired: false,
        motionCheckRequired: false,
        locationRequired: false,
        lastUpdatedAt: '2030-06-01T12:00:00.000Z',
        ...overrides,
    };
}

function site(overrides: Partial<ServiceSite> & Pick<ServiceSite, 'id'>): ServiceSite {
    return {
        ...MOCK_SITES[0],
        ...overrides,
    };
}

describe('siteSummary', () => {
    it('formats compact address from site', () => {
        const entry = MOCK_SITES[0];
        expect(formatCompactAddress(entry)).toBe(
            `${entry.address.city}, ${entry.address.region}`,
        );
    });

    it('counts open visits that still need evidence', () => {
        const entry = MOCK_SITES.find((row) => row.id === 'site-edge-001');
        expect(entry).toBeDefined();
        expect(countMissingRequiredEvidence(entry!.visits, EMPTY_WORKBOARD_CONTEXT)).toBeGreaterThan(0);
    });

    it('does not count completed or cancelled visits as missing evidence', () => {
        expect(
            countMissingRequiredEvidence([
                visit({
                    id: 'v-completed',
                    status: 'completed',
                    evidenceRequired: true,
                }),
            ], EMPTY_WORKBOARD_CONTEXT),
        ).toBe(0);

        expect(
            countMissingRequiredEvidence([
                visit({
                    id: 'v-cancelled',
                    status: 'cancelled',
                    evidenceRequired: true,
                }),
            ], EMPTY_WORKBOARD_CONTEXT),
        ).toBe(0);
    });

    it('builds list item with urgent flag for urgent priority', () => {
        const urgentSite = MOCK_SITES.find((row) => row.priority === 'urgent');
        expect(urgentSite).toBeDefined();
        expect(buildSiteListItem(urgentSite!, EMPTY_WORKBOARD_CONTEXT).flags.isUrgent).toBe(true);
    });

    it('sets blocked flag when a visit is blocked', () => {
        const entry = site({
            id: 'site-blocked',
            workStatus: 'scheduled',
            visits: [
                visit({
                    id: 'v-blocked',
                    status: 'blocked',
                    scheduledStart: '2030-06-01T10:00:00.000Z',
                }),
            ],
        });

        expect(buildSiteListItem(entry, EMPTY_WORKBOARD_CONTEXT).flags.isBlocked).toBe(true);
    });

    it('sets late flag when an open visit is past scheduled end', () => {
        const entry = site({
            id: 'site-late',
            visits: [
                visit({
                    id: 'v-late',
                    status: 'scheduled',
                    scheduledStart: '2020-01-01T10:00:00.000Z',
                    scheduledEnd: '2020-01-01T12:00:00.000Z',
                }),
            ],
        });

        const item = buildSiteListItem(
            entry,
            EMPTY_WORKBOARD_CONTEXT,
            new Date('2025-01-01T00:00:00.000Z'),
        );

        expect(item.flags.isLate).toBe(true);
    });

    it('uses the earliest open visit for next visit time, not completed work', () => {
        const entry = site({
            id: 'site-next',
            visits: [
                visit({
                    id: 'v-done',
                    status: 'completed',
                    scheduledStart: '2020-01-01T10:00:00.000Z',
                    scheduledEnd: '2020-01-01T12:00:00.000Z',
                }),
                visit({
                    id: 'v-next',
                    status: 'scheduled',
                    scheduledStart: '2030-08-15T09:30:00.000Z',
                    scheduledEnd: '2030-08-15T11:30:00.000Z',
                }),
            ],
        });

        const item = buildSiteListItem(entry, EMPTY_WORKBOARD_CONTEXT);
        expect(item.nextVisitStart).toBe('2030-08-15T09:30:00.000Z');
    });
});
