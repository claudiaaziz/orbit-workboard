import type { ServiceVisit, WorkboardContext } from '../types';
import { EMPTY_WORKBOARD_CONTEXT } from './workboardContext';
import { getAvailableVisitActions } from './visitActions';

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
        evidenceRequired: true,
        motionCheckRequired: false,
        locationRequired: false,
        lastUpdatedAt: '2030-06-01T12:00:00.000Z',
        ...overrides,
    };
}

function getCompleteAction(visit: ServiceVisit, context: WorkboardContext) {
    return getAvailableVisitActions(visit, context).find(
        (action) => action.id === 'complete_visit',
    );
}

describe('visitActions', () => {
    it('offers confirm for scheduled visits', () => {
        const actions = getAvailableVisitActions(
            makeVisit({ id: 'v1', status: 'scheduled' }),
            EMPTY_WORKBOARD_CONTEXT,
        );

        expect(actions.find((action) => action.id === 'confirm_visit')?.enabled).toBe(true);
    });

    it('does not offer complete visit until the technician is on site', () => {
        const visit = makeVisit({ id: 'v1', status: 'confirmed' });
        const actions = getAvailableVisitActions(visit, EMPTY_WORKBOARD_CONTEXT);

        expect(getCompleteAction(visit, EMPTY_WORKBOARD_CONTEXT)).toBeUndefined();
        expect(actions.find((action) => action.id === 'mark_en_route')?.enabled).toBe(true);
    });

    it('disables complete visit when required evidence is missing', () => {
        const complete = getCompleteAction(
            makeVisit({ id: 'v1', status: 'on_site', evidenceRequired: true }),
            EMPTY_WORKBOARD_CONTEXT,
        );

        expect(complete?.enabled).toBe(false);
        expect(complete?.disabledReason).toContain('evidence');
    });

    it('disables complete visit when asset scan is missing', () => {
        const complete = getCompleteAction(
            makeVisit({ id: 'v1', status: 'on_site', evidenceRequired: false }),
            EMPTY_WORKBOARD_CONTEXT,
        );

        expect(complete?.enabled).toBe(false);
        expect(complete?.disabledReason).toContain('scan');
    });

    it('disables complete visit on scan mismatch', () => {
        const visit = makeVisit({ id: 'v1', status: 'on_site', evidenceRequired: false });
        const context: WorkboardContext = {
            visits: {
                'v1': {
                    assetScanResult: 'mismatch',
                    hasRequiredEvidenceCaptured: true,
                },
            },
        };

        const complete = getCompleteAction(visit, context);

        expect(complete?.enabled).toBe(false);
        expect(complete?.disabledReason).toContain('does not match');
    });

    it('disables complete visit when motion check found rough handling', () => {
        const visit = makeVisit({
            id: 'v1',
            status: 'on_site',
            evidenceRequired: false,
            motionCheckRequired: true,
        });
        const context: WorkboardContext = {
            visits: {
                'v1': {
                    assetScanResult: 'match',
                    motionResult: 'rough_motion_detected',
                },
            },
        };

        const complete = getCompleteAction(visit, context);

        expect(complete?.enabled).toBe(false);
        expect(complete?.disabledReason).toContain('Rough motion');
    });

    it('disables complete visit when motion check is required but missing', () => {
        const visit = makeVisit({
            id: 'v1',
            status: 'on_site',
            evidenceRequired: false,
            motionCheckRequired: true,
        });
        const context: WorkboardContext = {
            visits: { 'v1': { assetScanResult: 'match' } },
        };

        const complete = getCompleteAction(visit, context);

        expect(complete?.enabled).toBe(false);
        expect(complete?.disabledReason).toContain('Motion check');
    });

    it('enables complete visit when on site and all requirements are satisfied', () => {
        const visit = makeVisit({
            id: 'v1',
            status: 'on_site',
            evidenceRequired: true,
            motionCheckRequired: true,
        });
        const context: WorkboardContext = {
            visits: {
                'v1': {
                    hasRequiredEvidenceCaptured: true,
                    assetScanResult: 'match',
                    motionResult: 'stable',
                },
            },
        };

        const complete = getCompleteAction(visit, context);

        expect(complete?.enabled).toBe(true);
        expect(complete?.disabledReason).toBeUndefined();
    });

    it('returns no actions for cancelled visits', () => {
        const actions = getAvailableVisitActions(
            makeVisit({ id: 'v1', status: 'cancelled' }),
            EMPTY_WORKBOARD_CONTEXT,
        );

        expect(actions).toEqual([]);
    });

    it('returns no actions for completed visits', () => {
        const actions = getAvailableVisitActions(
            makeVisit({ id: 'v1', status: 'completed' }),
            EMPTY_WORKBOARD_CONTEXT,
        );

        expect(actions).toEqual([]);
    });
});
