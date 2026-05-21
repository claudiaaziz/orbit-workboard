import { applyVisitEvidenceCapture } from './visitEvidence';

describe('applyVisitEvidenceCapture', () => {
    it('marks evidence captured with uri, timestamp, and queued upload', () => {
        const updated = applyVisitEvidenceCapture(
            { uploadStatus: 'failed' },
            {
                localUri: 'file:///cache/photo.jpg',
                capturedAt: '2030-09-01T10:00:00.000Z',
            },
        );

        expect(updated.hasRequiredEvidenceCaptured).toBe(true);
        expect(updated.evidencePhotoUri).toBe('file:///cache/photo.jpg');
        expect(updated.evidenceCapturedAt).toBe('2030-09-01T10:00:00.000Z');
        expect(updated.uploadStatus).toBe('queued');
    });
});
