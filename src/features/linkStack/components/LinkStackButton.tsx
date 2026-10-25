import { Link } from 'lucide-react'
import { MOMenuButton } from '@/features/moreOptions/components/MOMenuButton'
import { useLinkStackActions } from '@/stores/linkStackStore'

export function LinkStackButton({ ...props }) {
  const { setOpen } = useLinkStackActions()

  return (
    <MOMenuButton
      className="bg-[#1e88e5]"
      aria-label="Open link stack"
      title="Link Stack"
      onClick={() => setOpen(true)}
      {...props}
    >
      <Link className="size-6" />
    </MOMenuButton>
  )
}
