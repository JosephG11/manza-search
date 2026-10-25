import { Check, Pencil } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { PanelTitle } from '@/features/shared/components/PanelTitle'

type DashboardWidgetProps = {
  title?: React.ReactNode
  editable?: boolean
  editing?: boolean
  // When missing, the pencil is shown disabled with `editDisabledReason` as its tooltip.
  onEditToggle?: () => void
  editDisabledReason?: string
  className?: string
  children?: React.ReactNode
}

// Gray rounded container with its title on top.
export function DashboardWidget({
  title,
  editable,
  editing,
  onEditToggle,
  editDisabledReason = 'Em breve',
  className,
  children,
}: DashboardWidgetProps) {
  return (
    <section
      className={cn(
        'relative flex flex-col gap-3 rounded-primary bg-neutral-500 p-3 pt-2',
        className,
      )}
    >
      {(title || editable) && (
        <div className="flex min-h-8 items-start justify-center">
          {title && (
            <PanelTitle as="h3" className="text-lg">
              {title}
            </PanelTitle>
          )}

          {editable && (
            <button
              type="button"
              disabled={!onEditToggle}
              onClick={onEditToggle}
              title={onEditToggle ? (editing ? 'Done' : 'Edit') : editDisabledReason}
              aria-label={editing ? 'Finish editing widget' : 'Edit widget'}
              aria-pressed={editing}
              className={cn(
                'absolute right-3 top-2 flex size-7 items-center justify-center rounded-full bg-white text-neutral-500 hover:text-black disabled:cursor-not-allowed disabled:hover:text-neutral-500',
                editing && 'bg-black text-white hover:text-white/70',
              )}
            >
              {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
            </button>
          )}
        </div>
      )}

      {children}
    </section>
  )
}
