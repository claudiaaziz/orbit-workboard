import { CameraView } from 'expo-camera';

const SCAN_BARCODE_TYPES = ['qr', 'code128', 'code39', 'ean13'] as const;

const SCAN_WAIT_MS = 90_000;

/**
 * Opens the system barcode scanner (iOS DataScanner / Android ML Kit).
 * Resolves with the first scanned payload, or null if unavailable / cancelled / timed out.
 */
export function runAssetBarcodeScan(): Promise<string | null> {
    if (!CameraView.isModernBarcodeScannerAvailable) {
        return Promise.resolve(null);
    }

    return new Promise((resolve) => {
        let settled = false;

        function finish(value: string | null) {
            if (settled) {
                return;
            }

            settled = true;
            clearTimeout(timeoutId);
            subscription.remove();
            resolve(value);
        }

        const subscription = CameraView.onModernBarcodeScanned((event) => {
            const data = event.data?.trim();
            if (!data) {
                return;
            }

            void CameraView.dismissScanner();
            finish(data);
        });

        const timeoutId = setTimeout(() => {
            void CameraView.dismissScanner();
            finish(null);
        }, SCAN_WAIT_MS);

        void CameraView.launchScanner({
            barcodeTypes: [...SCAN_BARCODE_TYPES],
        });
    });
}
