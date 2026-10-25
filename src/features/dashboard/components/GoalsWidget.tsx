'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { ConvexError } from 'convex/values'
import type { FunctionReturnType } from 'convex/server'
import { api } from '../../../../convex/_generated/api'
import { useMutationState } from '@/hooks/useMutationState'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/utilities/ui'
import { GOAL_PRESETS } from '../data'
import { useDashboardData } from '../useDashboardData'
import { DashboardWidget } from './DashboardWidget'

type Goal = FunctionReturnType<typeof api.dashboard.getGoals>[number]

const checkboxStyles =
  'size-5 border-white data-[state=checked]:bg-white data-[state=checked]:text-black'

function showError(error: unknown) {
  toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred')
}

function GoalItem({ goal, editing }: { goal: Goal; editing: boolean }) {
  const { mutate: toggleGoal, pending: toggling } = useMutationState(api.dashboard.toggleGoal)
  const { mutate: removeGoal, pending: removing } = useMutationState(api.dashboard.removeGoal)
  const done = goal.completedAt !== undefined

  return (
    <li className="flex items-center gap-2">
      <Checkbox
        checked={done}
        disabled={toggling}
        onCheckedChange={() => toggleGoal({ goalId: goal._id }).catch(showError)}
        aria-label={done ? `Mark ${goal.text} as not done` : `Mark ${goal.text} as done`}
        className={checkboxStyles}
      />

      <span className={cn('min-w-0 flex-1 break-words', done && 'line-through opacity-60')}>
        {goal.text}
      </span>

      {editing && (
        <button
          type="button"
          disabled={removing}
          onClick={() => removeGoal({ goalId: goal._id }).catch(showError)}
          aria-label={`Remove ${goal.text}`}
          className="shrink-0 hover:text-red-500 disabled:opacity-50"
        >
          <X className="size-4" />
        </button>
      )}
    </li>
  )
}

function AddGoalForm() {
  const { mutate: addGoal, pending } = useMutationState(api.dashboard.addGoal)
  const [text, setText] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!text.trim() || pending) return

    try {
      await addGoal({ text })
      setText('')
    } catch (error) {
      showError(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        autoFocus
        value={text}
        maxLength={80}
        onChange={(event) => setText(event.target.value)}
        placeholder="New goal + Enter"
        aria-label="New goal"
        className="h-8 w-full rounded border-0 bg-white px-2 text-base text-black outline-none"
      />
    </form>
  )
}

export function GoalsWidget({ className }: { className?: string }) {
  const { isAuthenticated, goals } = useDashboardData()
  const [editing, setEditing] = useState(false)

  return (
    <DashboardWidget
      title="My Goals"
      editable
      editing={editing}
      onEditToggle={isAuthenticated ? () => setEditing((value) => !value) : undefined}
      editDisabledReason="Sign in to edit"
      className={className}
    >
      {editing && <AddGoalForm />}

      <ul className="custom-scrollbar max-h-40 flex-1 space-y-1 overflow-y-auto pr-2 text-lg text-white">
        {!isAuthenticated &&
          GOAL_PRESETS.map((goal) => (
            <li key={goal} className="flex items-center gap-2">
              <Checkbox disabled aria-label={goal} className={checkboxStyles} />
              {goal}
            </li>
          ))}

        {goals?.map((goal) => (
          <GoalItem key={goal._id} goal={goal} editing={editing} />
        ))}
      </ul>

      {goals?.length === 0 && !editing && (
        <p className="text-center text-white/70">No goals yet. Click the pencil to add one.</p>
      )}
    </DashboardWidget>
  )
}
