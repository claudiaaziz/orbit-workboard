import {
    formatWorkboardAgeAgo,
    getWorkboardAgeMs,
    isWorkboardStale,
    WORKBOARD_STALE_AFTER_MS,
} from './workboardStaleness';

const NOW = new Date('2030-06-15T12:00:00.000Z');

describe('workboardStaleness', () => {
    it('treats data as fresh before the stale threshold', () => {
        const fetchedAt = new Date(NOW.getTime() - WORKBOARD_STALE_AFTER_MS + 60_000).toISOString();

        expect(isWorkboardStale(fetchedAt, NOW)).toBe(false);
    });

    it('treats data as stale at or past the threshold', () => {
        const fetchedAt = new Date(NOW.getTime() - WORKBOARD_STALE_AFTER_MS).toISOString();

        expect(isWorkboardStale(fetchedAt, NOW)).toBe(true);
    });

    it('formats age in minutes for the stale banner', () => {
        const fetchedAt = new Date(NOW.getTime() - 12 * 60_000).toISOString();

        expect(getWorkboardAgeMs(fetchedAt, NOW)).toBe(12 * 60_000);
        expect(formatWorkboardAgeAgo(fetchedAt, NOW)).toBe('12m ago');
    });
});
