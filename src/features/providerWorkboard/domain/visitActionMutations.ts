import type { ServiceVisit, VisitStatus, WorkboardContext } from '../types';
import type { VisitActionId } from './visitActions';
import { getAvailableVisitActions } from './visitActions';

const CONFIRMATION_REQUIRED: VisitActionId[] = [
    'complete_visit',
    'report_blocked',
    'cancel_visit',
];

export function visitActionRequiresConfirmation(actionId: VisitActionId): boolean {
    return CONFIRMATION_REQUIRED.includes(actionId);
}

export function getVisitActionConfirmationMessage(actionId: VisitActionId): string {
    switch (actionId) {
        case 'complete_visit':
            return 'Mark this visit as completed?';
        case 'report_blocked':
            return 'Report this visit as blocked?';
        case 'cancel_visit':
            return 'Cancel this visit? This cannot be undone.';
        default:
            return 'Continue with this action?';
    }
}

export function isVisitActionEnabled(
    visit: ServiceVisit,
    actionId: VisitActionId,
    context: WorkboardContext,
): boolean {
    const action = getAvailableVisitActions(visit, context).find((entry) => entry.id === actionId);
    return action?.enabled === true;
}

export function getVisitStatusAfterAction(
    visit: ServiceVisit,
    actionId: VisitActionId,
): VisitStatus {
    switch (actionId) {
        case 'confirm_visit':
            return 'confirmed';
        case 'mark_en_route':
            return 'en_route';
        case 'mark_on_site':
            return 'on_site';
        case 'complete_visit':
            return 'completed';
        case 'report_blocked':
            return 'blocked';
        case 'cancel_visit':
            return 'cancelled';
        default:
            return visit.status;
    }
}

export function applyVisitActionToVisit(
    visit: ServiceVisit,
    actionId: VisitActionId,
    timestamp: string = new Date().toISOString(),
): ServiceVisit {
    const status = getVisitStatusAfterAction(visit, actionId);

    if (actionId === 'report_blocked') {
        return {
            ...visit,
            status,
            blockedReason: visit.blockedReason ?? 'Reported blocked from the field',
            lastUpdatedAt: timestamp,
        };
    }

    if (actionId === 'cancel_visit') {
        return {
            ...visit,
            status,
            lastUpdatedAt: timestamp,
        };
    }

    return {
        ...visit,
        status,
        lastUpdatedAt: timestamp,
    };
}
