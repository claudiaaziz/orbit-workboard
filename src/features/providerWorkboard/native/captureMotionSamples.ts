import { Accelerometer } from 'expo-sensors';

import {
    MOTION_CAPTURE_WINDOW_MS,
    type AccelerometerReading,
} from '../domain/motionCheck';

const SAMPLE_INTERVAL_MS = 100;

export type MotionCaptureOutcome =
    | { ok: true; readings: AccelerometerReading[] }
    | { ok: false; reason: 'unavailable' | 'cancelled' };

export type MotionCaptureHandle = {
    promise: Promise<MotionCaptureOutcome>;
    cancel: () => void;
};

// subscribes, collects readings, stops after the window, and cleans up the subscription.
export function captureMotionSamples(
    durationMs: number = MOTION_CAPTURE_WINDOW_MS,
): MotionCaptureHandle {
    let subscription: { remove: () => void } | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let resolveCapture: ((outcome: MotionCaptureOutcome) => void) | null = null;
    let settled = false;

    function finish(outcome: MotionCaptureOutcome) {
        if (settled) {
            return;
        }

        settled = true;
        subscription?.remove();
        subscription = null;
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        resolveCapture?.(outcome);
        resolveCapture = null;
    }

    const cancel = () => {
        finish({ ok: false, reason: 'cancelled' });
    };

    const promise = Accelerometer.isAvailableAsync().then((available) => {
        if (settled) {
            return { ok: false as const, reason: 'cancelled' as const };
        }

        if (!available) {
            return { ok: false as const, reason: 'unavailable' as const };
        }

        const readings: AccelerometerReading[] = [];

        return new Promise<MotionCaptureOutcome>((resolve) => {
            if (settled) {
                resolve({ ok: false, reason: 'cancelled' });
                return;
            }

            resolveCapture = resolve;
            Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);

            subscription = Accelerometer.addListener((sample) => {
                readings.push({
                    x: sample.x,
                    y: sample.y,
                    z: sample.z,
                });
            });

            timeoutId = setTimeout(() => {
                finish({ ok: true, readings });
            }, durationMs);
        });
    });

    return { promise, cancel };
}
