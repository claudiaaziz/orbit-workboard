import { applyVisitEvidenceCapture, buildMotionEvidenceMetadata } from './visitEvidence';

describe('visitEvidence', () => {
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
        expect(updated.motionEvidenceMetadata).toEqual({
            capturedAt: '2030-09-01T10:00:00.000Z',
        });
    });

    it('snapshots motion summary onto evidence metadata at capture', () => {
        const updated = applyVisitEvidenceCapture(
            {
                motionResult: 'stable',
                motionMaxDeviationG: 0.08,
            },
            {
                localUri: 'file:///cache/photo.jpg',
                capturedAt: '2030-09-01T10:00:00.000Z',
                motionSnapshot: {
                    motionResult: 'stable',
                    motionMaxDeviationG: 0.08,
                },
            },
        );

        expect(updated.motionEvidenceMetadata).toEqual({
            capturedAt: '2030-09-01T10:00:00.000Z',
            motionResult: 'stable',
            motionMaxDeviationG: 0.08,
        });
    });

    it('builds metadata without motion when check was not run', () => {
        expect(buildMotionEvidenceMetadata('2030-09-01T10:00:00.000Z')).toEqual({
            capturedAt: '2030-09-01T10:00:00.000Z',
        });
    });
});
