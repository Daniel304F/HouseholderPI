import type { GroupMember } from '../../../api/groups'
import type { AssignmentStrategy } from '../../../api/recurringTasks'
import { ToggleButton } from '../../ui'

interface RecurringTaskAssignmentFieldProps {
    members: GroupMember[]
    strategy: AssignmentStrategy
    fixedAssignee: string
    rotationOrder: string[]
    onStrategyChange: (strategy: AssignmentStrategy) => void
    onFixedAssigneeChange: (assigneeId: string) => void
    onToggleRotationMember: (userId: string) => void
}

export const RecurringTaskAssignmentField = ({
    members,
    strategy,
    fixedAssignee,
    rotationOrder,
    onStrategyChange,
    onFixedAssigneeChange,
    onToggleRotationMember,
}: RecurringTaskAssignmentFieldProps) => {
    return (
        <>
            <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Zuweisung
                </label>
                <div className="flex gap-2">
                    <ToggleButton
                        selected={strategy === 'rotation'}
                        onClick={() => onStrategyChange('rotation')}
                        className="flex-1"
                    >
                        Rotation
                    </ToggleButton>
                    <ToggleButton
                        selected={strategy === 'fixed'}
                        onClick={() => onStrategyChange('fixed')}
                        className="flex-1"
                    >
                        Feste Person
                    </ToggleButton>
                </div>
            </div>

            {strategy === 'fixed' ? (
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Zugewiesen an
                    </label>
                    <select
                        value={fixedAssignee}
                        onChange={(event) => onFixedAssigneeChange(event.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <option value="">Niemand</option>
                        {members.map((member) => (
                            <option key={member.userId} value={member.userId}>
                                {member.userName}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Rotationsreihenfolge
                    </label>
                    <div className="space-y-1">
                        {members.map((member) => (
                            <label
                                key={member.userId}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <input
                                    type="checkbox"
                                    checked={rotationOrder.includes(member.userId)}
                                    onChange={() => onToggleRotationMember(member.userId)}
                                    className="size-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
                                />
                                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                    {member.userName}
                                </span>
                            </label>
                        ))}
                    </div>
                    {rotationOrder.length === 0 && (
                        <p className="mt-1 text-xs text-error-500">
                            Mindestens eine Person auswaehlen
                        </p>
                    )}
                </div>
            )}
        </>
    )
}
