import { Task } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { ForbiddenError, NotFoundError } from "./errors.js";

const MONTH_NAMES_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

// Helper: Check if user is member of group
const isMemberOfGroup = (group: Group, userId: string): boolean => {
  return group.members.some((m) => m.userId === userId);
};

export interface MonthlyTaskStats {
  month: string;
  year: number;
  monthName: string;
  completed: number;
  created: number;
}

export interface MemberStats {
  userId: string;
  userName: string;
  completedTasks: number;
  assignedTasks: number;
  completionRate: number;
}

export interface TaskFrequency {
  title: string;
  count: number;
  groupName?: string;
}

export interface GroupStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  monthlyStats: MonthlyTaskStats[];
  memberStats: MemberStats[];
  mostFrequentTasks: TaskFrequency[];
  averageCompletionTime: number;
}

export interface PersonalStatistics {
  totalAssigned: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  monthlyStats: MonthlyTaskStats[];
  tasksByGroup: { groupId: string; groupName: string; count: number }[];
  streak: number;
}

export class StatisticsService {
  constructor(
    private taskDAO: GenericDAO<Task>,
    private groupDAO: GenericDAO<Group>,
    private userDAO: GenericDAO<User>,
  ) {}

  async getGroupStatistics(
    groupId: string,
    userId: string,
  ): Promise<GroupStatistics> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    if (!isMemberOfGroup(group, userId)) {
      throw new ForbiddenError("Kein Zugriff auf diese Gruppe");
    }

    const allTasks = await this.taskDAO.findAll({ groupId } as Partial<Task>);
    const mainTasks = allTasks.filter((t) => !t.parentTaskId);

    const completedTasks = mainTasks.filter((t) => t.status === "completed");
    const pendingTasks = mainTasks.filter((t) => t.status === "pending");
    const inProgressTasks = mainTasks.filter((t) => t.status === "in-progress");

    // Monthly statistics (last 12 months)
    const monthlyStats = this.calculateMonthlyStats(mainTasks);

    // Member statistics
    const memberStats = await this.calculateMemberStats(group, mainTasks);

    // Most frequent completed tasks (by title)
    const mostFrequentTasks = this.calculateMostFrequentTasks(completedTasks);

    // Average completion time
    const averageCompletionTime =
      this.calculateAverageCompletionTime(completedTasks);

    return {
      totalTasks: mainTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate:
        mainTasks.length > 0
          ? Math.round((completedTasks.length / mainTasks.length) * 100)
          : 0,
      monthlyStats,
      memberStats,
      mostFrequentTasks,
      averageCompletionTime,
    };
  }

  async getPersonalStatistics(userId: string): Promise<PersonalStatistics> {
    const allGroups = await this.groupDAO.findAll({} as Partial<Group>);
    const userGroups = allGroups.filter((g) => isMemberOfGroup(g, userId));

    const allTasks: (Task & { groupName: string })[] = [];

    for (const group of userGroups) {
      const groupTasks = await this.taskDAO.findAll({
        groupId: group.id,
        assignedTo: userId,
      } as Partial<Task>);

      for (const task of groupTasks) {
        if (!task.parentTaskId) {
          allTasks.push({ ...task, groupName: group.name });
        }
      }
    }

    const completedTasks = allTasks.filter((t) => t.status === "completed");
    const pendingTasks = allTasks.filter((t) => t.status === "pending");
    const inProgressTasks = allTasks.filter((t) => t.status === "in-progress");

    const monthlyStats = this.calculateMonthlyStats(allTasks);
    const tasksByGroup = this.calculateTasksByGroup(allTasks);
    const streak = this.calculateStreak(completedTasks);

    return {
      totalAssigned: allTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate:
        allTasks.length > 0
          ? Math.round((completedTasks.length / allTasks.length) * 100)
          : 0,
      monthlyStats,
      tasksByGroup,
      streak,
    };
  }

  private calculateMonthlyStats(tasks: Task[]): MonthlyTaskStats[] {
    const monthlyStats: MonthlyTaskStats[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

      const completedInMonth = tasks.filter((t) => {
        if (t.status !== "completed" || !t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return (
          completedDate.getFullYear() === year &&
          completedDate.getMonth() === month
        );
      }).length;

      const createdInMonth = tasks.filter((t) => {
        const createdDate = new Date(t.createdAt);
        return (
          createdDate.getFullYear() === year && createdDate.getMonth() === month
        );
      }).length;

      monthlyStats.push({
        month: monthKey,
        year,
        monthName: MONTH_NAMES_DE[month] || "Unbekannt",
        completed: completedInMonth,
        created: createdInMonth,
      });
    }

    return monthlyStats;
  }

  private async calculateMemberStats(
    group: Group,
    mainTasks: Task[],
  ): Promise<MemberStats[]> {
    const memberStats: MemberStats[] = [];

    for (const member of group.members) {
      const user = await this.userDAO.findOne({
        id: member.userId,
      } as Partial<User>);

      const memberAssigned = mainTasks.filter(
        (t) => t.assignedTo === member.userId,
      );
      const memberCompleted = memberAssigned.filter(
        (t) => t.status === "completed",
      );

      memberStats.push({
        userId: member.userId,
        userName: user?.name || user?.email || "Unbekannt",
        completedTasks: memberCompleted.length,
        assignedTasks: memberAssigned.length,
        completionRate:
          memberAssigned.length > 0
            ? Math.round((memberCompleted.length / memberAssigned.length) * 100)
            : 0,
      });
    }

    memberStats.sort((a, b) => b.completedTasks - a.completedTasks);
    return memberStats;
  }

  private calculateMostFrequentTasks(completedTasks: Task[]): TaskFrequency[] {
    const taskFrequencyMap = new Map<string, number>();

    for (const task of completedTasks) {
      const title = task.title.toLowerCase().trim();
      taskFrequencyMap.set(title, (taskFrequencyMap.get(title) || 0) + 1);
    }

    return Array.from(taskFrequencyMap)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateAverageCompletionTime(completedTasks: Task[]): number {
    let totalCompletionTime = 0;
    let tasksWithCompletionTime = 0;

    for (const task of completedTasks) {
      if (task.completedAt) {
        const createdDate = new Date(task.createdAt);
        const completedDate = new Date(task.completedAt);
        const diffTime = completedDate.getTime() - createdDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        totalCompletionTime += diffDays;
        tasksWithCompletionTime++;
      }
    }

    return tasksWithCompletionTime > 0
      ? Math.round((totalCompletionTime / tasksWithCompletionTime) * 10) / 10
      : 0;
  }

  private calculateTasksByGroup(
    tasks: (Task & { groupName: string })[],
  ): { groupId: string; groupName: string; count: number }[] {
    const tasksByGroupMap = new Map<
      string,
      { groupId: string; groupName: string; count: number }
    >();

    for (const task of tasks) {
      if (!tasksByGroupMap.has(task.groupId)) {
        tasksByGroupMap.set(task.groupId, {
          groupId: task.groupId,
          groupName: task.groupName,
          count: 0,
        });
      }
      tasksByGroupMap.get(task.groupId)!.count++;
    }

    return Array.from(tasksByGroupMap.values()).sort(
      (a, b) => b.count - a.count,
    );
  }

  private calculateStreak(
    completedTasks: (Task & { groupName?: string })[],
  ): number {
    const completedDates = completedTasks
      .filter((t) => t.completedAt)
      .map((t) => {
        const d = new Date(t.completedAt!);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
      .sort()
      .reverse();

    const uniqueDates = [...new Set(completedDates)];
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

      if (uniqueDates.includes(checkDateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }
}
