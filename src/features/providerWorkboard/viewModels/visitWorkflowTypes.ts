/**
 * Shared types for visit-level UI wiring (no runtime logic).
 *
 * VisitWorkflowProps — grouped callbacks/state for VisitDetailSheet
 *   (actions, evidence, scan, motion).
 * VisitSheetProps — what SiteDetailSheet forwards to the visit sheet.
 */
import type { VisitActionId } from '../domain/visitActions';
import type { VisitDetailModel } from '../domain/visitDetail';

export type VisitWorkflowProps = {
    actions: {
        pendingVisitActionId: VisitActionId | null;
        visitActionError: string | null;
        run: (actionId: VisitActionId) => void;
        clearError: () => void;
    };
    evidence: {
        isOpen: boolean;
        isRetake: boolean;
        open: (options?: { isRetake?: boolean }) => void;
        close: () => void;
        save: (localUri: string, options: { isRetake: boolean }) => void;
    };
    scan: {
        isOpen: boolean;
        start: () => void;
        close: () => void;
        save: (scannedCode: string) => 'match' | 'mismatch' | null;
    };
    motion: {
        recordStable: () => void;
    };
};

export type VisitSheetProps = {
    visitDetail: VisitDetailModel | null;
    visitWorkflow: VisitWorkflowProps;
    onCloseVisit: () => void;
};
