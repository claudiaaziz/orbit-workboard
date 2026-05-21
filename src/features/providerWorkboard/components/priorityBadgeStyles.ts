import { StyleSheet } from 'react-native';

import type { ServicePriority } from '../types';

export const priorityBadgeStyles = StyleSheet.create({
    badge: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4B5563',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        overflow: 'hidden',
    },
    normal: {},
    high: {
        color: '#9A3412',
        backgroundColor: '#FFEDD5',
    },
    urgent: {
        color: '#991B1B',
        backgroundColor: '#FEE2E2',
    },
});

export function getPriorityBadgeStyle(priority: ServicePriority) {
    const tone =
        priority === 'urgent'
            ? priorityBadgeStyles.urgent
            : priority === 'high'
                ? priorityBadgeStyles.high
                : priorityBadgeStyles.normal;

    return [priorityBadgeStyles.badge, tone];
}
