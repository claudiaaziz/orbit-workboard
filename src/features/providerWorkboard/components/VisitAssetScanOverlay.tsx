import { CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { classifyAssetScan } from '../domain/assetScan';
import type { AssetScanResult } from '../types';

type VisitAssetScanOverlayProps = {
    expectedAssetCode: string;
    equipmentLabel: string;
    onClose: () => void;
    onScanSaved: (scannedCode: string) => void;
};

export function VisitAssetScanOverlay({
    expectedAssetCode,
    equipmentLabel,
    onClose,
    onScanSaved,
}: VisitAssetScanOverlayProps) {
    const scanLockedRef = useRef(false);
    const [devCodeInput, setDevCodeInput] = useState('');
    const [scanResult, setScanResult] = useState<{
        scannedCode: string;
        result: AssetScanResult;
    } | null>(null);

    function handleBarcodeScanned(data: string) {
        if (scanLockedRef.current) {
            return;
        }

        scanLockedRef.current = true;
        const trimmed = data.trim();
        if (!trimmed) {
            scanLockedRef.current = false;
            return;
        }

        setScanResult({
            scannedCode: trimmed,
            result: classifyAssetScan(expectedAssetCode, trimmed),
        });
    }

    function handleRescan() {
        scanLockedRef.current = false;
        setScanResult(null);
        setDevCodeInput('');
    }

    if (scanResult) {
        const isMatch = scanResult.result === 'match';

        return (
            <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {isMatch ? 'Asset verified' : 'Wrong asset'}
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close asset scan"
                        onPress={onClose}
                        hitSlop={8}
                    >
                        <Text style={styles.link}>Cancel</Text>
                    </Pressable>
                </View>
                <View style={styles.body}>
                    <Text style={styles.subtitle}>{equipmentLabel}</Text>
                    <Text style={styles.bodyText}>Expected: {expectedAssetCode}</Text>
                    <Text style={styles.bodyText}>Scanned: {scanResult.scannedCode}</Text>
                    <Text style={[styles.resultBanner, isMatch ? styles.match : styles.mismatch]}>
                        {isMatch
                            ? 'Code matches — you can save this scan.'
                            : 'Code does not match — rescan or fix before completing.'}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Rescan asset code"
                        onPress={handleRescan}
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.secondaryLabel}>Rescan</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Save asset scan result"
                        onPress={() => onScanSaved(scanResult.scannedCode)}
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                    >
                        <Text style={styles.primaryLabel}>Save scan</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Scan asset code</Text>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Close asset scan"
                            onPress={onClose}
                            hitSlop={8}
                        >
                            <Text style={styles.link}>Cancel</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.subtitle}>
                        {equipmentLabel} · expected {expectedAssetCode}
                    </Text>
                    <Text style={styles.hint}>
                        Point at the QR or barcode until a result appears.
                    </Text>
                    <View style={styles.cameraFrame}>
                        <CameraView
                            style={styles.camera}
                            facing="back"
                            barcodeScannerSettings={{
                                barcodeTypes: ['qr', 'code128', 'code39', 'ean13'],
                            }}
                            onBarcodeScanned={({ data }) => handleBarcodeScanned(data)}
                        />
                    </View>

                    <View style={styles.devSection}>
                        <Text style={styles.devLabel}>
                            Development fallback — enter code if camera scan is unavailable
                        </Text>
                        <TextInput
                            value={devCodeInput}
                            onChangeText={setDevCodeInput}
                            placeholder={expectedAssetCode}
                            placeholderTextColor="#6B7280"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            style={styles.devInput}
                            accessibilityLabel="Development fallback asset code input"
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Apply development fallback asset code"
                            onPress={() => handleBarcodeScanned(devCodeInput)}
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={styles.secondaryLabel}>Apply code (dev)</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#111827',
        zIndex: 11,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 16,
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
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    hint: {
        fontSize: 13,
        color: '#9CA3AF',
        paddingHorizontal: 16,
        marginBottom: 12,
        lineHeight: 18,
    },
    body: {
        flex: 1,
        gap: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    bodyText: {
        fontSize: 15,
        color: '#E5E7EB',
        lineHeight: 22,
    },
    resultBanner: {
        fontSize: 15,
        fontWeight: '600',
        padding: 12,
        borderRadius: 10,
        lineHeight: 20,
    },
    match: {
        backgroundColor: '#064E3B',
        color: '#A7F3D0',
    },
    mismatch: {
        backgroundColor: '#7F1D1D',
        color: '#FECACA',
    },
    cameraFrame: {
        height: 280,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    devSection: {
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingTop: 12,
    },
    devLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        lineHeight: 16,
    },
    devInput: {
        minHeight: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#6B7280',
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#F9FAFB',
        backgroundColor: '#1F2937',
    },
    camera: {
        flex: 1,
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
