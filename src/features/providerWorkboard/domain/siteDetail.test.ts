import { MOCK_WORKBOARD_CONTEXT } from '../data/mockWorkboardContext';
import { buildMockSites, MOCK_SITES } from '../data/mockSites';
import type { ServiceSite, ServiceVisit } from '../types';
import { EMPTY_WORKBOARD_CONTEXT } from './workboardContext';
import { buildSiteDetailModel, formatReasons } from './siteDetail';

const REFERENCE_DATE = new Date('2030-06-15T12:00:00.000Z');

function makeVisit(
    overrides: Partial<ServiceVisit> & Pick<ServiceVisit, 'id' | 'status'>,
): ServiceVisit {
    return {
        siteId: 'site-test',
        serviceType: 'inspection',
        scheduledStart: '2030-08-01T10:00:00.000Z',
        scheduledEnd: '2030-08-01T12:00:00.000Z',
        equipmentLabel: 'Unit 1',
        expectedAssetCode: 'AST-1',
        evidenceRequired: false,
        motionCheckRequired: false,
        locationRequired: false,
        lastUpdatedAt: '2030-06-01T12:00:00.000Z',
        ...overrides,
    };
}

function makeSite(overrides: Partial<ServiceSite> & Pick<ServiceSite, 'id'>): ServiceSite {
    return {
        ...MOCK_SITES[0],
        ...overrides,
    };
}

describe('siteDetail', () => {
    it('builds a plain-language status sentence with visit counts', () => {
        const site = buildMockSites(REFERENCE_DATE).find((entry) => entry.id === 'site-edge-001');
        expect(site).toBeDefined();

        const model = buildSiteDetailModel(
            site!,
            MOCK_WORKBOARD_CONTEXT,
            REFERENCE_DATE,
        );

        expect(model.statusSentence).toContain('because');
        expect(model.statusSentence).toContain('it is marked urgent');
        expect(model.statusSentence).toContain('1 blocked visit');
        expect(model.statusSentence).toContain('2 visits need proof');
        expect(model.warnings).toEqual(
            expect.arrayContaining(['1 blocked visit', '2 visits need proof']),
        );
        expect(model.warnings.some((warning) => warning.includes('at least'))).toBe(false);
    });

    it('uses the work-status lead alone when there are no attention reasons', () => {
        const site = makeSite({
            id: 'site-calm',
            workStatus: 'scheduled',
            priority: 'normal',
            visits: [
                makeVisit({
                    id: 'visit-calm-1',
                    status: 'scheduled',
                    evidenceRequired: false,
                }),
            ],
        });

        const model = buildSiteDetailModel(site, EMPTY_WORKBOARD_CONTEXT, REFERENCE_DATE);

        expect(model.statusSentence).toBe('Visits are scheduled and awaiting action.');
        expect(model.statusSentence).not.toContain('because');
    });

    it('formats reason lists for plain-language sentences', () => {
        expect(formatReasons(['1 blocked visit'])).toBe('1 blocked visit');
        expect(formatReasons(['1 overdue visit', 'it is marked urgent'])).toBe(
            '1 overdue visit and it is marked urgent',
        );
        expect(
            formatReasons([
                'it is marked urgent',
                '1 blocked visit',
                '2 overdue visits',
            ]),
        ).toBe('it is marked urgent, 1 blocked visit, and 2 overdue visits');
    });

    it('includes hardware warnings when visits require motion or location', () => {
        const site = MOCK_SITES.find((entry) => entry.id === 'site-edge-002');
        expect(site).toBeDefined();

        const model = buildSiteDetailModel(
            site!,
            MOCK_WORKBOARD_CONTEXT,
            REFERENCE_DATE,
        );

        expect(model.hardwareWarnings).toContain('1 visit requires camera evidence');
    });

    it('summarizes evidence requirements for visits needing proof', () => {
        const site = MOCK_SITES.find((entry) => entry.id === 'site-edge-001');
        expect(site).toBeDefined();

        const model = buildSiteDetailModel(
            site!,
            MOCK_WORKBOARD_CONTEXT,
            REFERENCE_DATE,
        );

        expect(model.evidenceSummary).toContain('visits require proof');
        expect(model.evidenceSummary).toContain('still needed');
        expect(model.warnings.some((warning) => warning.includes('need proof'))).toBe(true);
    });

    it('reports when no open visits require photo evidence', () => {
        const site = makeSite({
            id: 'site-no-evidence',
            workStatus: 'scheduled',
            visits: [
                makeVisit({
                    id: 'visit-no-evidence-1',
                    status: 'scheduled',
                    evidenceRequired: false,
                }),
            ],
        });

        const model = buildSiteDetailModel(site, EMPTY_WORKBOARD_CONTEXT, REFERENCE_DATE);

        expect(model.evidenceSummary).toBe('No open visits require photo evidence');
    });

    it('uses singular copy when one open visit requires proof', () => {
        const site = MOCK_SITES.find((entry) => entry.id === 'site-edge-002');
        expect(site).toBeDefined();

        const model = buildSiteDetailModel(
            site!,
            MOCK_WORKBOARD_CONTEXT,
            REFERENCE_DATE,
        );

        expect(model.evidenceSummary).toContain('1 visit requires proof');
        expect(model.evidenceSummary).not.toContain('1 visits require proof');
    });

    it('sorts visit timeline by scheduled start', () => {
        const sites = buildMockSites(REFERENCE_DATE);
        const site = sites.find((entry) => entry.id === 'site-edge-001');
        expect(site).toBeDefined();

        const sortedIds = [...site!.visits]
            .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))
            .map((visit) => visit.id);
        const model = buildSiteDetailModel(site!, EMPTY_WORKBOARD_CONTEXT, REFERENCE_DATE);

        expect(model.visitTimeline.map((visit) => visit.visitId)).toEqual(sortedIds);
    });
});
