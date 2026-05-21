import type { ServiceSite } from '../../types';

// Addresses
export function formatCompactAddress(site: ServiceSite): string {
    return `${site.address.city}, ${site.address.region}`;
}

export function formatFullAddress(site: ServiceSite): string {
    const { line1, city, region, postalCode } = site.address;
    return `${line1}, ${city}, ${region} ${postalCode}`;
}

// Dates
export function formatVisitStartTime(isoStart: string): string {
    const start = new Date(isoStart);
    return start.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function formatVisitTimeWindow(scheduledStart: string, scheduledEnd: string): string {
    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    const datePart = start.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const startTime = start.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    });
    const endTime = end.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    });

    return `${datePart} · ${startTime} – ${endTime}`;
}

export function formatLastUpdated(isoTimestamp: string): string {
    return new Date(isoTimestamp).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
