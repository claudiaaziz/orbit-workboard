import type { ServiceVisit, WorkboardContext } from '../../types';
import { EMPTY_WORKBOARD_CONTEXT } from '../workboardContext';
import { visitReadyToComplete } from './visits';

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

describe('visitReadyToComplete', () => {
    it('returns false when not on site', () => {
        expect(
            visitReadyToComplete(
                makeVisit({ id: 'v1', status: 'confirmed' }),
                EMPTY_WORKBOARD_CONTEXT,
            ),
        ).toBe(false);
    });

    it('returns false when asset scan is missing', () => {
        expect(
            visitReadyToComplete(
                makeVisit({ id: 'v1', status: 'on_site', evidenceRequired: false }),
                EMPTY_WORKBOARD_CONTEXT,
            ),
        ).toBe(false);
    });

    it('returns false on scan mismatch', () => {
        const context: WorkboardContext = {
            visits: { 'v1': { assetScanResult: 'mismatch' } },
        };

        expect(
            visitReadyToComplete(makeVisit({ id: 'v1', status: 'on_site' }), context),
        ).toBe(false);
    });

    it('returns false when motion is required but not stable', () => {
        const context: WorkboardContext = {
            visits: {
                'v1': {
                    assetScanResult: 'match',
                    motionResult: 'rough_motion_detected',
                },
            },
        };

        expect(
            visitReadyToComplete(
                makeVisit({
                    id: 'v1',
                    status: 'on_site',
                    motionCheckRequired: true,
                }),
                context,
            ),
        ).toBe(false);
    });

    it('returns true when motion is not required and scan matches', () => {
        const context: WorkboardContext = {
            visits: { 'v1': { assetScanResult: 'match' } },
        };

        expect(
            visitReadyToComplete(
                makeVisit({
                    id: 'v1',
                    status: 'on_site',
                    evidenceRequired: false,
                    motionCheckRequired: false,
                }),
                context,
            ),
        ).toBe(true);
    });

    it('returns true when on site with proof, matching scan, and stable motion', () => {
        const context: WorkboardContext = {
            visits: {
                'v1': {
                    hasRequiredEvidenceCaptured: true,
                    assetScanResult: 'match',
                    motionResult: 'stable',
                },
            },
        };

        expect(
            visitReadyToComplete(
                makeVisit({
                    id: 'v1',
                    status: 'on_site',
                    evidenceRequired: true,
                    motionCheckRequired: true,
                }),
                context,
            ),
        ).toBe(true);
    });
});
