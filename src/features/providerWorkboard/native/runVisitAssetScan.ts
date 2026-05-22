import { ensureCameraPermission } from './ensureCameraPermission';
import { runAssetBarcodeScan } from './runAssetBarcodeScan';

export type VisitAssetScanAttempt =
    | { outcome: 'permission_denied' }
    | { outcome: 'scanned'; code: string }
    | { outcome: 'inline_fallback' };

/** Requests camera once, then tries the OS scanner or signals inline fallback. */
export async function runVisitAssetScan(): Promise<VisitAssetScanAttempt> {
    const granted = await ensureCameraPermission('visit_asset_scan');
    if (!granted) {
        return { outcome: 'permission_denied' };
    }

    const code = await runAssetBarcodeScan();
    if (code) {
        return { outcome: 'scanned', code };
    }

    return { outcome: 'inline_fallback' };
}
