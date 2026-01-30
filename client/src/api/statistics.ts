import { apiClient } from '../lib/axios'

// Types
export interface MonthlyTaskStats {
    month: string
    year: number
    monthName: string
    completed: number
    created: number
}

export interface MemberStats {
    userId: string
    userName: string
    completedTasks: number
    assignedTasks: number
    completionRate: number
}

export interface TaskFrequency {
    title: string
    count: number
    groupName?: string
}

export interface GroupStatistics {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    inProgressTasks: number
    completionRate: number
    monthlyStats: MonthlyTaskStats[]
    memberStats: MemberStats[]
    mostFrequentTasks: TaskFrequency[]
    averageCompletionTime: number
}

export interface PersonalStatistics {
    totalAssigned: number
    completedTasks: number
    pendingTasks: number
    inProgressTasks: number
    completionRate: number
    monthlyStats: MonthlyTaskStats[]
    tasksByGroup: { groupId: string; groupName: string; count: number }[]
    streak: number
}

// Activity Types
export type ActivityType = 'created' | 'assigned' | 'updated' | 'completed'
export type ActivityFilter = 'all' | ActivityType

export interface DailyActivity {
    date: string // YYYY-MM-DD
    count: number
    level: 0 | 1 | 2 | 3 | 4
}

export interface ActivityLogEntry {
    id: string
    userId: string
    type: ActivityType
    taskId: string
    taskTitle: string
    groupId: string
    groupName: string
    details?: string
    createdAt: string
}

export interface ActivityLogResponse {
    activities: ActivityLogEntry[]
    meta: {
        total: number
        limit: number
        offset: number
    }
}

// API Response Types
interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

// Activity Log API Response
interface ActivityLogApiResponse {
    success: boolean
    data: ActivityLogEntry[]
    meta: {
        total: number
        limit: number
        offset: number
    }
}

// API Functions
export const statisticsApi = {
    // Gruppenstatistiken abrufen
    getGroupStatistics: async (groupId: string): Promise<GroupStatistics> => {
        const response = await apiClient.get<ApiResponse<GroupStatistics>>(
            `/groups/${groupId}/statistics`
        )
        return response.data.data
    },

    // Persönliche Statistiken abrufen
    getPersonalStatistics: async (): Promise<PersonalStatistics> => {
        const response = await apiClient.get<ApiResponse<PersonalStatistics>>(
            '/statistics/personal'
        )
        return response.data.data
    },

    // Activity heatmap data (365 days)
    getActivityHeatmap: async (): Promise<DailyActivity[]> => {
        const response = await apiClient.get<ApiResponse<DailyActivity[]>>(
            '/statistics/personal/activity'
        )
        return response.data.data
    },

    // Paginated activity log
    getActivityLog: async (
        type: ActivityFilter = 'all',
        limit = 20,
        offset = 0
    ): Promise<ActivityLogResponse> => {
        const response = await apiClient.get<ActivityLogApiResponse>(
            '/statistics/personal/activity-log',
            { params: { type, limit, offset } }
        )
        return {
            activities: response.data.data,
            meta: response.data.meta,
        }
    },
}
