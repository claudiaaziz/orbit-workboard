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
