import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { hasActiveFilters } from '../domain/workboardFilters';
import {
    DATE_SCOPE_FILTER_OPTIONS,
    EVIDENCE_FILTER_OPTIONS,
    WORK_STATUS_FILTER_OPTIONS,
    type FilterOption,
} from '../domain/workboardFilterLabels';
import type {
    DateScopeFilter,
    EvidenceFilter,
    WorkboardFilters,
    WorkStatus,
} from '../types';

type WorkboardFilterControlsProps = {
    filters: WorkboardFilters;
    onSearchChange: (searchQuery: string) => void;
    onSearchSubmit: (searchQuery: string) => void;
    onWorkStatusChange: (workStatus: WorkStatus | 'all') => void;
    onDateScopeChange: (dateScope: DateScopeFilter) => void;
    onEvidenceFilterChange: (evidenceFilter: EvidenceFilter) => void;
    onResetPanelFilters: () => void;
};

type FilterChipGroupProps<T extends string> = {
    label: string;
    options: FilterOption<T>[];
    selectedValue: T;
    onSelect: (value: T) => void;
};

function FilterChipGroup<T extends string>({
    label,
    options,
    selectedValue,
    onSelect,
}: FilterChipGroupProps<T>) {
    return (
        <View style={styles.group}>
            <Text style={styles.groupLabel}>{label}</Text>
            <View style={styles.chipRow}>
                {options.map((option) => {
                    const selected = selectedValue === option.value;
                    return (
                        <Pressable
                            key={option.value}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            onPress={() => onSelect(option.value)}
                            style={({ pressed }) => [
                                styles.chip,
                                selected && styles.chipSelected,
                                pressed && styles.chipPressed,
                            ]}
                        >
                            <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

export function WorkboardFilterControls({
    filters,
    onSearchChange,
    onSearchSubmit,
    onWorkStatusChange,
    onDateScopeChange,
    onEvidenceFilterChange,
    onResetPanelFilters,
}: WorkboardFilterControlsProps) {
    const evidenceSelection = filters.evidenceFilter ?? 'none';

    return (
        <View style={styles.container}>
            <TextInput
                accessibilityLabel="Search workboard"
                placeholder="Search sites, customers, equipment"
                placeholderTextColor="#9CA3AF"
                value={filters.searchQuery}
                onChangeText={onSearchChange}
                onSubmitEditing={(event) => onSearchSubmit(event.nativeEvent.text)}
                style={styles.searchInput}
                returnKeyType="search"
                clearButtonMode="while-editing"
            />

            <FilterChipGroup
                label="Status"
                options={WORK_STATUS_FILTER_OPTIONS}
                selectedValue={filters.workStatus}
                onSelect={onWorkStatusChange}
            />

            <FilterChipGroup
                label="Date"
                options={DATE_SCOPE_FILTER_OPTIONS}
                selectedValue={filters.dateScope}
                onSelect={onDateScopeChange}
            />

            <FilterChipGroup
                label="Evidence"
                options={EVIDENCE_FILTER_OPTIONS}
                selectedValue={evidenceSelection}
                onSelect={(value) =>
                    onEvidenceFilterChange(value === 'none' ? null : value)
                }
            />

            {hasActiveFilters(filters) ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Reset filters"
                    onPress={onResetPanelFilters}
                    style={({ pressed }) => [styles.resetButton, pressed && styles.chipPressed]}
                >
                    <Text style={styles.resetLabel}>Reset filters</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
        paddingBottom: 8,
        paddingHorizontal: 16,
    },
    searchInput: {
        minHeight: 44,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D7DCE3',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#111827',
    },
    group: {
        gap: 6,
    },
    groupLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        minHeight: 40,
        justifyContent: 'center',
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D7DCE3',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
    },
    chipSelected: {
        borderColor: '#1D4ED8',
        backgroundColor: '#DBEAFE',
    },
    chipPressed: {
        opacity: 0.85,
    },
    chipLabel: {
        fontSize: 14,
        color: '#374151',
    },
    chipLabelSelected: {
        color: '#1D4ED8',
        fontWeight: '600',
    },
    resetButton: {
        alignSelf: 'flex-start',
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    resetLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1D4ED8',
    },
});
