import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    DATE_SCOPE_FILTER_OPTIONS,
    EVIDENCE_FILTER_OPTIONS,
    WORK_STATUS_FILTER_OPTIONS,
    type FilterChipOption,
} from '../domain/workboardFilterLabels';
import type {
    DateScopeFilter,
    EvidenceFilter,
    WorkboardFilters,
    WorkStatus,
} from '../types';

type WorkboardFiltersSheetProps = {
    visible: boolean;
    filters: WorkboardFilters;
    onClose: () => void;
    onWorkStatusChange: (workStatus: WorkStatus | 'all') => void;
    onDateScopeChange: (dateScope: DateScopeFilter) => void;
    onEvidenceFilterChange: (evidenceFilter: EvidenceFilter) => void;
    onResetPanelFilters: () => void;
};

type FilterChipGroupProps<T extends string> = {
    label: string;
    options: FilterChipOption<T>[];
    selectedValue?: T | null;
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
            <View style={styles.chipWrap}>
                {options.map((option) => {
                    const selected = selectedValue === option.value;
                    return (
                        <Pressable
                            key={option.value}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            hitSlop={4}
                            onPress={() => onSelect(option.value)}
                            style={[styles.chip, selected && styles.chipSelected]}
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

export function WorkboardFiltersSheet({
    visible,
    filters,
    onClose,
    onWorkStatusChange,
    onDateScopeChange,
    onEvidenceFilterChange,
    onResetPanelFilters,
}: WorkboardFiltersSheetProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Filters</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close filters"
                        onPress={onClose}
                        hitSlop={8}
                        style={({ pressed }) => [styles.doneButton, pressed && styles.donePressed]}
                    >
                        <Text style={styles.doneLabel}>Done</Text>
                    </Pressable>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <FilterChipGroup
                        label="Status"
                        options={WORK_STATUS_FILTER_OPTIONS}
                        selectedValue={filters.workStatus}
                        onSelect={onWorkStatusChange}
                    />

                    <FilterChipGroup
                        label="When"
                        options={DATE_SCOPE_FILTER_OPTIONS}
                        selectedValue={filters.dateScope}
                        onSelect={onDateScopeChange}
                    />

                    <FilterChipGroup
                        label="Evidence"
                        options={EVIDENCE_FILTER_OPTIONS}
                        selectedValue={filters.evidenceFilter}
                        onSelect={(value) => onEvidenceFilterChange(value)}
                    />

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Reset all filters"
                        onPress={onResetPanelFilters}
                        style={({ pressed }) => [styles.resetButton, pressed && styles.resetPressed]}
                    >
                        <Ionicons name="refresh" size={18} color="#6B7280" />
                        <Text style={styles.resetLabel}>Reset filters</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheet: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    doneButton: {
        minHeight: 44,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    donePressed: {
        opacity: 0.7,
    },
    doneLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1D4ED8',
    },
    scrollContent: {
        padding: 16,
        gap: 20,
        paddingBottom: 32,
    },
    group: {
        gap: 8,
    },
    groupLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    chipWrap: {
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
        paddingVertical: 8,
    },
    chipSelected: {
        borderColor: '#1D4ED8',
        backgroundColor: '#DBEAFE',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 44,
        marginTop: 8,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D7DCE3',
    },
    resetPressed: {
        backgroundColor: '#F9FAFB',
    },
    resetLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
});
