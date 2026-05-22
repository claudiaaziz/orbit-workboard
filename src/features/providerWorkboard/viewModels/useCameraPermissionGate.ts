import { useCallback, useEffect, useState } from 'react';
import type { PermissionResponse } from 'expo-camera';

import {
    ensureCameraPermission,
    getCameraPermission,
    isCameraGranted,
    type CameraPermissionSource,
} from '../native/ensureCameraPermission';

/**
 * Shared camera permission state for capture overlays.
 * Read on mount; call requestAccess() from an Allow button (not on open).
 */
export function useCameraPermissionGate(source: CameraPermissionSource) {
    const [permission, setPermission] = useState<PermissionResponse | null>(null);

    const refresh = useCallback(async () => {
        setPermission(await getCameraPermission());
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const requestAccess = useCallback(async () => {
        const granted = await ensureCameraPermission(source);
        await refresh();
        return granted;
    }, [source, refresh]);

    return {
        permission,
        isLoading: permission === null,
        isGranted: isCameraGranted(permission),
        canAskAgain: permission?.canAskAgain !== false,
        requestAccess,
    };
}
