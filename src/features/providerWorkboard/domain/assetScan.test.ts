import { applyAssetScanToFieldState, classifyAssetScan } from './assetScan';

describe('assetScan', () => {
    it('classifies an exact code match', () => {
        expect(classifyAssetScan('NW-CV-4410', 'NW-CV-4410')).toBe('match');
    });

    it('ignores surrounding whitespace and case', () => {
        expect(classifyAssetScan('NW-CV-4410', '  nw-cv-4410  ')).toBe('match');
    });

    it('classifies a wrong code as mismatch', () => {
        expect(classifyAssetScan('NW-CV-4410', 'WRONG-CODE')).toBe('mismatch');
    });

    it('stores scan result on field state', () => {
        const updated = applyAssetScanToFieldState({}, 'AST-1', 'AST-1');

        expect(updated.assetScanResult).toBe('match');
        expect(updated.scannedAssetCode).toBe('AST-1');
    });
});
