/**
 * Visit evidence capture UI. Camera permission: useCameraPermissionGate + CameraPermissionScreen.
 */
import { CameraView } from 'expo-camera';
import type { CameraView as CameraViewType } from 'expo-camera';
import { useRef, useState } from 'react';
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

import { CameraPermissionScreen } from './CameraPermissionScreen';
import { useCameraPermissionGate } from '../viewModels/useCameraPermissionGate';
import { captureEvidencePhoto } from '../native/captureEvidencePhoto';

const PLACEHOLDER_EVIDENCE = require('../../../../assets/icon.png');

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
    const cameraPermission = useCameraPermissionGate('visit_evidence_capture');
    const [cameraReady, setCameraReady] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [captureError, setCaptureError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

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
        } finally {
            setIsCapturing(false);
        }
    }

    function handleSimulatorFallback() {
        onCaptured(getPlaceholderEvidenceUri(), { isRetake });
    }

    const placeholderFooter = (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use placeholder evidence for simulator"
            onPress={handleSimulatorFallback}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
            <Text style={styles.secondaryLabel}>Use placeholder photo (simulator / dev)</Text>
        </Pressable>
    );

    if (previewUri) {
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
                        onPress={() => {
                            setPreviewUri(null);
                            setCaptureError(null);
                        }}
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryLabel}>Retake</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Use photo as visit evidence"
                        onPress={() => onCaptured(previewUri, { isRetake })}
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.primaryLabel}>Use photo</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    if (!cameraPermission.isGranted) {
        return (
            <CameraPermissionScreen
                source="visit_evidence_capture"
                title="Camera access"
                onClose={onClose}
                isLoading={cameraPermission.isLoading}
                canAskAgain={cameraPermission.canAskAgain}
                onAllow={cameraPermission.requestAccess}
                footer={placeholderFooter}
            />
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
