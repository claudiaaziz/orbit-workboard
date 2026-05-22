/**
 * Visit field work: per-visit context, actions, evidence, scan, motion.
 *
 * Owns: workboardContext mutations, overlay open state, action pending/error.
 * Exposes: visitWorkflow (grouped props for VisitDetailSheet).
 * Needs: selectedSiteId + selectedVisitId from useWorkboardSheets.
 */
import { useState, type Dispatch, type SetStateAction } from 'react';
import { Alert } from 'react-native';

import { trackEvent } from '../analytics';
import { performVisitAction, WorkboardApiError } from '../data/mockApi';
import { getVisitFieldState } from '../domain/workboardContext';
import { isVisitActionEnabled } from '../domain/visitActionMutations';
import type { VisitActionId } from '../domain/visitActions';
import { applyAssetScanToFieldState } from '../domain/assetScan';
import { applyMotionCheckToFieldState } from '../domain/motionCheck';
import { applyVisitEvidenceCapture } from '../domain/visitEvidence';
import type { MotionCheckResult, ServiceSite, ServiceVisit, WorkboardContext } from '../types';
import type { VisitWorkflowProps } from './visitWorkflowTypes';

type UseVisitFieldWorkflowParams = {
    sites: ServiceSite[];
    setSites: (sites: ServiceSite[]) => void;
    workboardContext: WorkboardContext;
    setWorkboardContext: Dispatch<SetStateAction<WorkboardContext>>;
    selectedSiteId: string | null;
    selectedVisitId: string | null;
};

export function useVisitFieldWorkflow({
    sites,
    setSites,
    workboardContext,
    setWorkboardContext,
    selectedSiteId,
    selectedVisitId,
}: UseVisitFieldWorkflowParams) {
    const [isEvidenceCaptureOpen, setIsEvidenceCaptureOpen] = useState(false);
    const [isEvidenceRetake, setIsEvidenceRetake] = useState(false);
    const [isAssetScanOpen, setIsAssetScanOpen] = useState(false);
    const [isMotionCheckOpen, setIsMotionCheckOpen] = useState(false);
    const [pendingVisitActionId, setPendingVisitActionId] = useState<VisitActionId | null>(
        null,
    );
    const [visitActionError, setVisitActionError] = useState<string | null>(null);

    function resetVisitUi() {
        setVisitActionError(null);
        setIsEvidenceCaptureOpen(false);
        setIsEvidenceRetake(false);
        setIsAssetScanOpen(false);
        setIsMotionCheckOpen(false);
    }

    function findVisitById(visitId: string): ServiceVisit | undefined {
        for (const site of sites) {
            const visit = site.visits.find((entry) => entry.id === visitId);
            if (visit) {
                return visit;
            }
        }

        return undefined;
    }

    function clearVisitActionError() {
        setVisitActionError(null);
    }

    // evidence functionality
    function openEvidenceCapture(options?: { isRetake?: boolean }) {
        if (!selectedVisitId) {
            return;
        }

        setIsEvidenceRetake(options?.isRetake === true);
        setIsEvidenceCaptureOpen(true);
    }

    function closeEvidenceCapture() {
        setIsEvidenceCaptureOpen(false);
        setIsEvidenceRetake(false);
    }

    function saveVisitEvidence(localUri: string, options: { isRetake: boolean }) {
        if (!selectedVisitId) {
            return;
        }

        const visitId = selectedVisitId;
        const capturedAt = new Date().toISOString();

        setWorkboardContext((current) => {
            const previous = getVisitFieldState(current, visitId);

            return {
                visits: {
                    ...current.visits,
                    [visitId]: applyVisitEvidenceCapture(previous, {
                        localUri,
                        capturedAt,
                        motionSnapshot: {
                            motionResult: previous.motionResult,
                            motionMaxDeviationG: previous.motionMaxDeviationG,
                        },
                    }),
                },
            };
        });

        if (options.isRetake) {
            trackEvent('evidence_retaken', { visitId });
        } else {
            trackEvent('evidence_photo_captured', { visitId });
        }

        trackEvent('evidence_upload_queued', { visitId });
        closeEvidenceCapture();
    }

    function closeAssetScan() {
        setIsAssetScanOpen(false);
    }

    function alertAssetScanResult(
        result: 'match' | 'mismatch' | null,
        visit: ServiceVisit,
        scannedCode: string,
    ) {
        if (result === 'match') {
            Alert.alert(
                'Asset verified',
                `“${scannedCode}” matches expected ${visit.expectedAssetCode} for ${visit.equipmentLabel}.`,
            );
            return;
        }

        if (result === 'mismatch') {
            Alert.alert(
                'Wrong asset code',
                `Expected ${visit.expectedAssetCode} for ${visit.equipmentLabel}. Got “${scannedCode}”.`,
            );
        }
    }

    function scanAssetWithCamera() {
        if (!selectedVisitId || !findVisitById(selectedVisitId)) {
            return;
        }

        setIsAssetScanOpen(true);
    }

    function saveAssetScan(scannedCode: string): 'match' | 'mismatch' | null {
        if (!selectedVisitId) {
            return null;
        }

        const trimmed = scannedCode.trim();
        if (!trimmed) {
            return null;
        }

        const visitId = selectedVisitId;
        const visit = findVisitById(visitId);
        if (!visit) {
            return null;
        }

        const updatedFieldState = applyAssetScanToFieldState(
            getVisitFieldState(workboardContext, visitId),
            visit.expectedAssetCode,
            trimmed,
        );
        const result = updatedFieldState.assetScanResult;

        setWorkboardContext((current) => ({
            visits: {
                ...current.visits,
                [visitId]: updatedFieldState,
            },
        }));

        if (result === 'match') {
            trackEvent('asset_scan_completed', {
                visitId,
                expectedAssetCode: visit.expectedAssetCode,
                scannedAssetCode: trimmed,
            });
        } else {
            trackEvent('asset_scan_mismatch', {
                visitId,
                expectedAssetCode: visit.expectedAssetCode,
                scannedAssetCode: trimmed,
            });
        }

        closeAssetScan();
        alertAssetScanResult(result ?? null, visit, trimmed);
        return result ?? null;
    }

    function openMotionCheck() {
        if (!selectedVisitId) {
            return;
        }

        setIsMotionCheckOpen(true);
    }

    function closeMotionCheck() {
        setIsMotionCheckOpen(false);
    }

    function notifyMotionCaptureStarted() {
        if (!selectedVisitId) {
            return;
        }

        trackEvent('motion_check_started', { visitId: selectedVisitId });
    }

    function saveMotionCheck(result: MotionCheckResult, maxDeviationG: number) {
        if (!selectedVisitId) {
            return;
        }

        const visitId = selectedVisitId;
        const completedAt = new Date().toISOString();

        setWorkboardContext((current) => ({
            visits: {
                ...current.visits,
                [visitId]: applyMotionCheckToFieldState(
                    getVisitFieldState(current, visitId),
                    result,
                    maxDeviationG,
                    completedAt,
                ),
            },
        }));

        trackEvent('motion_check_completed', {
            visitId,
            result,
            maxDeviationG,
        });
        closeMotionCheck();
    }

    async function runVisitAction(actionId: VisitActionId) {
        if (!selectedSiteId || !selectedVisitId || pendingVisitActionId !== null) {
            return;
        }

        const site = sites.find((entry) => entry.id === selectedSiteId);
        const visit = site?.visits.find((entry) => entry.id === selectedVisitId);
        if (!visit) {
            return;
        }

        if (!isVisitActionEnabled(visit, actionId, workboardContext)) {
            return;
        }

        setVisitActionError(null);
        setPendingVisitActionId(actionId);
        trackEvent('visit_action_started', {
            actionId,
            visitId: selectedVisitId,
            siteId: selectedSiteId,
        });

        try {
            const result = await performVisitAction({
                siteId: selectedSiteId,
                visitId: selectedVisitId,
                actionId,
                context: workboardContext,
            });
            setSites(result.sites);
            trackEvent('visit_action_completed', {
                actionId,
                visitId: selectedVisitId,
                siteId: selectedSiteId,
            });
        } catch (error) {
            const message =
                error instanceof WorkboardApiError
                    ? error.message
                    : 'Unable to update the visit right now. Try again in a moment.';

            setVisitActionError(message);
            trackEvent('visit_action_failed', {
                actionId,
                visitId: selectedVisitId,
                siteId: selectedSiteId,
                message,
            });
        } finally {
            setPendingVisitActionId(null);
        }
    }

    const visitWorkflow: VisitWorkflowProps = {
        actions: {
            pendingVisitActionId,
            visitActionError,
            run: runVisitAction,
            clearError: clearVisitActionError,
        },
        evidence: {
            isOpen: isEvidenceCaptureOpen,
            isRetake: isEvidenceRetake,
            open: openEvidenceCapture,
            close: closeEvidenceCapture,
            save: saveVisitEvidence,
        },
        scan: {
            isOpen: isAssetScanOpen,
            start: scanAssetWithCamera,
            close: closeAssetScan,
            save: saveAssetScan,
        },
        motion: {
            isOpen: isMotionCheckOpen,
            open: openMotionCheck,
            close: closeMotionCheck,
            save: saveMotionCheck,
            notifyCaptureStarted: notifyMotionCaptureStarted,
        },
    };

    return {
        workboardContext,
        setWorkboardContext,
        resetVisitUi,
        visitWorkflow,
    };
}

export type UseVisitFieldWorkflowResult = ReturnType<typeof useVisitFieldWorkflow>;
