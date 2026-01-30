/**
 * Zentralisierte Query Key Factory für React Query
 * Ermöglicht konsistente Cache-Invalidierung und -Zugriff
 */
export const queryKeys = {
    // Friends
    friends: {
        all: ['friends'] as const,
        requests: ['friends', 'requests'] as const,
        sent: ['friends', 'sent'] as const,
    },

    // Groups
    groups: {
        all: ['groups'] as const,
        detail: (id: string) => ['group', id] as const,
    },

    // Tasks
    tasks: {
        my: ['myTasks'] as const,
        byGroup: (groupId: string) => ['tasks', groupId] as const,
    },

    // Statistics
    statistics: {
        personal: ['personalStatistics'] as const,
        group: (groupId: string) => ['groupStatistics', groupId] as const,
        activityHeatmap: ['activityHeatmap'] as const,
        activityLog: (filter: string, limit: number) =>
            ['activityLog', filter, limit] as const,
    },

    // User
    user: {
        current: ['user'] as const,
    },
} as const
