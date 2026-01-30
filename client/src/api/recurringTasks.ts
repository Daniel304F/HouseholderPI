import { apiClient } from '../lib/axios'

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type AssignmentStrategy = 'fixed' | 'rotation'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface RecurringTaskTemplate {
    id: string
    groupId: string
    title: string
    description?: string
    priority: TaskPriority
    frequency: RecurringFrequency
    assignmentStrategy: AssignmentStrategy
    fixedAssignee?: string
    rotationOrder?: string[]
    currentRotationIndex: number
    dueDay: number
    isActive: boolean
    lastGeneratedAt?: string
    nextSuggestedAssignee?: string
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface CreateRecurringTaskInput {
    title: string
    description?: string
    priority?: TaskPriority
    frequency: RecurringFrequency
    assignmentStrategy: AssignmentStrategy
    fixedAssignee?: string
    rotationOrder?: string[]
    dueDay: number
}

export interface UpdateRecurringTaskInput {
    title?: string
    description?: string
    priority?: TaskPriority
    frequency?: RecurringFrequency
    assignmentStrategy?: AssignmentStrategy
    fixedAssignee?: string | null
    rotationOrder?: string[]
    dueDay?: number
}

interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

export const recurringTasksApi = {
    getTemplates: async (groupId: string): Promise<RecurringTaskTemplate[]> => {
        const response = await apiClient.get<
            ApiResponse<RecurringTaskTemplate[]>
        >(`/groups/${groupId}/recurring-tasks`)
        return response.data.data
    },

    getTemplate: async (
        groupId: string,
        templateId: string
    ): Promise<RecurringTaskTemplate> => {
        const response = await apiClient.get<
            ApiResponse<RecurringTaskTemplate>
        >(`/groups/${groupId}/recurring-tasks/${templateId}`)
        return response.data.data
    },

    createTemplate: async (
        groupId: string,
        data: CreateRecurringTaskInput
    ): Promise<RecurringTaskTemplate> => {
        const response = await apiClient.post<
            ApiResponse<RecurringTaskTemplate>
        >(`/groups/${groupId}/recurring-tasks`, data)
        return response.data.data
    },

    updateTemplate: async (
        groupId: string,
        templateId: string,
        data: UpdateRecurringTaskInput
    ): Promise<RecurringTaskTemplate> => {
        const response = await apiClient.patch<
            ApiResponse<RecurringTaskTemplate>
        >(`/groups/${groupId}/recurring-tasks/${templateId}`, data)
        return response.data.data
    },

    deleteTemplate: async (
        groupId: string,
        templateId: string
    ): Promise<void> => {
        await apiClient.delete(`/groups/${groupId}/recurring-tasks/${templateId}`)
    },

    toggleTemplate: async (
        groupId: string,
        templateId: string
    ): Promise<RecurringTaskTemplate> => {
        const response = await apiClient.post<
            ApiResponse<RecurringTaskTemplate>
        >(`/groups/${groupId}/recurring-tasks/${templateId}/toggle`)
        return response.data.data
    },

    generateTask: async (
        groupId: string,
        templateId: string,
        assignedTo?: string
    ): Promise<void> => {
        await apiClient.post(
            `/groups/${groupId}/recurring-tasks/${templateId}/generate`,
            { assignedTo }
        )
    },
}
