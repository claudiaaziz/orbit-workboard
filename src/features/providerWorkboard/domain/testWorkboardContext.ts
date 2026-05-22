import type { WorkboardContext } from '../types';

/** Shared visit field state for tests — not used at runtime. */
export const TEST_CONTEXT_SCAN_MISMATCH: WorkboardContext = {
    visits: {
        'visit-site-edge-001-1': {
            assetScanResult: 'mismatch',
            uploadStatus: 'failed',
        },
    },
};

export const TEST_CONTEXT_CAPTURED_ON_SITE: WorkboardContext = {
    visits: {
        'visit-site-edge-002-1': {
            hasRequiredEvidenceCaptured: true,
            assetScanResult: 'match',
            uploadStatus: 'uploaded',
            motionResult: 'stable',
            motionMaxDeviationG: 0.06,
            evidenceCapturedAt: '2030-06-15T14:30:00.000Z',
            motionEvidenceMetadata: {
                capturedAt: '2030-06-15T14:30:00.000Z',
                motionResult: 'stable',
                motionMaxDeviationG: 0.06,
            },
        },
    },
};

export const TEST_CONTEXT_UPLOAD_QUEUE: WorkboardContext = {
    visits: {
        'visit-site-edge-001-1': { uploadStatus: 'failed' },
        'visit-site-edge-002-2': { uploadStatus: 'queued' },
    },
};
