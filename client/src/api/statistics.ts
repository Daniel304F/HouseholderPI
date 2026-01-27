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

// API Response Types
interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
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
}
