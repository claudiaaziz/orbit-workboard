// permission prompts, camera preview, photo review.
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraView as CameraViewType } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { captureEvidencePhoto } from '../native/captureEvidencePhoto';
import { ensureCameraPermission } from '../native/ensureCameraPermission';

const PLACEHOLDER_EVIDENCE = require('../../../../assets/icon.png');

type CaptureStep = 'permission' | 'camera' | 'preview';

function getPlaceholderEvidenceUri(): string {
    return Image.resolveAssetSource(PLACEHOLDER_EVIDENCE).uri;
}

type VisitEvidenceCaptureOverlayProps = {
    equipmentLabel: string;
    onClose: () => void;
    onCaptured: (localUri: string, options: { isRetake: boolean }) => void;
    isRetake: boolean;
};

export function VisitEvidenceCaptureOverlay({
    equipmentLabel,
    onClose,
    onCaptured,
    isRetake,
}: VisitEvidenceCaptureOverlayProps) {
    const cameraRef = useRef<CameraViewType>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [step, setStep] = useState<CaptureStep>('permission');
    const [cameraReady, setCameraReady] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [captureError, setCaptureError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        setStep(permission?.granted ? 'camera' : 'permission');
    }, [permission?.granted]);

    async function handleRequestPermission() {
        const granted = await ensureCameraPermission('visit_evidence_capture');
        if (granted) {
            await requestPermission();
            setStep('camera');
        }
    }

    async function handleTakePhoto() {
        if (isCapturing) {
            return;
        }

        setCaptureError(null);
        setIsCapturing(true);

        try {
            const result = await captureEvidencePhoto(cameraRef.current, { cameraReady });

            if (!result.ok) {
                setCaptureError(
                    result.reason === 'no_uri'
                        ? 'Could not save the photo. Try again.'
                        : 'Camera capture failed. Try again or use the simulator fallback.',
                );
                return;
            }

            setPreviewUri(result.uri);
            setStep('preview');
        } finally {
            setIsCapturing(false);
        }
    }

    function handleUsePhoto() {
        if (!previewUri) {
            return;
        }

        onCaptured(previewUri, { isRetake });
    }

    function handleRetakePreview() {
        setPreviewUri(null);
        setStep('camera');
        setCaptureError(null);
    }

    function handleSimulatorFallback() {
        onCaptured(getPlaceholderEvidenceUri(), { isRetake });
    }

    if (step === 'preview' && previewUri) {
        return (
            <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Review photo</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close evidence capture"
                        onPress={onClose}
                        hitSlop={8}
                    >
                        <Text style={styles.link}>Cancel</Text>
                    </Pressable>
                </View>
                <Text style={styles.subtitle}>{equipmentLabel}</Text>
                <Image
                    source={{ uri: previewUri }}
                    style={styles.previewImage}
                    accessibilityLabel="Captured evidence preview"
                />
                <View style={styles.actions}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Retake photo"
                        onPress={handleRetakePreview}
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryLabel}>Retake</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Use photo as visit evidence"
                        onPress={handleUsePhoto}
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.primaryLabel}>Use photo</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    if (step === 'permission' && !permission?.granted) {
        return (
            <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Camera access</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close evidence capture"
                        onPress={onClose}
                        hitSlop={8}
                    >
                        <Text style={styles.link}>Cancel</Text>
                    </Pressable>
                </View>
                <View style={styles.permissionBody}>
                    {!permission ? (
                        <ActivityIndicator size="large" color="#1D4ED8" />
                    ) : (
                        <>
                            <Text style={styles.bodyText}>
                                {permission.canAskAgain
                                    ? 'Camera access is required to capture visit evidence for the field record.'
                                    : 'Camera access was denied. Enable camera in Settings, or use the simulator fallback below.'}
                            </Text>
                            {permission.canAskAgain ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Allow camera access"
                                    onPress={() => void handleRequestPermission()}
                                    style={({ pressed }) => [
                                        styles.primaryButton,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <Text style={styles.primaryLabel}>Allow camera</Text>
                                </Pressable>
                            ) : null}
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Use placeholder evidence for simulator"
                                onPress={handleSimulatorFallback}
                                style={({ pressed }) => [
                                    styles.secondaryButton,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={styles.secondaryLabel}>
                                    Use placeholder photo (simulator / dev)
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Text style={styles.title}>{isRetake ? 'Retake evidence' : 'Capture evidence'}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close evidence capture"
                    onPress={onClose}
                    hitSlop={8}
                >
                    <Text style={styles.link}>Cancel</Text>
                </Pressable>
            </View>
            <Text style={styles.subtitle}>{equipmentLabel}</Text>

            <View style={styles.cameraFrame}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                    onCameraReady={() => setCameraReady(true)}
                />
            </View>

            {captureError ? <Text style={styles.errorText}>{captureError}</Text> : null}

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Take evidence photo"
                disabled={!cameraReady || isCapturing}
                onPress={() => void handleTakePhoto()}
                style={({ pressed }) => [
                    styles.primaryButton,
                    (!cameraReady || isCapturing) && styles.primaryButtonDisabled,
                    pressed && cameraReady && !isCapturing && styles.pressed,
                ]}
            >
                {isCapturing ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.primaryLabel}>Take photo</Text>
                )}
            </Pressable>

            {Platform.OS === 'web' ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Use placeholder evidence on web"
                    onPress={handleSimulatorFallback}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                    <Text style={styles.secondaryLabel}>Use placeholder (web)</Text>
                </Pressable>
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#111827',
        zIndex: 10,
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
    subtitle: {
        fontSize: 14,
        color: '#D1D5DB',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    link: {
        fontSize: 16,
        fontWeight: '600',
        color: '#93C5FD',
        minHeight: 44,
        lineHeight: 44,
    },
    permissionBody: {
        flex: 1,
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 20,
    },
    bodyText: {
        fontSize: 15,
        color: '#E5E7EB',
        lineHeight: 22,
    },
    cameraFrame: {
        flex: 1,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000000',
    },
    camera: {
        flex: 1,
    },
    previewImage: {
        flex: 1,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#000000',
    },
    actions: {
        gap: 10,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    primaryButton: {
        minHeight: 48,
        borderRadius: 10,
        backgroundColor: '#1D4ED8',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
    },
    primaryButtonDisabled: {
        backgroundColor: '#4B5563',
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
        borderColor: '#6B7280',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        paddingHorizontal: 12,
    },
    secondaryLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E5E7EB',
        textAlign: 'center',
    },
    pressed: {
        opacity: 0.85,
    },
    errorText: {
        fontSize: 14,
        color: '#FCA5A5',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
});
