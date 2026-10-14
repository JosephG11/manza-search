import { ArrowUpRight } from 'lucide-react'

export function ExternalLinkBadge() {
  return (
    <span
      role="img"
      aria-label="Opens in a new tab"
      className="pointer-events-none absolute left-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/70 text-white"
    >
      <ArrowUpRight className="size-4" />
    </span>
  )
}
