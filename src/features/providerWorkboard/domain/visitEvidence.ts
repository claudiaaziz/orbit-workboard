import type { VisitFieldState } from '../types';

type SaveVisitEvidenceInput = {
    localUri: string;
    capturedAt?: string;
};

/** Pure field-state update after a photo is saved locally. */
export function applyVisitEvidenceCapture(
    previous: VisitFieldState,
    input: SaveVisitEvidenceInput,
): VisitFieldState {
    const capturedAt = input.capturedAt ?? new Date().toISOString();

    return {
        ...previous,
        hasRequiredEvidenceCaptured: true,
        evidencePhotoUri: input.localUri,
        evidenceCapturedAt: capturedAt,
        uploadStatus: 'queued',
    };
}
