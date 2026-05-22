import type { CameraView } from 'expo-camera';

export type CaptureEvidencePhotoResult =
    | { ok: true; uri: string }
    | { ok: false; reason: 'not_ready' | 'no_uri' | 'failed' };

export async function captureEvidencePhoto(
    camera: CameraView | null,
    options: { cameraReady: boolean },
): Promise<CaptureEvidencePhotoResult> {
    if (!camera || !options.cameraReady) {
        return { ok: false, reason: 'not_ready' };
    }

    try {
        const photo = await camera.takePictureAsync({
            quality: 0.7,
            shutterSound: false,
        });

        if (!photo?.uri) {
            return { ok: false, reason: 'no_uri' };
        }

        return { ok: true, uri: photo.uri };
    } catch {
        return { ok: false, reason: 'failed' };
    }
}
