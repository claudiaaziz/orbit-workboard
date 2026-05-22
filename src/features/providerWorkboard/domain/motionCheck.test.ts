import {
    classifyMotionFromSamples,
    computeMaxAccelerationDeviationG,
    MOTION_STABLE_MAX_DEVIATION_G,
    readingMagnitudeG,
} from './motionCheck';

describe('motionCheck', () => {
    it('computes magnitude near 1g for a steady reading', () => {
        expect(readingMagnitudeG({ x: 0, y: 0, z: 1 })).toBeCloseTo(1, 5);
    });

    it('classifies low deviation as stable', () => {
        expect(classifyMotionFromSamples(0.05)).toBe('stable');
        expect(classifyMotionFromSamples(MOTION_STABLE_MAX_DEVIATION_G)).toBe('stable');
    });

    it('classifies high deviation as rough motion', () => {
        expect(classifyMotionFromSamples(MOTION_STABLE_MAX_DEVIATION_G + 0.01)).toBe(
            'rough_motion_detected',
        );
    });

    it('computes max deviation from 1g across readings', () => {
        const maxDeviationG = computeMaxAccelerationDeviationG([
            { x: 0, y: 0, z: 1 },
            { x: 0, y: 0, z: 1.3 },
        ]);
        expect(maxDeviationG).toBeCloseTo(0.3, 5);
    });

    it('returns 0 when there are no readings', () => {
        expect(computeMaxAccelerationDeviationG([])).toBe(0);
    });
});
