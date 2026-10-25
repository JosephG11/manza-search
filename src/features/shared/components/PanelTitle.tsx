import { cn } from '@/utilities/ui'

type PanelTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'h2' | 'h3'
}

// Plain serif title used on top of every toolbox panel/container.
export function PanelTitle({ as: Tag = 'div', className, ...props }: PanelTitleProps) {
  return <Tag className={cn('w-fit text-center font-serif text-white', className)} {...props} />
}

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode
  titleClassName?: string
}

// Menu-colored box that wraps a toolbox popover, with an optional centered title on top.
export function Panel({ title, titleClassName, className, children, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-primary border-2 border-black bg-menu p-4 font-serif text-white',
        className,
      )}
      {...props}
    >
      {title && <PanelTitle className={cn('text-2xl', titleClassName)}>{title}</PanelTitle>}

      {children}
    </div>
  )
}
