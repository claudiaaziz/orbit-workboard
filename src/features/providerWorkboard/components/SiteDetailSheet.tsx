import type { ReactNode } from 'react';
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

import type { SiteDetailModel, SiteDetailVisitItem } from '../domain/siteDetail';

import { getPriorityBadgeStyle } from './priorityBadgeStyles';

type SiteDetailSheetProps = {
    visible: boolean;
    model: SiteDetailModel | null;
    onClose: () => void;
    onVisitPress?: (visitId: string) => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

function WarningChips({ items }: { items: string[] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <View style={styles.chipRow}>
            {items.map((item) => (
                <Text key={item} style={styles.warningChip}>
                    {item}
                </Text>
            ))}
        </View>
    );
}

function VisitTimelineRow({
    visit,
    onPress,
}: {
    visit: SiteDetailVisitItem;
    onPress?: (visitId: string) => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${visit.equipmentLabel}, ${visit.status}`}
            onPress={() => onPress?.(visit.visitId)}
            style={({ pressed }) => [styles.visitRow, pressed && styles.visitRowPressed]}
        >
            <View style={styles.visitRowBody}>
                <Text style={styles.visitEquipment}>{visit.equipmentLabel}</Text>
                <Text style={styles.visitMeta}>
                    {visit.serviceType.replace('_', ' ')} · {visit.status.replaceAll('_', ' ')}
                </Text>
                <Text style={styles.visitTime}>{visit.timeLabel}</Text>
                {visit.assignedTech ? (
                    <Text style={styles.visitTech}>{visit.assignedTech}</Text>
                ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>
    );
}

export function SiteDetailSheet({
    visible,
    model,
    onClose,
    onVisitPress,
}: SiteDetailSheetProps) {
    return (
        <Modal
            visible={visible && model !== null}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            {model ? (
                <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.siteName}>{model.siteName}</Text>
                            <Text style={styles.customerName}>{model.customerName}</Text>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Close site details"
                            onPress={onClose}
                            hitSlop={8}
                            style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}
                        >
                            <Text style={styles.closeLabel}>Close</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text
                            style={[styles.priorityBadgeAlign, ...getPriorityBadgeStyle(model.priority)]}
                        >
                            {model.priority.toUpperCase()}
                        </Text>

                        <Text style={styles.statusSentence}>{model.statusSentence}</Text>

                        <Section title="Address">
                            <Text style={styles.bodyText}>{model.addressLine}</Text>
                        </Section>

                        <Section title="Contact">
                            <Text style={styles.bodyText}>{model.contactName}</Text>
                            <Text style={styles.mutedText}>{model.contactPhone}</Text>
                        </Section>

                        <Section title="Next visit">
                            <Text
                                style={
                                    model.nextVisitLabel
                                        ? styles.nextVisitTime
                                        : styles.bodyText
                                }
                            >
                                {model.nextVisitLabel ?? 'No upcoming active visits'}
                            </Text>
                        </Section>

                        {model.warnings.length > 0 ? (
                            <Section title="Warnings">
                                <WarningChips items={model.warnings} />
                            </Section>
                        ) : null}

                        <Section title="Evidence">
                            <Text style={styles.bodyText}>{model.evidenceSummary}</Text>
                        </Section>

                        {model.hardwareWarnings.length > 0 ? (
                            <Section title="Required checks">
                                <View style={styles.hardwareList}>
                                    {model.hardwareWarnings.map((warning) => (
                                        <View key={warning} style={styles.hardwareRow}>
                                            <Text style={styles.hardwareBullet}>•</Text>
                                            <Text style={styles.hardwareItem}>{warning}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Section>
                        ) : null}

                        <Section title="Visits">
                            {model.visitTimeline.map((visit) => (
                                <VisitTimelineRow
                                    key={visit.visitId}
                                    visit={visit}
                                    onPress={onVisitPress}
                                />
                            ))}
                        </Section>
                    </ScrollView>
                </SafeAreaView>
            ) : null}
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
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    headerText: {
        flex: 1,
        gap: 4,
    },
    siteName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    customerName: {
        fontSize: 15,
        color: '#6B7280',
    },
    closeButton: {
        minHeight: 44,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    closePressed: {
        opacity: 0.7,
    },
    closeLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1D4ED8',
    },
    scrollContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
    priorityBadgeAlign: {
        alignSelf: 'flex-start',
    },
    statusSentence: {
        fontSize: 16,
        lineHeight: 22,
        color: '#111827',
        fontWeight: '500',
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    bodyText: {
        fontSize: 15,
        color: '#111827',
    },
    nextVisitTime: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 22,
    },
    mutedText: {
        fontSize: 14,
        color: '#6B7280',
    },
    hardwareList: {
        gap: 6,
    },
    hardwareRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    hardwareBullet: {
        fontSize: 12,
        lineHeight: 18,
        color: '#9CA3AF',
        marginTop: 1,
    },
    hardwareItem: {
        flex: 1,
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    warningChip: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9A3412',
        backgroundColor: '#FFEDD5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        overflow: 'hidden',
    },
    visitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        marginBottom: 8,
    },
    visitRowPressed: {
        backgroundColor: '#F3F4F6',
    },
    visitRowBody: {
        flex: 1,
        gap: 2,
    },
    visitEquipment: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    visitMeta: {
        fontSize: 13,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    visitTime: {
        fontSize: 13,
        color: '#374151',
    },
    visitTech: {
        fontSize: 12,
        color: '#6B7280',
    },
});
