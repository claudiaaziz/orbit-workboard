/** Workboard list data older than this is treated as stale (§10). */
// export const WORKBOARD_STALE_AFTER_MS = 10 * 60 * 1000;
export const WORKBOARD_STALE_AFTER_MS = 60 * 1000; // 60 seconds for testing

export function getWorkboardAgeMs(
    fetchedAtIso: string,
    now: Date = new Date(),
): number {
    return Math.max(0, now.getTime() - new Date(fetchedAtIso).getTime());
}

export function isWorkboardStale(
    fetchedAtIso: string | null,
    now: Date = new Date(),
    staleAfterMs: number = WORKBOARD_STALE_AFTER_MS,
): boolean {
    if (!fetchedAtIso) {
        return false;
    }

    return getWorkboardAgeMs(fetchedAtIso, now) >= staleAfterMs;
}

export function formatWorkboardAgeAgo(
    fetchedAtIso: string,
    now: Date = new Date(),
): string {
    const ageMs = getWorkboardAgeMs(fetchedAtIso, now);
    const minutes = Math.floor(ageMs / 60_000);

    if (minutes < 1) {
        return 'just now';
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
