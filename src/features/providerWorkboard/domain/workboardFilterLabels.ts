import type {
    DateScopeFilter,
    EvidenceFilter,
    WorkboardFilters,
    WorkStatus,
} from '../types';
import { DEFAULT_WORKBOARD_FILTERS } from '../types';

export type FilterChipOption<T extends string> = {
    label: string;
    value: T;
};

export const WORK_STATUS_FILTER_OPTIONS: FilterChipOption<WorkStatus | 'all'>[] = [
    { label: 'All', value: 'all' },
    { label: 'Needs attention', value: 'needs_attention' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'In progress', value: 'in_progress' },
    { label: 'Blocked', value: 'blocked' },
    { label: 'Completed', value: 'completed' },
];

export const DATE_SCOPE_FILTER_OPTIONS: FilterChipOption<DateScopeFilter>[] = [
    { label: 'Today', value: 'today' },
    { label: 'Next 7 days', value: 'next_7_days' },
    { label: 'All dates', value: 'all' },
];

export const EVIDENCE_FILTER_OPTIONS: FilterChipOption<NonNullable<EvidenceFilter>>[] = [
    { label: 'Needs proof', value: 'missing_proof' },
    { label: 'Scan mismatch', value: 'scan_mismatch' },
    { label: 'Ready to complete', value: 'ready_to_complete' },
];

function labelForValue<T extends string>(
    options: FilterChipOption<T>[],
    value: T,
): string {
    return options.find((option) => option.value === value)?.label ?? value;
}

function getWorkStatusFilterLabel(workStatus: WorkStatus | 'all'): string {
    return labelForValue(WORK_STATUS_FILTER_OPTIONS, workStatus);
}

function getDateScopeFilterLabel(dateScope: DateScopeFilter): string {
    return labelForValue(DATE_SCOPE_FILTER_OPTIONS, dateScope);
}

function getEvidenceFilterLabel(evidenceFilter: NonNullable<EvidenceFilter>): string {
    return labelForValue(EVIDENCE_FILTER_OPTIONS, evidenceFilter);
}

export type ActiveFilterPill = {
    key: 'workStatus' | 'dateScope' | 'evidenceFilter';
    label: string;
};

export function getActiveFilterPills(filters: WorkboardFilters): ActiveFilterPill[] {
    const pills: ActiveFilterPill[] = [];

    if (filters.workStatus !== DEFAULT_WORKBOARD_FILTERS.workStatus) {
        pills.push({
            key: 'workStatus',
            label: getWorkStatusFilterLabel(filters.workStatus),
        });
    }

    if (filters.dateScope !== DEFAULT_WORKBOARD_FILTERS.dateScope) {
        pills.push({
            key: 'dateScope',
            label: getDateScopeFilterLabel(filters.dateScope),
        });
    }

    if (filters.evidenceFilter !== null) {
        pills.push({
            key: 'evidenceFilter',
            label: getEvidenceFilterLabel(filters.evidenceFilter),
        });
    }

    return pills;
}

export function countPanelFilters(filters: WorkboardFilters): number {
    return getActiveFilterPills(filters).length;
}
