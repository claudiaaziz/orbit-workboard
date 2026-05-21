import type { ServiceVisit } from '../types';
import { EMPTY_WORKBOARD_CONTEXT } from './workboardContext';
import {
    applyVisitActionToVisit,
    getVisitActionConfirmationMessage,
    getVisitStatusAfterAction,
    isVisitActionEnabled,
    visitActionRequiresConfirmation,
} from './visitActionMutations';

function makeVisit(status: ServiceVisit['status']): ServiceVisit {
    return {
        id: 'visit-test-1',
        siteId: 'site-test',
        status,
        serviceType: 'inspection',
        scheduledStart: '2030-08-01T10:00:00.000Z',
        scheduledEnd: '2030-08-01T12:00:00.000Z',
        equipmentLabel: 'Unit 1',
        expectedAssetCode: 'AST-1',
        evidenceRequired: false,
        motionCheckRequired: false,
        locationRequired: false,
        lastUpdatedAt: '2030-06-01T12:00:00.000Z',
    };
}

describe('visitActionMutations', () => {
    it('marks which actions need confirmation', () => {
        expect(visitActionRequiresConfirmation('cancel_visit')).toBe(true);
        expect(visitActionRequiresConfirmation('complete_visit')).toBe(true);
        expect(visitActionRequiresConfirmation('confirm_visit')).toBe(false);
        expect(getVisitActionConfirmationMessage('cancel_visit')).toContain('Cancel');
    });

    it('maps action ids to the next visit status', () => {
        expect(getVisitStatusAfterAction(makeVisit('scheduled'), 'confirm_visit')).toBe(
            'confirmed',
        );
        expect(getVisitStatusAfterAction(makeVisit('confirmed'), 'mark_en_route')).toBe(
            'en_route',
        );
        expect(getVisitStatusAfterAction(makeVisit('on_site'), 'complete_visit')).toBe(
            'completed',
        );
    });

    it('applies blocked reason when reporting blocked', () => {
        const updated = applyVisitActionToVisit(makeVisit('on_site'), 'report_blocked');

        expect(updated.status).toBe('blocked');
        expect(updated.blockedReason).toContain('blocked');
    });

    it('respects eligibility when checking if an action is enabled', () => {
        const visit = makeVisit('scheduled');

        expect(isVisitActionEnabled(visit, 'confirm_visit', EMPTY_WORKBOARD_CONTEXT)).toBe(
            true,
        );
        expect(isVisitActionEnabled(visit, 'complete_visit', EMPTY_WORKBOARD_CONTEXT)).toBe(
            false,
        );
    });

    it('updates lastUpdatedAt when applying an action', () => {
        const updated = applyVisitActionToVisit(
            makeVisit('scheduled'),
            'confirm_visit',
            '2030-09-01T10:00:00.000Z',
        );

        expect(updated.status).toBe('confirmed');
        expect(updated.lastUpdatedAt).toBe('2030-09-01T10:00:00.000Z');
    });
});
