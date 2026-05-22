/**
 * Equipment handling stability check — accelerometer capture for a short window.
 */
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    classifyMotionFromSamples,
    computeMaxAccelerationDeviationG,
    MOTION_CAPTURE_WINDOW_MS,
} from '../domain/motionCheck';
import { captureMotionSamples } from '../native/captureMotionSamples';
import type { MotionCheckResult } from '../types';

type Phase = 'intro' | 'capturing' | 'unavailable' | 'result';

type VisitMotionCheckOverlayProps = {
    equipmentLabel: string;
    onClose: () => void;
    onSaved: (result: MotionCheckResult, maxDeviationG: number) => void;
    onCaptureStarted: () => void;
};

export function VisitMotionCheckOverlay({
    equipmentLabel,
    onClose,
    onSaved,
    onCaptureStarted,
}: VisitMotionCheckOverlayProps) {
    const captureCancelRef = useRef<(() => void) | null>(null);
    const abortedRef = useRef(false);
    const [phase, setPhase] = useState<Phase>('intro');
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{
        motionResult: MotionCheckResult;
        maxDeviationG: number;
    } | null>(null);

    useEffect(() => {
        return () => {
            captureCancelRef.current?.();
            captureCancelRef.current = null;
        };
    }, []);

    async function startCapture() {
        if (phase === 'capturing') {
            return;
        }

        abortedRef.current = false;
        onCaptureStarted();
        setPhase('capturing');
        setProgress(0);
        setResult(null);

        const { promise, cancel } = captureMotionSamples();
        captureCancelRef.current = cancel;

        const startedAt = Date.now();
        const progressTimer = setInterval(() => {
            const elapsed = Date.now() - startedAt;
            setProgress(Math.min(1, elapsed / MOTION_CAPTURE_WINDOW_MS));
        }, 50);

        try {
            const outcome = await promise;
            clearInterval(progressTimer);
            captureCancelRef.current = null;
            setProgress(1);

            if (abortedRef.current || (!outcome.ok && outcome.reason === 'cancelled')) {
                return;
            }

            if (!outcome.ok) {
                setPhase('unavailable');
                return;
            }

            const maxDeviationG = computeMaxAccelerationDeviationG(outcome.readings);
            const motionResult = classifyMotionFromSamples(maxDeviationG);
            setResult({ motionResult, maxDeviationG });
            setPhase('result');
        } catch {
            clearInterval(progressTimer);
            captureCancelRef.current = null;
            setPhase('unavailable');
        }
    }

    function handleClose() {
        abortedRef.current = true;
        captureCancelRef.current?.();
        captureCancelRef.current = null;
        onClose();
    }

    function handleSave() {
        if (!result) {
            return;
        }

        onSaved(result.motionResult, result.maxDeviationG);
    }

    if (phase === 'unavailable') {
        return (
            <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Motion check unavailable</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close motion check"
                        onPress={handleClose}
                        hitSlop={8}
                    >
                        <Text style={styles.link}>Close</Text>
                    </Pressable>
                </View>
                <View style={styles.body}>
                    <Text style={styles.subtitle}>{equipmentLabel}</Text>
                    <Text style={styles.bodyText}>
                        This device does not support accelerometer readings. You cannot
                        complete the handling stability check here.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (phase === 'result' && result) {
        const isStable = result.motionResult === 'stable';

        return (
            <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {isStable ? 'Handling stable' : 'Rough handling detected'}
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close motion check"
                        onPress={handleClose}
                        hitSlop={8}
                    >
                        <Text style={styles.link}>Cancel</Text>
                    </Pressable>
                </View>
                <View style={styles.body}>
                    <Text style={styles.subtitle}>{equipmentLabel}</Text>
                    <Text style={styles.bodyText}>
                        Peak deviation from rest: {result.maxDeviationG.toFixed(3)}g
                    </Text>
                    <Text style={[styles.resultBanner, isStable ? styles.stable : styles.rough]}>
                        {isStable
                            ? 'Equipment handling looks stable for this window.'
                            : 'Rough motion detected — save only if accurate, then re-run until stable before completing.'}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Run motion check again"
                        onPress={() => {
                            setPhase('intro');
                            setResult(null);
                            setProgress(0);
                        }}
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryLabel}>Run again</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Save motion check result"
                        onPress={handleSave}
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.primaryLabel}>Save result</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    if (phase === 'capturing') {
        const percent = Math.round(progress * 100);

        return (
            <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Checking handling</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cancel motion check"
                        onPress={handleClose}
                        hitSlop={8}
                    >
                        <Text style={styles.link}>Cancel</Text>
                    </Pressable>
                </View>
                <View style={styles.body}>
                    <Text style={styles.subtitle}>{equipmentLabel}</Text>
                    <Text style={styles.bodyText}>
                        Hold the device steady while we sample movement for{' '}
                        {MOTION_CAPTURE_WINDOW_MS / 1000} seconds.
                    </Text>
                    <View
                        style={styles.progressTrack}
                        accessibilityLabel={`Motion check progress ${percent} percent`}
                    >
                        <View style={[styles.progressFill, { width: `${percent}%` }]} />
                    </View>
                    <Text style={styles.progressLabel}>{percent}%</Text>
                    <ActivityIndicator color="#93C5FD" style={styles.spinner} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Text style={styles.title}>Handling stability check</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close motion check"
                    onPress={handleClose}
                    hitSlop={8}
                >
                    <Text style={styles.link}>Cancel</Text>
                </Pressable>
            </View>
            <View style={styles.body}>
                <Text style={styles.subtitle}>{equipmentLabel}</Text>
                <Text style={styles.bodyText}>
                    We sample accelerometer data for a few seconds to detect rough handling
                    before you complete the visit.
                </Text>
            </View>
            <View style={styles.actions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Start motion check capture"
                    onPress={() => void startCapture()}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                >
                    <Text style={styles.primaryLabel}>Start check</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#111827',
        zIndex: 11,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F9FAFB',
    },
    link: {
        fontSize: 16,
        fontWeight: '600',
        color: '#93C5FD',
        minHeight: 44,
        lineHeight: 44,
    },
    subtitle: {
        fontSize: 14,
        color: '#D1D5DB',
        marginBottom: 8,
    },
    body: {
        flex: 1,
        gap: 12,
        paddingHorizontal: 16,
    },
    bodyText: {
        fontSize: 15,
        color: '#E5E7EB',
        lineHeight: 22,
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#374151',
        overflow: 'hidden',
        marginTop: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#60A5FA',
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#93C5FD',
    },
    spinner: {
        marginTop: 8,
    },
    resultBanner: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
        padding: 12,
        borderRadius: 10,
    },
    stable: {
        backgroundColor: '#064E3B',
        color: '#A7F3D0',
    },
    rough: {
        backgroundColor: '#7C2D12',
        color: '#FED7AA',
    },
    actions: {
        gap: 12,
        padding: 16,
    },
    primaryButton: {
        minHeight: 48,
        borderRadius: 10,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    secondaryButton: {
        minHeight: 48,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#4B5563',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E5E7EB',
    },
    pressed: {
        opacity: 0.85,
    },
});
