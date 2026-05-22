import type { MotionCheckResult, MotionEvidenceMetadata, VisitFieldState } from '../types';

export type MotionSnapshot = {
    motionResult?: MotionCheckResult;
    motionMaxDeviationG?: number;
};

type SaveVisitEvidenceInput = {
    localUri: string;
    capturedAt?: string;
    motionSnapshot?: MotionSnapshot;
};

export function buildMotionEvidenceMetadata(
    capturedAt: string,
    motionSnapshot?: MotionSnapshot,
): MotionEvidenceMetadata {
    const metadata: MotionEvidenceMetadata = { capturedAt };

    if (motionSnapshot?.motionResult !== undefined) {
        metadata.motionResult = motionSnapshot.motionResult;
    }

    if (motionSnapshot?.motionMaxDeviationG !== undefined) {
        metadata.motionMaxDeviationG = motionSnapshot.motionMaxDeviationG;
    }

    return metadata;
}

/** Pure field-state update after a photo is saved locally. */
export function applyVisitEvidenceCapture(
    previous: VisitFieldState,
    input: SaveVisitEvidenceInput,
): VisitFieldState {
    const capturedAt = input.capturedAt ?? new Date().toISOString();
    const motionEvidenceMetadata = buildMotionEvidenceMetadata(
        capturedAt,
        input.motionSnapshot,
    );

    return {
        ...previous,
        hasRequiredEvidenceCaptured: true,
        evidencePhotoUri: input.localUri,
        evidenceCapturedAt: capturedAt,
        motionEvidenceMetadata,
        uploadStatus: 'queued',
    };
}
