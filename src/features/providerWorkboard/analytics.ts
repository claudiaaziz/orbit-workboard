/** Central analytics boundary — console transport for now; swap for production SDK later. */
export type AnalyticsEventName =
    | 'workboard_viewed'
    | 'search_submitted'
    | 'filter_changed'
    | 'site_opened'
    | 'visit_opened'
    | 'visit_action_started'
    | 'visit_action_completed'
    | 'visit_action_failed'
    | 'refresh_triggered'
    | 'camera_permission_requested'
    | 'evidence_photo_captured'
    | 'evidence_retaken'
    | 'asset_scan_completed'
    | 'asset_scan_mismatch'
    | 'motion_check_started'
    | 'motion_check_completed'
    | 'evidence_upload_queued'
    | 'evidence_upload_failed';

export type AnalyticsPayload = Record<
    string,
    string | number | boolean | null | undefined
>;

// TODO: call this
export function trackEvent(
    name: AnalyticsEventName,
    payload: AnalyticsPayload = {},
): void {
    console.log('[analytics]', {
        name,
        payload,
        trackedAt: new Date().toISOString(),
    });
}