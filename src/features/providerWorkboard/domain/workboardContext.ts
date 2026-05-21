import type { VisitFieldState, WorkboardContext } from '../types';

export type { VisitFieldState, WorkboardContext } from '../types';

export const EMPTY_WORKBOARD_CONTEXT: WorkboardContext = {
    visits: {},
};

export function getVisitFieldState(
    context: WorkboardContext,
    visitId: string,
): VisitFieldState {
    return context.visits[visitId] ?? {};
}
