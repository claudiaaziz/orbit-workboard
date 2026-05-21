import type { WorkboardContext } from '../types';

/** Mock field state for filters/summary until visit mutations persist evidence and scans. */
export const MOCK_WORKBOARD_CONTEXT: WorkboardContext = {
    visits: {
        'visit-site-edge-001-1': {
            assetScanResult: 'mismatch',
            uploadStatus: 'failed',
        },
        'visit-site-edge-001-2': {
            hasRequiredEvidenceCaptured: false,
        },
        'visit-site-edge-002-1': {
            hasRequiredEvidenceCaptured: true,
            assetScanResult: 'match',
            uploadStatus: 'uploaded',
        },
        'visit-site-edge-002-2': {
            uploadStatus: 'queued',
        },
    },
};
