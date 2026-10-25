import { LayoutDashboard } from 'lucide-react'
import { MOMenuButton } from './MOMenuButton'
import { useDashboardActions } from '@/stores/dashboardStore'

export function DashboardButton({ ...props }) {
  const { setOpen } = useDashboardActions()

  return (
    <MOMenuButton
      className="bg-[#0a7ea4]"
      aria-label="Open dashboard"
      onClick={() => setOpen(true)}
      {...props}
    >
      <LayoutDashboard className="size-6" />
    </MOMenuButton>
  )
}
