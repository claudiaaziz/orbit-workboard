import { Camera, type PermissionResponse } from 'expo-camera';
import { Alert } from 'react-native';

import { trackEvent } from '../analytics';

export type CameraPermissionSource = 'visit_asset_scan' | 'visit_evidence_capture';

const PERMISSION_PROMPT: Record<CameraPermissionSource, string> = {
    visit_asset_scan:
        'Camera access is required to scan the asset barcode on the equipment label.',
    visit_evidence_capture:
        'Camera access is required to capture visit evidence for the field record.',
};

const PERMISSION_DENIED_ALERT: Record<CameraPermissionSource, string> = {
    visit_asset_scan:
        'Allow camera access to scan the asset barcode on the equipment label.',
    visit_evidence_capture: 'Allow camera access to capture visit evidence.',
};

export function isCameraGranted(permission: PermissionResponse | null): boolean {
    return permission?.granted === true;
}

export function getCameraPermissionPrompt(source: CameraPermissionSource): string {
    return PERMISSION_PROMPT[source];
}

/** Read current camera permission without showing a system dialog. */
export async function getCameraPermission(): Promise<PermissionResponse> {
    return Camera.getCameraPermissionsAsync();
}

/**
 * Request camera permission once. Tracks analytics and shows one alert if denied.
 * Call getCameraPermission() afterward if the UI needs fresh canAskAgain/granted flags.
 */
export async function ensureCameraPermission(
    source: CameraPermissionSource,
): Promise<boolean> {
    trackEvent('camera_permission_requested', { source });
    const result = await Camera.requestCameraPermissionsAsync();
    if (result.granted) {
        return true;
    }

    Alert.alert('Camera access needed', PERMISSION_DENIED_ALERT[source]);
    return false;
}
