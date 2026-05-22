import type { AssetScanResult, VisitFieldState } from '../types';

function normalizeAssetCode(value: string): string {
    return value.trim().toUpperCase();
}

export function classifyAssetScan(
    expectedAssetCode: string,
    scannedAssetCode: string,
): AssetScanResult {
    return normalizeAssetCode(expectedAssetCode) === normalizeAssetCode(scannedAssetCode)
        ? 'match'
        : 'mismatch';
}

export function applyAssetScanToFieldState(
    previous: VisitFieldState,
    expectedAssetCode: string,
    scannedAssetCode: string,
): VisitFieldState {
    return {
        ...previous,
        assetScanResult: classifyAssetScan(expectedAssetCode, scannedAssetCode),
        scannedAssetCode: scannedAssetCode.trim(),
    };
}
