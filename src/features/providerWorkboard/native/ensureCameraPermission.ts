import { Alert } from 'react-native';
import { Camera } from 'expo-camera';

import { trackEvent } from '../analytics';

export type CameraPermissionSource = 'visit_asset_scan' | 'visit_evidence_capture';

export async function ensureCameraPermission(
    source: CameraPermissionSource,
): Promise<boolean> {
    trackEvent('camera_permission_requested', { source });
    const permission = await Camera.requestCameraPermissionsAsync();
    if (permission.status === 'granted') {
        return true;
    }

    Alert.alert(
        'Camera access needed',
        source === 'visit_asset_scan'
            ? 'Allow camera access to scan the asset barcode on the equipment label.'
            : 'Allow camera access to capture visit evidence.',
    );
    return false;
}
