import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    countPanelFilters,
    getActiveFilterPills,
    type ActiveFilterPill,
} from '../domain/workboardFilterLabels';
import type {
    DateScopeFilter,
    EvidenceFilter,
    WorkboardFilters,
    WorkStatus,
} from '../types';
import { DEFAULT_WORKBOARD_FILTERS } from '../types';

import { WorkboardFiltersSheet } from './WorkboardFiltersSheet';

type WorkboardFilterControlsProps = {
    filters: WorkboardFilters;
    onSearchChange: (searchQuery: string) => void;
    onSearchSubmit: (searchQuery: string) => void;
    onWorkStatusChange: (workStatus: WorkStatus | 'all') => void;
    onDateScopeChange: (dateScope: DateScopeFilter) => void;
    onEvidenceFilterChange: (evidenceFilter: EvidenceFilter) => void;
    onResetPanelFilters: () => void;
};

type ActiveFilterPillProps = {
    label: string;
    onRemove: () => void;
};

function ActiveFilterPillChip({ label, onRemove }: ActiveFilterPillProps) {
    return (
        <View style={styles.activePill}>
            <Text style={styles.activePillLabel}>{label}</Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${label} filter`}
                hitSlop={6}
                onPress={onRemove}
                style={({ pressed }) => [styles.activePillRemove, pressed && styles.activePillRemovePressed]}
            >
                <Ionicons name="close" size={16} color="#1E40AF" />
            </Pressable>
        </View>
    );
}

function clearFilterPill(
    pill: ActiveFilterPill,
    handlers: Pick<
        WorkboardFilterControlsProps,
        'onWorkStatusChange' | 'onDateScopeChange' | 'onEvidenceFilterChange'
    >,
) {
    switch (pill.key) {
        case 'workStatus':
            handlers.onWorkStatusChange(DEFAULT_WORKBOARD_FILTERS.workStatus);
            break;
        case 'dateScope':
            handlers.onDateScopeChange(DEFAULT_WORKBOARD_FILTERS.dateScope);
            break;
        case 'evidenceFilter':
            handlers.onEvidenceFilterChange(DEFAULT_WORKBOARD_FILTERS.evidenceFilter);
            break;
    }
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
    const [sheetVisible, setSheetVisible] = useState(false);
    const activePills = getActiveFilterPills(filters);
    const panelFilterCount = countPanelFilters(filters);

    const pillHandlers = {
        onWorkStatusChange,
        onDateScopeChange,
        onEvidenceFilterChange,
    };

    return (
        <View style={styles.container}>
            <View style={styles.toolbar}>
                <View style={styles.searchRow}>
                    <Ionicons
                        name="search"
                        size={20}
                        color="#9CA3AF"
                        style={styles.searchIcon}
                    />
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
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                        panelFilterCount > 0
                            ? `Filters, ${panelFilterCount} active`
                            : 'Filters'
                    }
                    onPress={() => setSheetVisible(true)}
                    style={({ pressed }) => [styles.filterButton, pressed && styles.filterButtonPressed]}
                >
                    <Ionicons name="options-outline" size={22} color="#374151" />
                    {panelFilterCount > 0 ? (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{panelFilterCount}</Text>
                        </View>
                    ) : null}
                </Pressable>
            </View>

            {activePills.length > 0 ? (
                <View style={styles.activePillsRow}>
                    {activePills.map((pill) => (
                        <ActiveFilterPillChip
                            key={pill.key}
                            label={pill.label}
                            onRemove={() => clearFilterPill(pill, pillHandlers)}
                        />
                    ))}
                </View>
            ) : null}

            <WorkboardFiltersSheet
                visible={sheetVisible}
                filters={filters}
                onClose={() => setSheetVisible(false)}
                onWorkStatusChange={onWorkStatusChange}
                onDateScopeChange={onDateScopeChange}
                onEvidenceFilterChange={onEvidenceFilterChange}
                onResetPanelFilters={onResetPanelFilters}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
        paddingBottom: 8,
        paddingHorizontal: 16,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 44,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D7DCE3',
        backgroundColor: '#FFFFFF',
    },
    searchIcon: {
        marginLeft: 12,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 16,
        color: '#111827',
    },
    filterButton: {
        minWidth: 44,
        minHeight: 44,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D7DCE3',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButtonPressed: {
        backgroundColor: '#F3F6FA',
    },
    filterBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#1D4ED8',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    activePillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    activePill: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 32,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#93B4E8',
        backgroundColor: '#DBEAFE',
        paddingLeft: 12,
        paddingRight: 4,
    },
    activePillLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E40AF',
    },
    activePillRemove: {
        minWidth: 32,
        minHeight: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activePillRemovePressed: {
        opacity: 0.7,
    },
});
