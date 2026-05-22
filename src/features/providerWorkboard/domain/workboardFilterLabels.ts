import type {
    DateScopeFilter,
    EvidenceFilter,
    WorkStatus,
} from '../types';

export type FilterOption<T extends string> = {
    label: string;
    value: T;
};

export const WORK_STATUS_FILTER_OPTIONS: FilterOption<WorkStatus | 'all'>[] = [
    { label: 'All', value: 'all' },
    { label: 'Needs attention', value: 'needs_attention' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'In progress', value: 'in_progress' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Completed', value: 'completed' },
];

export const DATE_SCOPE_FILTER_OPTIONS: FilterOption<DateScopeFilter>[] = [
    { label: 'Today', value: 'today' },
    { label: 'Next 7 days', value: 'next_7_days' },
    { label: 'All', value: 'all' },
];

export type EvidenceFilterOptionValue = NonNullable<EvidenceFilter> | 'none';

export const EVIDENCE_FILTER_OPTIONS: FilterOption<EvidenceFilterOptionValue>[] = [
    { label: 'Any', value: 'none' },
    { label: 'Missing proof', value: 'missing_proof' },
    { label: 'Scan mismatch', value: 'scan_mismatch' },
    { label: 'Ready to complete', value: 'ready_to_complete' },
];
