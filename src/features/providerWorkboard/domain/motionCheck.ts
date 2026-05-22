import type { MotionCheckResult, VisitFieldState } from '../types';

/** Capture window per spec (3–5 seconds). */
export const MOTION_CAPTURE_WINDOW_MS = 4000;

/** Readings at rest are ~1g; higher peak deviation implies rough handling. */
/** Peak |magnitude − 1g| allowed to count as stable handling. */
export const MOTION_STABLE_MAX_DEVIATION_G = 0.15;

export type AccelerometerReading = {
    x: number;
    y: number;
    z: number;
};

export function readingMagnitudeG(reading: AccelerometerReading): number {
    return Math.sqrt(reading.x * reading.x + reading.y * reading.y + reading.z * reading.z);
}

/** Peak deviation from 1g across samples. */
export function computeMaxAccelerationDeviationG(readings: AccelerometerReading[]): number {
    if (readings.length === 0) {
        return 0;
    }

    let maxDeviation = 0;
    for (const reading of readings) {
        const deviation = Math.abs(readingMagnitudeG(reading) - 1);
        maxDeviation = Math.max(maxDeviation, deviation);
    }

    return maxDeviation;
}

export function classifyMotionFromSamples(maxDeviationG: number): MotionCheckResult {
    return maxDeviationG <= MOTION_STABLE_MAX_DEVIATION_G
        ? 'stable'
        : 'rough_motion_detected';
}

export function applyMotionCheckToFieldState(
    previous: VisitFieldState,
    result: MotionCheckResult,
    maxDeviationG: number,
    completedAt: string,
): VisitFieldState {
    return {
        ...previous,
        motionResult: result,
        motionMaxDeviationG: maxDeviationG,
        motionCheckCompletedAt: completedAt,
    };
}
