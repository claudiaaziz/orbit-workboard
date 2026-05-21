import type { ServiceVisit, WorkboardContext } from '../types';
import { getVisitFieldState } from './workboardContext';
import {
    visitAssetScanSatisfied,
    visitMissingRequiredEvidence,
    visitMotionCheckSatisfied,
    visitReadyToComplete,
} from './utils/visits';

export type VisitActionId =
    | 'confirm_visit'
    | 'mark_en_route'
    | 'mark_on_site'
    | 'complete_visit'
    | 'report_blocked'
    | 'cancel_visit';

export type VisitActionItem = {
    id: VisitActionId;
    label: string;
    enabled: boolean;
    disabledReason?: string;
};

function completeDisabledReason(
    visit: ServiceVisit,
    context: WorkboardContext,
): string | undefined {
    if (visit.status !== 'on_site') {
        return 'Complete visit after you are on site';
    }

    if (visitMissingRequiredEvidence(visit, context)) {
        return 'Required photo evidence is missing';
    }

    if (getVisitFieldState(context, visit.id).assetScanResult === 'mismatch') {
        return 'Asset scan does not match expected equipment';
    }

    if (!visitAssetScanSatisfied(visit, context)) {
        return 'Asset scan is required before completion';
    }

    if (visit.motionCheckRequired && !getVisitFieldState(context, visit.id).motionResult) {
        return 'Motion check is required';
    }

    if (visit.motionCheckRequired && !visitMotionCheckSatisfied(visit, context)) {
        return 'Rough motion detected — resolve before completing';
    }

    return undefined;
}

// Public API — slice 5 will wire mutations to these ids
export function getAvailableVisitActions(
    visit: ServiceVisit,
    context: WorkboardContext,
): VisitActionItem[] {
    if (visit.status === 'completed' || visit.status === 'cancelled') {
        return [];
    }

    const actions: VisitActionItem[] = [];

    if (visit.status === 'scheduled') {
        actions.push({
            id: 'confirm_visit',
            label: 'Confirm visit',
            enabled: true,
        });
    }

    if (visit.status === 'confirmed') {
        actions.push({
            id: 'mark_en_route',
            label: 'Mark en route',
            enabled: true,
        });
    }

    if (visit.status === 'en_route') {
        actions.push({
            id: 'mark_on_site',
            label: 'Mark on site',
            enabled: true,
        });
    }

    if (visit.status === 'on_site') {
        const ready = visitReadyToComplete(visit, context);
        actions.push({
            id: 'complete_visit',
            label: 'Complete visit',
            enabled: ready,
            disabledReason: ready ? undefined : completeDisabledReason(visit, context),
        });
    }

    if (visit.status !== 'blocked') {
        actions.push({
            id: 'report_blocked',
            label: 'Report blocked',
            enabled: true,
        });
    }

    if (visit.status === 'scheduled' || visit.status === 'confirmed') {
        actions.push({
            id: 'cancel_visit',
            label: 'Cancel visit',
            enabled: true,
        });
    }

    return actions;
}
