import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCameraPermissionPrompt, type CameraPermissionSource } from '../native/ensureCameraPermission';

type CameraPermissionScreenProps = {
    source: CameraPermissionSource;
    title: string;
    onClose: () => void;
    isLoading: boolean;
    canAskAgain: boolean;
    onAllow: () => void;
    footer?: ReactNode;
};

export function CameraPermissionScreen({
    source,
    title,
    onClose,
    isLoading,
    canAskAgain,
    onAllow,
    footer,
}: CameraPermissionScreenProps) {
    return (
        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    onPress={onClose}
                    hitSlop={8}
                >
                    <Text style={styles.link}>Cancel</Text>
                </Pressable>
            </View>
            <View style={styles.body}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#1D4ED8" />
                ) : (
                    <>
                        <Text style={styles.bodyText}>
                            {canAskAgain
                                ? getCameraPermissionPrompt(source)
                                : 'Camera access was denied. Enable camera in Settings, or use the fallback below.'}
                        </Text>
                        {canAskAgain ? (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Allow camera access"
                                onPress={() => void onAllow()}
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={styles.primaryLabel}>Allow camera</Text>
                            </Pressable>
                        ) : null}
                        {footer}
                    </>
                )}
            </View>
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
    link: {
        fontSize: 16,
        fontWeight: '600',
        color: '#93C5FD',
        minHeight: 44,
        lineHeight: 44,
    },
    body: {
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
    pressed: {
        opacity: 0.85,
    },
});
