import { MessagesSquare } from 'lucide-react'
import { MOMenuButton } from '../../moreOptions/components/MOMenuButton'

export function MessengerButton({ ...props }) {
  return (
    <MOMenuButton className="bg-[#ff1c00]" aria-label="Open messenger" {...props}>
      <MessagesSquare className="size-6" />
    </MOMenuButton>
  )
}
